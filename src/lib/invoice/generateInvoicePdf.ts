import PDFDocument from "pdfkit";

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

const INK = "#24324A";
const INK_MUTED = "#8A8072";
const SAGE_DARK = "#5C7A46";
const LINE = "#E5DFD3";

// pdfkit's built-in Helvetica font has no glyph for ₹, so amounts use "Rs." here.
function formatPdfPrice(amount: number): string {
  return "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function generateInvoicePdf(
  order: InvoiceOrder,
  items: InvoiceItem[],
  customerEmail?: string | null
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    // ── Header ──────────────────────────────────────────────────────────
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("LITTLE BUNNIES", left, 50);

    doc
      .fillColor(INK_MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("Premium Baby Essentials", left, 76)
      .text("littlebunnies.co.in  •  info@littlebunnies.co.in", left, 90);

    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("PAYMENT RECEIPT", left, 50, { width: pageWidth, align: "right" });

    doc
      .fillColor(INK_MUTED)
      .font("Helvetica")
      .fontSize(10)
      .text(`Receipt #: ${order.order_number}`, left, 76, { width: pageWidth, align: "right" })
      .text(`Date: ${formatDate(order.created_at)}`, left, 90, { width: pageWidth, align: "right" });

    doc.moveTo(left, 118).lineTo(left + pageWidth, 118).strokeColor(LINE).stroke();

    // ── Billed to / Payment details ────────────────────────────────────
    const address = order.shipping_address;
    const colWidth = pageWidth / 2 - 10;

    doc
      .fillColor(INK_MUTED)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("BILLED TO", left, 136);

    doc
      .fillColor(INK)
      .font("Helvetica")
      .fontSize(10)
      .text(address.full_name, left, 152, { width: colWidth })
      .text(
        `${address.address_line1}${address.address_line2 ? ", " + address.address_line2 : ""}`,
        { width: colWidth }
      )
      .text(`${address.city}, ${address.state} - ${address.pincode}`, { width: colWidth })
      .text(address.country, { width: colWidth })
      .text(`Phone: ${address.phone}`, { width: colWidth });
    if (customerEmail) {
      doc.text(`Email: ${customerEmail}`, { width: colWidth });
    }

    const rightColX = left + colWidth + 20;
    doc
      .fillColor(INK_MUTED)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("PAYMENT DETAILS", rightColX, 136);

    doc
      .fillColor(INK)
      .font("Helvetica")
      .fontSize(10)
      .text(`Order Number: ${order.order_number}`, rightColX, 152, { width: colWidth })
      .text(`Payment Method: Razorpay`, { width: colWidth })
      .text(`Payment Status: PAID`, { width: colWidth });
    if (order.razorpay_payment_id) {
      doc.text(`Payment ID: ${order.razorpay_payment_id}`, { width: colWidth });
    }

    // ── Items table ──────────────────────────────────────────────────
    let y = 250;
    const col = {
      item: left,
      qty: left + pageWidth - 220,
      price: left + pageWidth - 150,
      amount: left + pageWidth - 80,
    };

    doc.rect(left, y, pageWidth, 22).fill(INK);
    doc
      .fillColor("#FBF8F3")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("ITEM", col.item + 10, y + 7)
      .text("QTY", col.qty, y + 7, { width: 50, align: "right" })
      .text("PRICE", col.price, y + 7, { width: 60, align: "right" })
      .text("AMOUNT", col.amount, y + 7, { width: 70, align: "right" });

    y += 22;

    items.forEach((item, i) => {
      const rowHeight = item.variant_name ? 36 : 26;
      if (i % 2 === 1) {
        doc.rect(left, y, pageWidth, rowHeight).fill("#FAF6F0");
      }

      doc
        .fillColor(INK)
        .font("Helvetica")
        .fontSize(9.5)
        .text(item.product_name, col.item + 10, y + 7, { width: col.qty - col.item - 20 });

      if (item.variant_name) {
        doc
          .fillColor(INK_MUTED)
          .fontSize(8)
          .text(item.variant_name, col.item + 10, y + 20, { width: col.qty - col.item - 20 });
      }

      doc
        .fillColor(INK)
        .font("Helvetica")
        .fontSize(9.5)
        .text(String(item.quantity), col.qty, y + 7, { width: 50, align: "right" })
        .text(formatPdfPrice(item.unit_price), col.price, y + 7, { width: 60, align: "right" })
        .text(formatPdfPrice(item.total_price), col.amount, y + 7, { width: 70, align: "right" });

      y += rowHeight;
    });

    doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(LINE).stroke();
    y += 14;

    // ── Totals ──────────────────────────────────────────────────────
    const totalsX = left + pageWidth - 200;
    doc
      .fillColor(INK_MUTED)
      .font("Helvetica")
      .fontSize(10)
      .text("Subtotal", totalsX, y, { width: 120 })
      .fillColor(INK)
      .text(formatPdfPrice(order.subtotal), totalsX + 120, y, { width: 80, align: "right" });
    y += 16;

    if (order.custom_name_charge) {
      doc
        .fillColor(INK_MUTED)
        .text("Custom Name Personalization", totalsX, y, { width: 120 })
        .fillColor(INK)
        .text(formatPdfPrice(order.custom_name_charge), totalsX + 120, y, { width: 80, align: "right" });
      y += 16;
    }

    if (order.discount_amount) {
      doc
        .fillColor(INK_MUTED)
        .text(order.coupon_code ? `Discount (${order.coupon_code})` : "Discount", totalsX, y, { width: 120 })
        .fillColor(SAGE_DARK)
        .text(`- ${formatPdfPrice(order.discount_amount)}`, totalsX + 120, y, { width: 80, align: "right" });
      y += 16;
    }

    doc
      .fillColor(INK_MUTED)
      .text("Shipping", totalsX, y, { width: 120 })
      .fillColor(INK)
      .text(
        order.shipping_amount === 0 ? "FREE" : formatPdfPrice(order.shipping_amount),
        totalsX + 120,
        y,
        { width: 80, align: "right" }
      );
    y += 20;

    doc.moveTo(totalsX, y).lineTo(left + pageWidth, y).strokeColor(LINE).stroke();
    y += 8;

    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Total Paid", totalsX, y, { width: 120 })
      .fillColor(SAGE_DARK)
      .text(formatPdfPrice(order.total), totalsX + 120, y, { width: 80, align: "right" });

    // ── Footer ──────────────────────────────────────────────────────
    const footerY = doc.page.height - doc.page.margins.bottom - 40;
    doc
      .fillColor(INK_MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("Thank you for shopping with Little Bunnies!", left, footerY, {
        width: pageWidth,
        align: "center",
      })
      .text("This is a computer-generated receipt and does not require a signature.", left, footerY + 13, {
        width: pageWidth,
        align: "center",
      });

    doc.end();
  });
}
