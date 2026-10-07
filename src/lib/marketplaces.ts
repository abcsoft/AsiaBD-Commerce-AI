/**
 * Marketplace rules and conventions.
 *
 * This is the single place to tune how generated content adapts to each
 * marketplace (title limits, bullets, tags, style notes). Defaults are
 * reasonable starting points - adjust them freely as marketplace guidelines
 * evolve.
 */

export const MARKETPLACE_IDS = [
  'shopify',
  'amazon',
  'etsy',
  'tiktok',
  'general',
] as const;

export type MarketplaceId = (typeof MARKETPLACE_IDS)[number];

export interface MarketplaceRules {
  id: MarketplaceId;
  label: string;
  /** Character budget for optimized product titles. */
  titleLimit: number;
  titleGuidance: string;
  /** Bullet/highlight conventions, when the marketplace uses them. */
  bullets?: { count: number; label: string };
  /** Tag conventions, when the marketplace uses them. */
  tags?: { count: number; label: string };
  descriptionStyle: string;
  keywordNotes: string;
  /** Extra guidance injected into the generation prompt. */
  promptNotes: string;
}

export const MARKETPLACES: MarketplaceRules[] = [
  {
    id: 'shopify',
    label: 'Shopify',
    titleLimit: 70,
    titleGuidance:
      'Clear product name with the primary keyword near the front; keep SEO titles under ~70 characters.',
    bullets: { count: 5, label: 'Key features' },
    descriptionStyle:
      'Direct, conversion-focused description with short paragraphs and a clean feature list. Plain text that pastes cleanly into Shopify.',
    keywordNotes:
      'Weave primary and secondary keywords naturally into the first lines.',
    promptNotes:
      'Optimize for Google SEO and on-store conversion. Do not invent shipping, return, or price claims.',
  },
  {
    id: 'amazon',
    label: 'Amazon',
    titleLimit: 200,
    titleGuidance:
      'Brand + product + key attributes. Keep the most important keywords inside the first 80 characters.',
    bullets: { count: 5, label: 'Bullet points' },
    descriptionStyle:
      'Scannable description: short benefit-led paragraphs, no HTML emphasis, no exaggerated claims ("best ever", "guaranteed").',
    keywordNotes:
      'Front-load indexed keywords; avoid unnatural repetition and avoid ALL CAPS.',
    promptNotes:
      'Follow Amazon style rules: no emojis in titles, no seller, price, or shipping claims.',
  },
  {
    id: 'etsy',
    label: 'Etsy',
    titleLimit: 140,
    titleGuidance:
      'Front-load the strongest buyer search phrases; use separators like "|" or "-".',
    tags: { count: 13, label: 'Tags' },
    descriptionStyle:
      'Warm, story-driven description explaining materials, use cases, and care. Human, buyer-friendly tone.',
    keywordNotes:
      'Prioritize long-tail buyer phrases: occasion, material, recipient, style.',
    promptNotes:
      'Etsy shoppers search with descriptive phrases; include gift and occasion angles when plausible.',
  },
  {
    id: 'tiktok',
    label: 'TikTok Shop',
    titleLimit: 60,
    titleGuidance:
      'Short, punchy title with the core keyword up front. Aim well under 60 characters.',
    descriptionStyle:
      'Fast, energetic description with scannable lines. Light emoji use is acceptable in descriptions, not in titles.',
    keywordNotes:
      'Use trending, plain-language search terms; readability over cleverness.',
    promptNotes:
      'TikTok Shop rewards clarity and speed; write like a top creator, not a catalog.',
  },
  {
    id: 'general',
    label: 'General e-commerce',
    titleLimit: 80,
    titleGuidance: 'Balanced title with the primary keyword near the front.',
    bullets: { count: 5, label: 'Highlights' },
    descriptionStyle: 'Clean, benefit-led description with a short feature list.',
    keywordNotes: 'Natural keyword usage; readability first.',
    promptNotes: 'Use broadly applicable e-commerce best practices.',
  },
];

export function getMarketplace(id: string | null | undefined): MarketplaceRules {
  return (
    MARKETPLACES.find((m) => m.id === id) ??
    MARKETPLACES[MARKETPLACES.length - 1]
  );
}

export const TONES = [
  'professional',
  'friendly',
  'playful',
  'luxury',
  'minimal',
  'bold',
  'persuasive',
  'empathetic',
] as const;

export type ToneId = (typeof TONES)[number];

export function getToneLabel(tone: string | null | undefined): string {
  if (!tone) return 'Professional';
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}

export const SOCIAL_PLATFORMS = [
  'instagram',
  'facebook',
  'tiktok',
  'pinterest',
  'x',
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number];
