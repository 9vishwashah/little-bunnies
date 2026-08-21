import {
  createLetterheadDoc,
  formatDate,
  drawText,
  wrapText,
  COLORS,
  CONTENT_TOP,
  CONTENT_LEFT,
  CONTENT_RIGHT,
} from "./letterheadDoc";

interface DeliveryNoteOrder {
  order_number: string;
  created_at: string;
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

const FROM_ADDRESS = {
  name: "Little Bunnies",
  lines: ["Vashi, Navi Mumbai", "Maharashtra, India"],
  phone: "8976077070",
  email: "info@littlebunnies.co.in",
};

const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;

export async function generateDeliveryNotePdf(
  order: DeliveryNoteOrder,
  invoiceNumber?: string | null
): Promise<Buffer> {
  const { pdfDoc, fontRegular, fontBold, addPage } = await createLetterheadDoc();
  const page = await addPage();
  let y = CONTENT_TOP;

  drawText(page, "DELIVERY NOTE", {
    x: CONTENT_LEFT, y, maxWidth: CONTENT_WIDTH, align: "center", font: fontBold, size: 20, color: COLORS.ink,
  });
  drawText(page, `Order #: ${invoiceNumber || order.order_number}`, {
    x: CONTENT_LEFT, y, maxWidth: CONTENT_WIDTH, align: "right", font: fontRegular, size: 10, color: COLORS.inkMuted,
  });
  y -= 15;
  drawText(page, `Date: ${formatDate(order.created_at)}`, {
    x: CONTENT_LEFT, y, maxWidth: CONTENT_WIDTH, align: "right", font: fontRegular, size: 10, color: COLORS.inkMuted,
  });
  y -= 40;

  const boxHeight = 150;
  const boxPadding = 20;

  const drawAddressBox = (label: string, name: string, lines: string[], boxY: number) => {
    page.drawRectangle({
      x: CONTENT_LEFT,
      y: boxY - boxHeight,
      width: CONTENT_WIDTH,
      height: boxHeight,
      borderColor: COLORS.line,
      borderWidth: 1.5,
    });

    let ty = boxY - boxPadding - 4;
    drawText(page, label, { x: CONTENT_LEFT + boxPadding, y: ty, font: fontBold, size: 11, color: COLORS.sageDark });
    ty -= 22;
    drawText(page, name, { x: CONTENT_LEFT + boxPadding, y: ty, font: fontBold, size: 14, color: COLORS.ink });
    ty -= 20;

    for (const raw of lines) {
      const wrapped = wrapText(raw, fontRegular, 12, CONTENT_WIDTH - boxPadding * 2);
      for (const line of wrapped) {
        drawText(page, line, { x: CONTENT_LEFT + boxPadding, y: ty, font: fontRegular, size: 12, color: COLORS.ink });
        ty -= 17;
      }
    }
  };

  drawAddressBox("FROM", FROM_ADDRESS.name, [
    ...FROM_ADDRESS.lines,
    `Phone: ${FROM_ADDRESS.phone}`,
    `Email: ${FROM_ADDRESS.email}`,
  ], y);
  y -= boxHeight + 30;

  const address = order.shipping_address;
  drawAddressBox("TO", address.full_name, [
    `${address.address_line1}${address.address_line2 ? ", " + address.address_line2 : ""}`,
    `${address.city}, ${address.state} - ${address.pincode}`,
    address.country,
    `Phone: ${address.phone}`,
  ], y);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
