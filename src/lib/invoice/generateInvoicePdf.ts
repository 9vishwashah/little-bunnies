import { PDFPage, rgb } from "pdf-lib";
import {
  createLetterheadDoc,
  formatRs,
  formatDate,
  drawText,
  wrapText,
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
  ablepay_transaction_id?: string | null;
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
  customerEmail?: string | null,
  invoiceNumber?: string | null
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
  // Order No. shown here is the sequential LB001-style number — the same
  // one used as the invoice number, so there's a single reference on the
  // receipt rather than two different-looking order/invoice numbers.
  drawText(page, "Order No.", { x: CONTENT_LEFT, y, font: fontBold, size: 9.5, color: COLORS.inkMuted });
  drawText(page, invoiceNumber || order.order_number, { x: CONTENT_LEFT + 90, y, font: fontRegular, size: 9.5, color: COLORS.ink });
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
    ["Payment Method", order.payment_method_label || "Online Payment"],
    ["Payment Status", "PAID"],
    ...(order.ablepay_transaction_id
      ? ([["Payment ID", order.ablepay_transaction_id]] as [string, string][])
      : order.razorpay_payment_id
      ? ([["Payment ID", order.razorpay_payment_id]] as [string, string][])
      : []),
    ["Name", address.full_name],
    ["Address", `${address.address_line1}${address.address_line2 ? ", " + address.address_line2 : ""}`],
    ["", `${address.city}, ${address.state} - ${address.pincode}, ${address.country}`],
    ["Phone", address.phone],
    ...(customerEmail ? ([["Email", customerEmail]] as [string, string][]) : []),
  ];

  const rowHeight = 16;
  const headerHeight = 22;
  const boxPadding = 10;
  const valueMaxWidth = CONTENT_WIDTH - LABEL_COL_WIDTH - 14;

  // Wrap each row's value up front (long addresses in particular can run
  // well past the box — drawText only aligns within maxWidth, it doesn't
  // wrap) so the box height and every row position below account for
  // however many lines a value actually needs.
  const wrappedRows = rows.map(([label, value]) => ({
    label,
    lines: wrapText(value, fontRegular, 9.5, valueMaxWidth),
  }));
  const totalRowLines = wrappedRows.reduce((sum, r) => sum + Math.max(1, r.lines.length), 0);
  const box1Height = headerHeight + totalRowLines * rowHeight + boxPadding;

  await ensureSpace(box1Height + 20);

  const box1Top = y;
  page.drawRectangle({ x: CONTENT_LEFT, y: box1Top - headerHeight, width: CONTENT_WIDTH, height: headerHeight, color: COLORS.ink });
  drawText(page, "ORDER & CUSTOMER DETAILS", {
    x: CONTENT_LEFT, y: box1Top - headerHeight + 8, maxWidth: CONTENT_WIDTH, align: "center", font: fontBold, size: 9.5, color: COLORS.white,
  });

  let rowY = box1Top - headerHeight - boxPadding / 2 - 11;
  for (const { label, lines } of wrappedRows) {
    if (label) {
      drawText(page, label, { x: CONTENT_LEFT + 14, y: rowY, font: fontBold, size: 9.5, color: COLORS.inkMuted });
    }
    for (const line of lines) {
      drawText(page, line, {
        x: CONTENT_LEFT + LABEL_COL_WIDTH, y: rowY, font: fontRegular, size: 9.5, color: COLORS.ink,
        maxWidth: valueMaxWidth,
      });
      rowY -= rowHeight;
    }
  }

  const box1Bottom = box1Top - box1Height;
  page.drawRectangle({
    x: CONTENT_LEFT, y: box1Bottom, width: CONTENT_WIDTH, height: box1Height,
    borderColor: COLORS.line, borderWidth: 1,
  });

  y = box1Bottom - 25;

  // ── Box 2: Items + totals ──────────────────────────────────────────
  // Columns widen from left to right (qty needs little room, amount needs
  // the most — up to 6-7 digit rupee totals) and each keeps a real gap
  // before the next, so values never crowd their column edge.
  const col = {
    item: CONTENT_LEFT,
    qty: { x: CONTENT_RIGHT - 240, width: 40 },
    price: { x: CONTENT_RIGHT - 180, width: 70 },
    amount: { x: CONTENT_RIGHT - 95, width: 85 },
  };

  await ensureSpace(30);
  const startPage = page;
  const box2Top = y;

  page.drawRectangle({ x: CONTENT_LEFT, y: y - 22, width: CONTENT_WIDTH, height: 22, color: COLORS.ink });
  drawText(page, "ITEM", { x: col.item + 10, y: y - 15, font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "QTY", { x: col.qty.x, y: y - 15, maxWidth: col.qty.width, align: "right", font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "PRICE", { x: col.price.x, y: y - 15, maxWidth: col.price.width, align: "right", font: fontBold, size: 9, color: COLORS.white });
  drawText(page, "AMOUNT", { x: col.amount.x, y: y - 15, maxWidth: col.amount.width, align: "right", font: fontBold, size: 9, color: COLORS.white });
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
      x: col.item + 10, y: y - 14, font: fontRegular, size: 9.5, color: COLORS.ink, maxWidth: col.qty.x - col.item - 20,
    });
    if (item.variant_name) {
      drawText(page, item.variant_name, {
        x: col.item + 10, y: y - 27, font: fontRegular, size: 8, color: COLORS.inkMuted,
      });
    }
    drawText(page, String(item.quantity), { x: col.qty.x, y: y - 14, maxWidth: col.qty.width, align: "right", font: fontRegular, size: 9.5, color: COLORS.ink });
    drawText(page, formatRs(item.unit_price), { x: col.price.x, y: y - 14, maxWidth: col.price.width, align: "right", font: fontRegular, size: 9.5, color: COLORS.ink });
    drawText(page, formatRs(item.total_price), { x: col.amount.x, y: y - 14, maxWidth: col.amount.width, align: "right", font: fontRegular, size: 9.5, color: COLORS.ink });

    y -= rowHeightItem;
  }

  page.drawLine({ start: { x: CONTENT_LEFT, y }, end: { x: CONTENT_RIGHT, y }, thickness: 1, color: COLORS.line });
  y -= 20;

  // ── Totals — visually the closing rows of the same box ─────────────
  await ensureSpace(120);
  // Right edge sits a few points inside CONTENT_RIGHT (the box border,
  // which previously touched the value text directly — same edge as the
  // item table's Amount column above), and the label column is wide
  // enough that a coupon-code label never reaches the value.
  const totalsValueWidth = 85;
  const totalsLabelWidth = 130;
  const totalsRightEdge = CONTENT_RIGHT - 10;
  const totalsX = totalsRightEdge - totalsValueWidth - totalsLabelWidth;

  const totalRow = (label: string, value: string, opts?: { bold?: boolean; color?: typeof COLORS.ink }) => {
    const font = opts?.bold ? fontBold : fontRegular;
    const size = opts?.bold ? 12 : 10;
    drawText(page, label, { x: totalsX, y, font, size, color: opts?.color || COLORS.inkMuted });
    drawText(page, value, {
      x: totalsX + totalsLabelWidth, y, maxWidth: totalsValueWidth, align: "right", font, size, color: opts?.color || COLORS.ink,
    });
    y -= opts?.bold ? 18 : 16;
  };

  totalRow("Subtotal", formatRs(order.subtotal));
  if (order.custom_name_charge) {
    totalRow("Personalization", formatRs(order.custom_name_charge));
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
