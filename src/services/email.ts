import { EMAIL_FROM, getResend, isResendConfigured } from "@/lib/email/resend";

type OrderEmailPayload = {
  to: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  const itemsHtml = payload.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${i.name} × ${i.quantity}</td><td align="right">${formatInr(i.price * i.quantity)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
      <h1 style="font-size:24px">Thank you for your order</h1>
      <p>Order <strong>#${payload.orderNumber}</strong> is confirmed.</p>
      <table width="100%" style="margin:24px 0;border-top:1px solid #e7e5e4">
        ${itemsHtml}
      </table>
      <p style="font-size:18px;font-weight:600">Total: ${formatInr(payload.total)}</p>
      <p style="color:#78716c;font-size:14px">We'll notify you when your order ships.</p>
    </div>
  `;

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:mock] Order confirmation →", payload.to, payload.orderNumber);
    }
    return { ok: true, mock: true };
  }

  const resend = getResend();
  if (!resend) return { ok: false };

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `Order confirmed — ${payload.orderNumber}`,
    html,
  });

  if (error) {
    console.error("[email]", error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (!isResendConfigured()) {
    console.log("[email:mock] Welcome →", to);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Welcome to Bag & Shop",
    html: `<p>Hi ${name},</p><p>Thanks for joining Bag & Shop — design-led accessories for everyday life.</p>`,
  });
  return { ok: true };
}

export async function sendAbandonedCartEmail(payload: {
  to: string;
  items: { name: string; quantity: number }[];
  subtotal: number;
  recoveryUrl: string;
}) {
  const list = payload.items
    .map((i) => `<li>${i.name} × ${i.quantity}</li>`)
    .join("");
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>Your cart is waiting</h1>
      <p>You left items in your bag. Complete checkout before they sell out.</p>
      <ul>${list}</ul>
      <p><strong>Subtotal: ${formatInr(payload.subtotal)}</strong></p>
      <p><a href="${payload.recoveryUrl}" style="display:inline-block;padding:12px 24px;background:#1c1917;color:#fff;text-decoration:none;border-radius:999px">Return to cart</a></p>
    </div>
  `;

  if (!isResendConfigured()) {
    console.log("[email:mock] Abandoned cart →", payload.to);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: "Complete your Bag & Shop order",
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}

export async function sendShippingUpdateEmail(payload: {
  to: string;
  orderNumber: string;
  status: string;
}) {
  const html = `<p>Your order <strong>#${payload.orderNumber}</strong> is now <strong>${payload.status}</strong>.</p>`;
  if (!isResendConfigured()) {
    console.log("[email:mock] Shipping →", payload.orderNumber, payload.status);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `Order ${payload.orderNumber} — ${payload.status}`,
    html,
  });
  return { ok: true };
}
