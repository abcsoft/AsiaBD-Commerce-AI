import {
  MARKETPLACE_IDS,
  SOCIAL_PLATFORMS,
  TONES,
  type MarketplaceId,
} from '@/lib/marketplaces';

export const TOOL_IDS = [
  'product-title-generator',
  'seo-product-description',
  'marketplace-listing-optimizer',
  'ad-copy-generator',
  'social-caption-generator',
  'support-reply-generator',
  'brand-voice-generator',
  'keyword-assistant',
  'bulk-content-generator',
] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export type ToolCategory = 'content' | 'marketplace' | 'growth' | 'scale';

export interface ToolFieldOption {
  value: string;
  label: string;
}

export interface ToolFieldDef {
  key: string;
  label: string;
  kind: 'text' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: ToolFieldOption[];
  rows?: number;
  help?: string;
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategory;
  /** Credits charged per generation. */
  cost: number;
  /** Credits charged per item for bulk tools. */
  bulkCostPerItem?: number;
  /** Icon key, see components/app/tool-icons.tsx */
  icon: string;
  fields: ToolFieldDef[];
  /** True when the tool output can be saved as a reusable brand voice. */
  producesBrandVoice?: boolean;
  /** Max items accepted by bulk tools. */
  maxItems?: number;
}

const F_PRODUCT: ToolFieldDef = {
  key: 'productName',
  label: 'Product name',
  kind: 'text',
  required: true,
  placeholder: 'e.g. AeroStride Everyday Running Shoes',
};

const F_CATEGORY: ToolFieldDef = {
  key: 'category',
  label: 'Category',
  kind: 'text',
  placeholder: 'e.g. Men’s athletic footwear',
};

const F_FEATURES: ToolFieldDef = {
  key: 'features',
  label: 'Key features',
  kind: 'textarea',
  rows: 3,
  placeholder:
    'Comma or line separated - materials, sizing, benefits, what makes it different',
};

const F_TARGET: ToolFieldDef = {
  key: 'targetCustomer',
  label: 'Target customer',
  kind: 'text',
  placeholder: 'e.g. Runners and commuters who want comfort for daily wear',
};

const F_KEYWORDS: ToolFieldDef = {
  key: 'keywords',
  label: 'Keywords',
  kind: 'text',
  placeholder: 'e.g. running shoes, lightweight sneakers',
};

const F_MARKETPLACE: ToolFieldDef = {
  key: 'marketplace',
  label: 'Marketplace',
  kind: 'select',
  options: MARKETPLACE_IDS.map((id) => ({
    value: id,
    label:
      id === 'tiktok'
        ? 'TikTok Shop'
        : id === 'general'
          ? 'General e-commerce'
          : id.charAt(0).toUpperCase() + id.slice(1),
  })),
};

const F_TONE: ToolFieldDef = {
  key: 'tone',
  label: 'Tone',
  kind: 'select',
  options: TONES.map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
  })),
};

const F_BRAND_VOICE: ToolFieldDef = {
  key: 'brandVoiceId',
  label: 'Brand voice',
  kind: 'select',
  options: [],
  help: 'Optional - apply a saved brand voice profile.',
};

const F_PLATFORM: ToolFieldDef = {
  key: 'platform',
  label: 'Platform',
  kind: 'select',
  options: SOCIAL_PLATFORMS.map((p) => ({
    value: p,
    label: p === 'x' ? 'X (Twitter)' : p.charAt(0).toUpperCase() + p.slice(1),
  })),
};

const STANDARD_FIELDS: ToolFieldDef[] = [
  F_PRODUCT,
  F_CATEGORY,
  F_FEATURES,
  F_TARGET,
  F_KEYWORDS,
  F_MARKETPLACE,
  F_TONE,
  F_BRAND_VOICE,
];

