import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

function generateCode(name?: string | null) {
  const base = (name ?? "BAG")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();
  return `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function ensureReferralCode(userId: string) {
  if (!(await isDatabaseReady())) return "DEMO1234";
  const user = await getPrisma().user.findUnique({ where: { id: userId } });
  if (!user) return null;
  if (user.referralCode) return user.referralCode;

  let code = generateCode(user.name);
  for (let i = 0; i < 5; i++) {
    const exists = await getPrisma().user.findUnique({
      where: { referralCode: code },
    });
    if (!exists) break;
    code = generateCode(user.name);
  }

  const updated = await getPrisma().user.update({
    where: { id: userId },
    data: { referralCode: code },
  });
  return updated.referralCode;
}

export async function applyReferralCode(
  newUserEmail: string,
  referralCode: string
) {
  if (!(await isDatabaseReady())) return null;
  const referrer = await getPrisma().user.findUnique({
    where: { referralCode: referralCode.toUpperCase() },
  });
  if (!referrer) return null;

  await getPrisma().user.update({
    where: { email: newUserEmail },
    data: { referredById: referrer.id },
  });
  return referrer;
}

export async function validateReferralDiscount(code: string) {
  if (!(await isDatabaseReady())) {
    if (code.toUpperCase() === "FRIEND10") return { valid: true, discount: 100 };
    return null;
  }
  const user = await getPrisma().user.findUnique({
    where: { referralCode: code.toUpperCase() },
  });
  if (!user) return null;
  return { valid: true, discount: 150, referrerId: user.id };
}
