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
  payment_method_label?: string;
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
const LABEL_COL_WIDTH = 140;

export async function generateInvoicePdf(
  order: InvoiceOrder,
  items: InvoiceItem[],
  customerEmail?: string | null
): Promise<Buffer> {
  const { pdfDoc, fontRegular, fontBold, addPage } = await createLetterheadDoc();
  let page: PDFPage = await addPage();
  // Extra headroom under the letterhead tagline before anything is drawn,
  // so the receipt title doesn't crowd the artwork above it.
  let y = CONTENT_TOP - 15;

  const ensureSpace = async (needed: number) => {
    if (y - needed < CONTENT_BOTTOM) {
      page = await addPage();
      y = CONTENT_TOP - 15;
    }
  };

  // ── Order meta strip (mirrors a booking-confirmation receipt: reference
  // numbers sit above the title, not below it) ────────────────────────────
  drawText(page, "Order Number", { x: CONTENT_LEFT, y, font: fontBold, size: 9.5, color: COLORS.inkMuted });
  drawText(page, order.order_number, { x: CONTENT_LEFT + 90, y, font: fontRegular, size: 9.5, color: COLORS.ink });
  y -= 14;
  drawText(page, "Payment Date", { x: CONTENT_LEFT, y, font: fontBold, size: 9.5, color: COLORS.inkMuted });
  drawText(page, formatDate(order.created_at), { x: CONTENT_LEFT + 90, y, font: fontRegular, size: 9.5, color: COLORS.ink });
  y -= 34;

  // ── Centered title ──────────────────────────────────────────────────
  drawText(page, "PAYMENT RECEIPT", {
    x: CONTENT_LEFT, y, maxWidth: CONTENT_WIDTH, align: "center", font: fontBold, size: 18, color: COLORS.ink,
  });
  y -= 22;
  page.drawLine({ start: { x: CONTENT_LEFT, y }, end: { x: CONTENT_RIGHT, y }, thickness: 1, color: COLORS.line });
  y -= 25;

  // ── Box 1: Order & Customer Details ─────────────────────────────────
  const address = order.shipping_address;
  const rows: [string, string][] = [
    ["Payment Method", order.payment_method_label || "Razorpay"],
    ["Payment Status", "PAID"],
    ...(order.razorpay_payment_id ? ([["Payment ID", order.razorpay_payment_id]] as [string, string][]) : []),
    ["Name", address.full_name],
    ["Address", `${address.address_line1}${address.address_line2 ? ", " + address.address_line2 : ""}`],
    ["", `${address.city}, ${address.state} - ${address.pincode}, ${address.country}`],
    ["Phone", address.phone],
    ...(customerEmail ? ([["Email", customerEmail]] as [string, string][]) : []),
  ];

  const rowHeight = 16;
  const headerHeight = 22;
  const boxPadding = 10;
  const box1Height = headerHeight + rows.length * rowHeight + boxPadding;

  await ensureSpace(box1Height + 20);

  const box1Top = y;
  page.drawRectangle({ x: CONTENT_LEFT, y: box1Top - headerHeight, width: CONTENT_WIDTH, height: headerHeight, color: COLORS.ink });
  drawText(page, "ORDER & CUSTOMER DETAILS", {
    x: CONTENT_LEFT, y: box1Top - headerHeight + 8, maxWidth: CONTENT_WIDTH, align: "center", font: fontBold, size: 9.5, color: COLORS.white,
  });

  let rowY = box1Top - headerHeight - boxPadding / 2 - 11;
  for (const [label, value] of rows) {
    if (label) {
      drawText(page, label, { x: CONTENT_LEFT + 14, y: rowY, font: fontBold, size: 9.5, color: COLORS.inkMuted });
    }
    drawText(page, value, {
      x: CONTENT_LEFT + LABEL_COL_WIDTH, y: rowY, font: fontRegular, size: 9.5, color: COLORS.ink,
      maxWidth: CONTENT_WIDTH - LABEL_COL_WIDTH - 14,
    });
    rowY -= rowHeight;
  }

  const box1Bottom = box1Top - box1Height;
  page.drawRectangle({
    x: CONTENT_LEFT, y: box1Bottom, width: CONTENT_WIDTH, height: box1Height,
    borderColor: COLORS.line, borderWidth: 1,
  });

  y = box1Bottom - 25;

  // ── Box 2: Items + totals ──────────────────────────────────────────
  const col = {
    item: CONTENT_LEFT,
    qty: CONTENT_RIGHT - 220,
    price: CONTENT_RIGHT - 150,
    amount: CONTENT_RIGHT - 80,
  };

  await ensureSpace(30);
  const startPage = page;
  const box2Top = y;

  page.drawRectangle({ x: CONTENT_LEFT, y: y - 22, width: CONTENT_WIDTH, height: 22, color: COLORS.ink });
  drawText(page, "ITEM", { x: col.item + 10, y: y - 15, font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "QTY", { x: col.qty, y: y - 15, maxWidth: 50, align: "right", font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "PRICE", { x: col.price, y: y - 15, maxWidth: 60, align: "right", font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "AMOUNT", { x: col.amount, y: y - 15, maxWidth: 70, align: "right", font: fontBold, size: 9, color: COLORS.white });
  y -= 22;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowHeightItem = item.variant_name ? 34 : 24;
    await ensureSpace(rowHeightItem);

    if (i % 2 === 1) {
      page.drawRectangle({
        x: CONTENT_LEFT, y: y - rowHeightItem, width: CONTENT_WIDTH, height: rowHeightItem,
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

    y -= rowHeightItem;
  }

  page.drawLine({ start: { x: CONTENT_LEFT, y }, end: { x: CONTENT_RIGHT, y }, thickness: 1, color: COLORS.line });
  y -= 20;

  // ── Totals — visually the closing rows of the same box ─────────────
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

  // Enclose the items+totals section in a box border, matching Box 1 —
  // only when it stayed on a single page (pagination already reads fine
  // without it, so this is skipped rather than risked across page breaks).
  if (page === startPage) {
    const box2Bottom = y - 6;
    page.drawRectangle({
      x: CONTENT_LEFT, y: box2Bottom, width: CONTENT_WIDTH, height: box2Top - box2Bottom,
      borderColor: COLORS.line, borderWidth: 1,
    });
  }

  // ── Footer sign-off ──────────────────────────────────────────────
  drawText(page, "This receipt is system-generated and does not require a signature.", {
    x: CONTENT_LEFT, y: CONTENT_BOTTOM + 14, maxWidth: CONTENT_WIDTH, align: "center", font: fontRegular, size: 8, color: COLORS.inkMuted,
  });
  drawText(page, "Thank you for shopping with Little Bunnies!", {
    x: CONTENT_LEFT, y: CONTENT_BOTTOM, maxWidth: CONTENT_WIDTH, align: "center", font: fontRegular, size: 9, color: COLORS.inkMuted,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
