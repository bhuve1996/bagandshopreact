import { EMAIL_FROM, getResend, isResendConfigured } from "@/lib/email/resend";
import { getSiteBrand } from "@/lib/site-brand";

async function storeName() {
  const brand = await getSiteBrand();
  return brand.name;
}

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

  const brand = await storeName();
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Welcome to ${brand}`,
    html: `<p>Hi ${name},</p><p>Thanks for joining ${brand} — design-led accessories for everyday life.</p>`,
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
  const brand = await storeName();
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `Complete your ${brand} order`,
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

export async function sendReviewRequestEmail(payload: {
  to: string;
  orderNumber: string;
  reviewUrl: string;
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>How was your order?</h1>
      <p>Your order <strong>#${payload.orderNumber}</strong> was delivered. We'd love a quick review of your items.</p>
      <p><a href="${payload.reviewUrl}" style="display:inline-block;padding:12px 24px;background:#1c1917;color:#fff;text-decoration:none;border-radius:999px">Leave a review</a></p>
    </div>
  `;
  if (!isResendConfigured()) {
    console.log("[email:mock] Review request →", payload.to, payload.orderNumber);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const brand = await storeName();
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `Review your ${brand} order ${payload.orderNumber}`,
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}

export async function sendPaymentReminderEmail(payload: {
  to: string;
  orderNumber: string;
  total: number;
  checkoutUrl: string;
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>Complete your payment</h1>
      <p>Order <strong>#${payload.orderNumber}</strong> (${formatInr(payload.total)}) is still awaiting payment.</p>
      <p><a href="${payload.checkoutUrl}" style="display:inline-block;padding:12px 24px;background:#1c1917;color:#fff;text-decoration:none;border-radius:999px">Pay now</a></p>
    </div>
  `;
  if (!isResendConfigured()) {
    console.log("[email:mock] Payment reminder →", payload.to, payload.orderNumber);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `Complete payment — ${payload.orderNumber}`,
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}

export async function sendBackInStockEmail(payload: {
  to: string;
  productName: string;
  productUrl: string;
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>Back in stock</h1>
      <p><strong>${payload.productName}</strong> is available again.</p>
      <p><a href="${payload.productUrl}" style="display:inline-block;padding:12px 24px;background:#1c1917;color:#fff;text-decoration:none;border-radius:999px">Shop now</a></p>
    </div>
  `;
  if (!isResendConfigured()) {
    console.log("[email:mock] Back in stock →", payload.to, payload.productName);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `${payload.productName} is back in stock`,
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}

export async function sendLowStockAdminEmail(payload: {
  to: string;
  products: { name: string; stock: number; slug: string }[];
  adminUrl: string;
}) {
  const rows = payload.products
    .map(
      (p) =>
        `<li><a href="${payload.adminUrl}/products">${p.name}</a> — ${p.stock} left</li>`
    )
    .join("");
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>Low stock alert</h1>
      <ul>${rows}</ul>
      <p><a href="${payload.adminUrl}/products">Manage inventory</a></p>
    </div>
  `;
  if (!isResendConfigured()) {
    console.log("[email:mock] Low stock →", payload.products.length, "products");
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `Low stock: ${payload.products.length} product(s)`,
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}

export async function sendCouponExpiryAdminEmail(payload: {
  to: string;
  coupons: { code: string; expiresAt: string }[];
}) {
  const rows = payload.coupons
    .map((c) => `<li><strong>${c.code}</strong> — expired ${c.expiresAt}</li>`)
    .join("");
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>Coupons deactivated</h1>
      <p>The following coupons were auto-deactivated after expiry:</p>
      <ul>${rows}</ul>
    </div>
  `;
  if (!isResendConfigured()) {
    console.log("[email:mock] Coupon expiry →", payload.coupons.length);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: `${payload.coupons.length} coupon(s) expired`,
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}

export async function sendAbandonedCartFollowUpEmail(payload: {
  to: string;
  items: { name: string; quantity: number }[];
  subtotal: number;
  recoveryUrl: string;
  stage: number;
}) {
  const brand = await storeName();
  const subjectByStage = [
    `Complete your ${brand} order`,
    "Still thinking it over?",
    "Last chance — your cart expires soon",
  ];
  const headlineByStage = [
    "Your cart is waiting",
    "Your items are still in your bag",
    "Final reminder — complete checkout",
  ];
  const list = payload.items
    .map((i) => `<li>${i.name} × ${i.quantity}</li>`)
    .join("");
  const stage = Math.min(payload.stage, 2);
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h1>${headlineByStage[stage]}</h1>
      <p>You left items in your bag. Complete checkout before they sell out.</p>
      <ul>${list}</ul>
      <p><strong>Subtotal: ${formatInr(payload.subtotal)}</strong></p>
      <p><a href="${payload.recoveryUrl}" style="display:inline-block;padding:12px 24px;background:#1c1917;color:#fff;text-decoration:none;border-radius:999px">Return to cart</a></p>
    </div>
  `;

  if (!isResendConfigured()) {
    console.log("[email:mock] Abandoned cart stage", stage + 1, "→", payload.to);
    return { ok: true, mock: true };
  }
  const resend = getResend();
  if (!resend) return { ok: false };
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: payload.to,
    subject: subjectByStage[stage],
    html,
  });
  return error ? { ok: false, error } : { ok: true };
}
