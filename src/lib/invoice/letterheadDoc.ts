import fs from "fs";
import path from "path";
import {
  PDFDocument,
  PDFPage,
  PDFFont,
  StandardFonts,
  rgb,
  RGB,
} from "pdf-lib";

const LETTERHEAD_PATH = path.join(process.cwd(), "public", "pdf-templates", "letterhead.pdf");

// Measured from the letterhead artwork (A4, 595.28 x 841.89 pt): the header
// graphic + tagline occupy the top ~250pt, and a divider line + footer
// contact strip sit at ~798pt. Content must stay inside this band.
export const PAGE_WIDTH = 595.28;
export const PAGE_HEIGHT = 841.89;
export const CONTENT_TOP = 570; // just below the tagline
export const CONTENT_BOTTOM = 55; // just above the footer divider
export const CONTENT_LEFT = 45;
export const CONTENT_RIGHT = 550;

export const COLORS = {
  ink: rgb(0x24 / 255, 0x32 / 255, 0x4a / 255),
  inkMuted: rgb(0x6b / 255, 0x7e / 255, 0x96 / 255),
  sageDark: rgb(0x8f / 255, 0xad / 255, 0x78 / 255),
  line: rgb(0xe5 / 255, 0xdf / 255, 0xd3 / 255),
  white: rgb(1, 1, 1),
};

let letterheadBytesCache: Buffer | null = null;
function getLetterheadBytes(): Buffer {
  if (!letterheadBytesCache) {
    letterheadBytesCache = fs.readFileSync(LETTERHEAD_PATH);
  }
  return letterheadBytesCache;
}

export interface LetterheadDoc {
  pdfDoc: PDFDocument;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  addPage: () => Promise<PDFPage>;
}

/**
 * Creates a new PDF document and a helper to add pages pre-stamped with the
 * Little Bunnies letterhead artwork as a background — the letterhead itself
 * is never modified, only drawn under new content on each page.
 */
export async function createLetterheadDoc(): Promise<LetterheadDoc> {
  const pdfDoc = await PDFDocument.create();
  const letterheadPdf = await PDFDocument.load(getLetterheadBytes());
  const [letterheadPage] = await pdfDoc.embedPdf(letterheadPdf, [0]);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const addPage = async () => {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawPage(letterheadPage, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    });
    return page;
  };

  return { pdfDoc, fontRegular, fontBold, addPage };
}

// pdf-lib's standard fonts have no ₹ glyph, so amounts use "Rs." here.
export function formatRs(amount: number): string {
  return "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Wraps text to fit maxWidth, returning an array of lines. */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

interface DrawTextOpts {
  x: number;
  y: number;
  font: PDFFont;
  size?: number;
  color?: RGB;
  align?: "left" | "right" | "center";
  maxWidth?: number;
}

/** Draws a single line of text, optionally right/center-aligned within maxWidth starting at x. */
export function drawText(page: PDFPage, text: string, opts: DrawTextOpts) {
  const { x, y, font, size = 10, color = COLORS.ink, align = "left", maxWidth } = opts;
  let drawX = x;
  if (align !== "left" && maxWidth) {
    const width = font.widthOfTextAtSize(text, size);
    if (align === "right") drawX = x + maxWidth - width;
    if (align === "center") drawX = x + (maxWidth - width) / 2;
  }
  page.drawText(text, { x: drawX, y, size, font, color });
}