export const TOOLS: ToolDefinition[] = [
  {
    id: 'product-title-generator',
    name: 'Product Title Generator',
    shortName: 'Title Generator',
    description:
      'Generate 3 marketplace-optimized product titles with the right keywords, length, and structure.',
    category: 'content',
    cost: 1,
    icon: 'title',
    fields: STANDARD_FIELDS,
  },
  {
    id: 'seo-product-description',
    name: 'SEO Product Description',
    shortName: 'SEO Description',
    description:
      'Write a search-optimized product description with SEO title, meta description, and key feature bullets.',
    category: 'content',
    cost: 2,
    icon: 'description',
    fields: STANDARD_FIELDS,
  },
  {
    id: 'marketplace-listing-optimizer',
    name: 'Marketplace Listing Optimizer',
    shortName: 'Listing Optimizer',
    description:
      'Audit your current listing details and get fixes plus a fully optimized title, bullets, description, and keywords.',
    category: 'marketplace',
    cost: 2,
    icon: 'optimize',
    fields: STANDARD_FIELDS,
  },
  {
    id: 'ad-copy-generator',
    name: 'Ad Copy Generator',
    shortName: 'Ad Copy',
    description:
      'Create ad angles with hooks, primary text, and CTAs for social and marketplace ads.',
    category: 'growth',
    cost: 2,
    icon: 'ad',
    fields: STANDARD_FIELDS,
  },
  {
    id: 'social-caption-generator',
    name: 'Social Caption Generator',
    shortName: 'Social Captions',
    description:
      'Generate platform-ready captions with hashtags for Instagram, Facebook, TikTok, Pinterest, and X.',
    category: 'growth',
    cost: 1,
    icon: 'social',
    fields: [...STANDARD_FIELDS, F_PLATFORM],
  },
  {
    id: 'support-reply-generator',
    name: 'Customer Support Reply Generator',
    shortName: 'Support Replies',
    description:
      'Turn customer messages into polished, on-brand replies - friendly, firm, or empathetic.',
    category: 'growth',
    cost: 1,
    icon: 'support',
    fields: [
      {
        key: 'customerMessage',
        label: 'Customer message',
        kind: 'textarea',
        rows: 4,
        required: true,
        placeholder: 'Paste the customer’s message or review…',
      },
      F_PRODUCT,
      F_MARKETPLACE,
      F_TONE,
      F_BRAND_VOICE,
    ],
  },
  {
    id: 'brand-voice-generator',
    name: 'Brand Voice Generator',
    shortName: 'Brand Voice',
    description:
      'Build a reusable brand voice profile - tone rules, vocabulary, and sample lines - and apply it across every tool.',
    category: 'content',
    cost: 2,
    icon: 'voice',
    fields: [
      F_PRODUCT,
      F_CATEGORY,
      F_TARGET,
      F_KEYWORDS,
      F_TONE,
    ],
    producesBrandVoice: true,
  },
  {
    id: 'keyword-assistant',
    name: 'Keyword Assistant',
    shortName: 'Keywords',
    description:
      'Get primary, long-tail, and related keyword ideas with search-intent notes for your product.',
    category: 'marketplace',
    cost: 1,
    icon: 'keyword',
    fields: [
      F_PRODUCT,
      F_CATEGORY,
      F_FEATURES,
      F_TARGET,
      F_KEYWORDS,
      F_MARKETPLACE,
    ],
  },
  {
    id: 'bulk-content-generator',
    name: 'Bulk Content Generator',
    shortName: 'Bulk Content',
    description:
      'Paste up to 10 products and generate a title + description for each - export as CSV or JSON.',
    category: 'scale',
    cost: 1,
    bulkCostPerItem: 1,
    maxItems: 10,
    icon: 'bulk',
    fields: [
      {
        key: 'products',
        label: 'Products',
        kind: 'textarea',
        rows: 6,
        required: true,
        placeholder:
          'One product per line. Optionally add details after a pipe:\nWireless Earbuds | Bluetooth 5.3, 32h battery',
      },
      F_MARKETPLACE,
      F_TONE,
      F_BRAND_VOICE,
    ],
  },
];

export function getTool(id: string | null | undefined): ToolDefinition | null {
  if (!id) return null;
  return TOOLS.find((t) => t.id === id) ?? null;
}

export function isToolId(id: string): id is ToolId {
  return (TOOL_IDS as readonly string[]).includes(id);
}

export const TOOL_NAME_BY_ID: Record<ToolId, string> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t.name])
) as Record<ToolId, string>;

export const TOOL_BY_ID: Record<ToolId, ToolDefinition> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t])
) as Record<ToolId, ToolDefinition>;

export type { MarketplaceId };
