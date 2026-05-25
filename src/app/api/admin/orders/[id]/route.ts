import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { requireAdmin } from "@/lib/admin-auth";
import { adminGetOrder, adminUpdateOrder } from "@/services/admin";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  const auth = await requireAdmin("orders");
  if (auth.error) return auth.error;
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = await requireAdmin("orders");
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const body = z
      .object({
        status: z.string().optional(),
        paymentStatus: z.string().optional(),
      })
      .refine((d) => d.status ?? d.paymentStatus, {
        message: "Provide status and/or paymentStatus",
      })
      .parse(await request.json());
    if (
      body.paymentStatus &&
      !hasAdminPermission(auth.role!, "orders:payment")
    ) {
      return NextResponse.json(
        { error: "Forbidden: cannot change payment status" },
        { status: 403 }
      );
    }
    const order = await adminUpdateOrder(id, {
      status: body.status,
      paymentStatus: body.paymentStatus,
    });
    return NextResponse.json(order);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
