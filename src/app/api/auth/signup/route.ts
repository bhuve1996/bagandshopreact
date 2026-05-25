import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/services/email";
import { applyReferralCode, ensureReferralCode } from "@/services/referrals";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    if (!(await isDatabaseReady())) {
      return NextResponse.json(
        { error: "Registration requires database. Use demo login." },
        { status: 503 }
      );
    }

    const existing = await getPrisma().user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await getPrisma().user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    if (body.referralCode) {
      await applyReferralCode(email, body.referralCode);
    }
    await ensureReferralCode(user.id);
    await sendWelcomeEmail(email, body.name);

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
