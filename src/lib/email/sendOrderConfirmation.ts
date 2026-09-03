import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

interface EmailOrder {
  order_number: string;
  total: number;
  subtotal: number;
  discount_amount?: number;
  custom_name_charge?: number;
  coupon_code?: string | null;
  shipping_amount: number;
  payment_method_label?: string;
  payment_proof_url?: string | null;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

interface EmailOrderItem {
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  total_price: number;
}

function buildOrderConfirmationHtml(order: EmailOrder, items: EmailOrderItem[]): string {
  const address = order.shipping_address;
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <div style="font-weight:600;color:#2b2b2b;">${item.product_name}</div>
            ${item.variant_name ? `<div style="font-size:12px;color:#888;">${item.variant_name}</div>` : ""}
            <div style="font-size:12px;color:#888;">Qty: ${item.quantity}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#2b2b2b;">
            ${formatPrice(item.total_price)}
          </td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#faf6f0;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
      <div style="background:#c9d6c1;padding:32px 24px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#2b2b2b;">Little Bunnies</h1>
        <p style="margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#3f4a3a;">Payment Confirmed</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="font-size:16px;color:#2b2b2b;">Thank you for your order, ${address.full_name}! 🐰</p>
        <p style="font-size:14px;color:#666;line-height:1.6;">
          We've received your payment and your order is being prepared. Here's your receipt:
        </p>
        <div style="background:#faf6f0;border-radius:12px;padding:16px 20px;margin:20px 0;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Order Number</div>
          <div style="font-size:20px;font-weight:bold;color:#2b2b2b;font-family:monospace;">${order.order_number}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${itemRows}
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <tr>
            <td style="padding:4px 0;color:#666;font-size:13px;">Subtotal</td>
            <td style="padding:4px 0;text-align:right;color:#666;font-size:13px;">${formatPrice(order.subtotal)}</td>
          </tr>
          ${
            order.custom_name_charge
              ? `<tr>
            <td style="padding:4px 0;color:#666;font-size:13px;">Custom Name Personalization</td>
            <td style="padding:4px 0;text-align:right;color:#666;font-size:13px;">${formatPrice(order.custom_name_charge)}</td>
          </tr>`
              : ""
          }
          ${
            order.discount_amount
              ? `<tr>
            <td style="padding:4px 0;color:#3f7a3f;font-size:13px;">Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}</td>
            <td style="padding:4px 0;text-align:right;color:#3f7a3f;font-size:13px;">-${formatPrice(order.discount_amount)}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:4px 0;color:#666;font-size:13px;">Shipping</td>
            <td style="padding:4px 0;text-align:right;color:#666;font-size:13px;">${order.shipping_amount === 0 ? "FREE" : formatPrice(order.shipping_amount)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0 0;font-weight:bold;color:#2b2b2b;border-top:1px solid #eee;">Total</td>
            <td style="padding:10px 0 0;text-align:right;font-weight:bold;color:#2b2b2b;border-top:1px solid #eee;">${formatPrice(order.total)}</td>
          </tr>
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px dashed #ddd;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;">Shipping To</div>
          <div style="font-size:14px;color:#2b2b2b;line-height:1.5;">
            ${address.full_name}<br />
            ${address.address_line1}${address.address_line2 ? `, ${address.address_line2}` : ""}<br />
            ${address.city}, ${address.state} — ${address.pincode}<br />
            📞 ${address.phone}
          </div>
        </div>
      </div>
      <div style="background:#faf6f0;padding:16px 24px;text-align:center;font-size:12px;color:#999;">
        Little Bunnies &middot; Thank you for shopping with us
      </div>
    </div>
  </div>`;
}

function buildAdminNotificationHtml(
  order: EmailOrder,
  items: EmailOrderItem[],
  customerEmail?: string | null
): string {
  const address = order.shipping_address;
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ""} × ${item.quantity}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">
            ${formatPrice(item.total_price)}
          </td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;background:#faf6f0;padding:24px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #eee;">
      <h2 style="margin:0 0 4px;color:#24324A;">New order received 🎉</h2>
      <p style="margin:0 0 20px;color:#666;font-size:13px;">Order <strong>${order.order_number}</strong> has been paid via ${order.payment_method_label || "Online Payment"}.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
      </table>
      ${order.custom_name_charge ? `<p style="margin:8px 0 0;color:#666;font-size:13px;">+ Custom Name Personalization: ${formatPrice(order.custom_name_charge)}</p>` : ""}
      ${order.discount_amount ? `<p style="margin:4px 0 0;color:#3f7a3f;font-size:13px;">- Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}: ${formatPrice(order.discount_amount)}</p>` : ""}
      <p style="margin:16px 0 4px;font-weight:bold;color:#24324A;">Total: ${formatPrice(order.total)}</p>
      ${
        order.payment_proof_url
          ? `<p style="margin:8px 0 0;font-size:13px;"><a href="${order.payment_proof_url}" style="color:#3B7EBD;font-weight:bold;">View uploaded transaction screenshot →</a></p>`
          : ""
      }
      <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #ddd;font-size:13px;color:#333;line-height:1.6;">
        <strong>Ship to:</strong><br />
        ${address.full_name}<br />
        ${address.address_line1}${address.address_line2 ? `, ${address.address_line2}` : ""}<br />
        ${address.city}, ${address.state} — ${address.pincode}<br />
        📞 ${address.phone}${customerEmail ? `<br />✉️ ${customerEmail}` : ""}
      </div>
    </div>
  </div>`;
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function pdfAttachment(pdf?: Buffer | null, filename?: string) {
  if (!pdf) return undefined;
  return [{ filename: filename || "invoice.pdf", content: pdf.toString("base64") }];
}

/**
 * Best-effort email send — the payment has already succeeded by the time this
 * is called, so a delivery failure here is logged and swallowed, never thrown.
 */
export async function sendOrderConfirmation(
  order: EmailOrder,
  items: EmailOrderItem[],
  toEmail: string | null | undefined,
  invoicePdf?: Buffer | null
): Promise<void> {
  if (!toEmail) {
    console.warn(`No email on file for order ${order.order_number}; skipping confirmation email`);
    return;
  }

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; skipping confirmation email");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Little Bunnies <orders@littlebunnies.co.in>",
      to: toEmail,
      replyTo: "info@littlebunnies.co.in",
      subject: `Order Confirmed — ${order.order_number} — Little Bunnies`,
      html: buildOrderConfirmationHtml(order, items),
      attachments: pdfAttachment(invoicePdf, `invoice-${order.order_number}.pdf`),
    });
  } catch (err) {
    console.error(`Failed to send confirmation email for order ${order.order_number}:`, err);
  }
}

/**
 * Internal notification to the business inbox — separate from the customer
 * receipt so fulfillment gets a shipping-focused summary. Best-effort, same
 * as sendOrderConfirmation.
 */
export async function sendAdminOrderNotification(
  order: EmailOrder,
  items: EmailOrderItem[],
  customerEmail?: string | null,
  invoicePdf?: Buffer | null
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; skipping admin order notification");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Little Bunnies <orders@littlebunnies.co.in>",
      to: "info@littlebunnies.co.in",
      subject: `New Order — ${order.order_number} — ${formatPrice(order.total)}`,
      html: buildAdminNotificationHtml(order, items, customerEmail),
      attachments: pdfAttachment(invoicePdf, `invoice-${order.order_number}.pdf`),
    });
  } catch (err) {
    console.error(`Failed to send admin notification for order ${order.order_number}:`, err);
  }
}
