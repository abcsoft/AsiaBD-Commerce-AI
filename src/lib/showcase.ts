import { getMarketplace } from '@/lib/marketplaces';
import { SAMPLE_PRODUCTS, type SampleProduct } from '@/lib/sample-products';

export interface ShowcaseResult {
  marketplaceLabel: string;
  titleLimit: number;
  titles: string[];
  bullets: string[];
  metaDescription: string;
}

function clip(s: string, limit: number): string {
  if (s.length <= limit) return s;
  return s.slice(0, Math.max(1, limit - 1)).trimEnd() + '…';
}

/**
 * Client-side deterministic preview shown on the landing page.
 * Uses sample data only - the real app calls Claude server-side.
 */
export function buildShowcase(
  sample: SampleProduct,
  marketplaceId: string
): ShowcaseResult {
  const marketplace = getMarketplace(marketplaceId);
  const limit = marketplace.titleLimit;
  const features = sample.features
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const keywords = sample.keywords.split(',').map((s) => s.trim());

  const titles = [
    `${sample.name} - ${cap(features[0] ?? keywords[0])}`,
    `${cap(keywords[0])}: ${sample.name}${features[1] ? ` with ${features[1].toLowerCase()}` : ''}`,
    `${sample.name}${features[2] ? `, ${features[2].toLowerCase()}` : ''}`,
  ].map((t) => clip(t, limit));

  const bullets = [...features.slice(0, 4), `Made for ${sample.targetCustomer.toLowerCase()}`]
    .slice(0, marketplace.bullets?.count ?? 5)
    .map((b) => cap(b));

  const metaDescription = clip(
    `Shop the ${sample.name}. ${cap(features[0] ?? '')}. Perfect for ${sample.targetCustomer.toLowerCase()}.`,
    155
  );

  return {
    marketplaceLabel: marketplace.label,
    titleLimit: limit,
    titles,
    bullets,
    metaDescription,
  };
}

function cap(s: string): string {
  const t = (s ?? '').trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function defaultShowcaseSample(): SampleProduct {
  return SAMPLE_PRODUCTS[0];
}
