import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function formatWhatsAppMessage(
  productName: string,
  productUrl: string
): string {
  const message = `Hi Little Bunnies,\n\nI am interested in:\n\nProduct Name: ${productName}\nProduct URL: ${productUrl}\n\nPlease share more details.`;
  return encodeURIComponent(message);
}

export function getWhatsAppUrl(productName: string, productUrl: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918976077070";
  const message = formatWhatsAppMessage(productName, productUrl);
  return `https://wa.me/${number}?text=${message}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `LB${dateStr}${random}`;
}

// Sequential invoice display number (LB001, LB002, ...), backed by the
// invoice_number_seq Postgres sequence — see migration_invoice_number.sql.
export function formatInvoiceNumber(n: number): string {
  return `LB${String(n).padStart(3, "0")}`;
}

export const FREE_SHIPPING_THRESHOLD = 5999;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
}

// Site-wide promotional coupon shown on the ticker, homepage popup, and
// product pages; actual redemption and discount amount are always
// re-validated server-side at checkout (see validateCoupon / coupons table —
// this constant only drives display copy, it has no effect on discounting).
export const PROMO_COUPON_CODE = "GANPATI20";
export const PROMO_COUPON_LABEL = "10% off your order";
