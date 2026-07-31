import { PDFPage, rgb } from "pdf-lib";
import {
  createLetterheadDoc,
  formatRs,
  formatDate,
  drawText,
  COLORS,
  CONTENT_TOP,
  CONTENT_BOTTOM,
  CONTENT_LEFT,
  CONTENT_RIGHT,
} from "./letterheadDoc";

interface InvoiceOrder {
  order_number: string;
  created_at: string;
  subtotal: number;
  discount_amount?: number;
  custom_name_charge?: number;
  coupon_code?: string | null;
  shipping_amount: number;
  total: number;
  razorpay_payment_id?: string | null;
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

interface InvoiceItem {
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;

export async function generateInvoicePdf(
  order: InvoiceOrder,
  items: InvoiceItem[],
  customerEmail?: string | null
): Promise<Buffer> {
  const { pdfDoc, fontRegular, fontBold, addPage } = await createLetterheadDoc();
  let page: PDFPage = await addPage();
  let y = CONTENT_TOP;

  const ensureSpace = async (needed: number) => {
    if (y - needed < CONTENT_BOTTOM) {
      page = await addPage();
      y = CONTENT_TOP;
    }
  };

  // ── Title + receipt meta ────────────────────────────────────────────
  drawText(page, "PAYMENT RECEIPT", { x: CONTENT_LEFT, y, font: fontBold, size: 18, color: COLORS.ink });
  drawText(page, `Receipt #: ${order.order_number}`, {
    x: CONTENT_LEFT, y, maxWidth: CONTENT_WIDTH, align: "right", font: fontRegular, size: 10, color: COLORS.inkMuted,
  });
  y -= 15;
  drawText(page, `Date: ${formatDate(order.created_at)}`, {
    x: CONTENT_LEFT, y, maxWidth: CONTENT_WIDTH, align: "right", font: fontRegular, size: 10, color: COLORS.inkMuted,
  });
  y -= 20;

  page.drawLine({
    start: { x: CONTENT_LEFT, y },
    end: { x: CONTENT_RIGHT, y },
    thickness: 1,
    color: COLORS.line,
  });
  y -= 25;

  // ── Billed to / Payment details ─────────────────────────────────────
  const colWidth = CONTENT_WIDTH / 2 - 10;
  const rightColX = CONTENT_LEFT + colWidth + 20;
  const address = order.shipping_address;
  let leftY = y;
  let rightY = y;

  drawText(page, "BILLED TO", { x: CONTENT_LEFT, y: leftY, font: fontBold, size: 9, color: COLORS.inkMuted });
  leftY -= 15;
  const billedToLines = [
    address.full_name,
    `${address.address_line1}${address.address_line2 ? ", " + address.address_line2 : ""}`,
    `${address.city}, ${address.state} - ${address.pincode}`,
    address.country,
    `Phone: ${address.phone}`,
    ...(customerEmail ? [`Email: ${customerEmail}`] : []),
  ];
  for (const line of billedToLines) {
    drawText(page, line, { x: CONTENT_LEFT, y: leftY, font: fontRegular, size: 10, color: COLORS.ink });
    leftY -= 14;
  }

  drawText(page, "PAYMENT DETAILS", { x: rightColX, y: rightY, font: fontBold, size: 9, color: COLORS.inkMuted });
  rightY -= 15;
  const paymentLines = [
    `Order Number: ${order.order_number}`,
    "Payment Method: Razorpay",
    "Payment Status: PAID",
    ...(order.razorpay_payment_id ? [`Payment ID: ${order.razorpay_payment_id}`] : []),
  ];
  for (const line of paymentLines) {
    drawText(page, line, { x: rightColX, y: rightY, font: fontRegular, size: 10, color: COLORS.ink });
    rightY -= 14;
  }

  y = Math.min(leftY, rightY) - 20;

  // ── Items table ──────────────────────────────────────────────────
  const col = {
    item: CONTENT_LEFT,
    qty: CONTENT_RIGHT - 220,
    price: CONTENT_RIGHT - 150,
    amount: CONTENT_RIGHT - 80,
  };

  await ensureSpace(30);
  page.drawRectangle({ x: CONTENT_LEFT, y: y - 20, width: CONTENT_WIDTH, height: 22, color: COLORS.ink });
  drawText(page, "ITEM", { x: col.item + 10, y: y - 14, font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "QTY", { x: col.qty, y: y - 14, maxWidth: 50, align: "right", font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "PRICE", { x: col.price, y: y - 14, maxWidth: 60, align: "right", font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "AMOUNT", { x: col.amount, y: y - 14, maxWidth: 70, align: "right", font: fontBold, size: 9, color: COLORS.white });
  y -= 22;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowHeight = item.variant_name ? 34 : 24;
    await ensureSpace(rowHeight);

    if (i % 2 === 1) {
      page.drawRectangle({
        x: CONTENT_LEFT, y: y - rowHeight, width: CONTENT_WIDTH, height: rowHeight,
        color: rgb(0.98, 0.965, 0.945),
      });
    }

    drawText(page, item.product_name, {
      x: col.item + 10, y: y - 14, font: fontRegular, size: 9.5, color: COLORS.ink, maxWidth: col.qty - col.item - 20,
    });
    if (item.variant_name) {
      drawText(page, item.variant_name, {
        x: col.item + 10, y: y - 27, font: fontRegular, size: 8, color: COLORS.inkMuted,
      });
    }
    drawText(page, String(item.quantity), { x: col.qty, y: y - 14, maxWidth: 50, align: "right", font: fontRegular, size: 9.5, color: COLORS.ink });
    drawText(page, formatRs(item.unit_price), { x: col.price, y: y - 14, maxWidth: 60, align: "right", font: fontRegular, size: 9.5, color: COLORS.ink });
    drawText(page, formatRs(item.total_price), { x: col.amount, y: y - 14, maxWidth: 70, align: "right", font: fontRegular, size: 9.5, color: COLORS.ink });

    y -= rowHeight;
  }

  page.drawLine({ start: { x: CONTENT_LEFT, y }, end: { x: CONTENT_RIGHT, y }, thickness: 1, color: COLORS.line });
  y -= 20;

  // ── Totals ──────────────────────────────────────────────────────
  await ensureSpace(120);
  const totalsX = CONTENT_RIGHT - 200;
  const totalsLabelWidth = 120;

  const totalRow = (label: string, value: string, opts?: { bold?: boolean; color?: typeof COLORS.ink }) => {
    const font = opts?.bold ? fontBold : fontRegular;
    const size = opts?.bold ? 12 : 10;
    drawText(page, label, { x: totalsX, y, font, size, color: opts?.color || COLORS.inkMuted });
    drawText(page, value, {
      x: totalsX + totalsLabelWidth, y, maxWidth: 80, align: "right", font, size, color: opts?.color || COLORS.ink,
    });
    y -= opts?.bold ? 18 : 16;
  };

  totalRow("Subtotal", formatRs(order.subtotal));
  if (order.custom_name_charge) {
    totalRow("Custom Name Personalization", formatRs(order.custom_name_charge));
  }
  if (order.discount_amount) {
    totalRow(
      order.coupon_code ? `Discount (${order.coupon_code})` : "Discount",
      `- ${formatRs(order.discount_amount)}`,
      { color: COLORS.sageDark }
    );
  }
  totalRow("Shipping", order.shipping_amount === 0 ? "FREE" : formatRs(order.shipping_amount));

  y -= 4;
  page.drawLine({ start: { x: totalsX, y }, end: { x: CONTENT_RIGHT, y }, thickness: 1, color: COLORS.line });
  y -= 14;
  totalRow("Total Paid", formatRs(order.total), { bold: true, color: COLORS.sageDark });

  // ── Footer sign-off ──────────────────────────────────────────────
  drawText(page, "Thank you for shopping with Little Bunnies!", {
    x: CONTENT_LEFT, y: CONTENT_BOTTOM, maxWidth: CONTENT_WIDTH, align: "center", font: fontRegular, size: 9, color: COLORS.inkMuted,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
