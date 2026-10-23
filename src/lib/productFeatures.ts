/**
 * Turns the catalogue's feature copy into scannable pieces for the product
 * page. Nothing is invented: every piece is cut from text already on the product.
 */

export interface FeatureItem {
  /** Short benefit label, e.g. "360° Smart Rotating Seat". */
  title: string;
  /** The rest of the sentence (may be empty). */
  text: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parses `<li><strong>Title:</strong> sentence…</li>` items from the short description HTML. */
export function parseFeatureItems(html: string | null | undefined): FeatureItem[] {
  if (!html) return [];
  const items: FeatureItem[] = [];
  for (const m of html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
    const inner = m[1];
    const strong = inner.match(/<strong[^>]*>([\s\S]*?)<\/strong>/);
    if (strong) {
      const title = stripTags(strong[1]).replace(/[:\s]+$/, "");
      const text = stripTags(inner.replace(strong[0], ""));
      if (title) items.push({ title, text });
    } else {
      const text = stripTags(inner);
      if (text) items.push({ title: text, text: "" });
    }
  }
  return items;
}

/**
 * The first few segments of the pipe-separated product name
 * ("Ultra Compact Baby Stroller | Air Travel Friendly | …"), used as short
 * highlights under the product title instead of the whole long list.
 */
export function nameHighlights(name: string, max = 3): string[] {
  if (!name.includes("|")) return [];
  return name
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}
