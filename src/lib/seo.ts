export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://littlebunnies.co.in";

/**
 * Serializes a JSON-LD object for a <script type="application/ld+json"> tag.
 * Escapes "<" so a value containing "</script>" can't break out of the tag.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Strips HTML tags for use in plain-text contexts (JSON-LD description, etc). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
