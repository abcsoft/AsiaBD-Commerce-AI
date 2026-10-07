import { z } from 'zod';
import { MARKETPLACE_IDS, SOCIAL_PLATFORMS, TONES } from '@/lib/marketplaces';
import type { ToolId } from '@/lib/tools/registry';

/* ---------------------------------- input --------------------------------- */

const baseFields = {
  productName: z.string().trim().max(200).default(''),
  category: z.string().trim().max(160).default(''),
  features: z.string().trim().max(2000).default(''),
  targetCustomer: z.string().trim().max(600).default(''),
  keywords: z.string().trim().max(800).default(''),
  marketplace: z.enum(MARKETPLACE_IDS).default('general'),
  tone: z.enum(TONES).default('professional'),
  brandVoiceId: z.string().trim().max(80).optional().or(z.literal('')),
};

const requireProductName = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (v: unknown) =>
      typeof (v as { productName?: string }).productName === 'string' &&
      ((v as { productName?: string }).productName as string).length >= 2,
    { message: 'Product name is required (at least 2 characters).', path: ['productName'] }
  );

export const bulkItemsSchema = z.object({
  products: z
    .string()
    .trim()
    .min(3, 'Add at least one product.')
    .max(6000, 'Keep bulk input under 6000 characters.'),
  marketplace: z.enum(MARKETPLACE_IDS).default('general'),
  tone: z.enum(TONES).default('professional'),
  brandVoiceId: z.string().trim().max(80).optional().or(z.literal('')),
});

export const INPUT_SCHEMAS: Record<ToolId, z.ZodTypeAny> = {
  'product-title-generator': requireProductName(z.object(baseFields)),
  'seo-product-description': requireProductName(z.object(baseFields)),
  'marketplace-listing-optimizer': requireProductName(z.object(baseFields)),
  'ad-copy-generator': requireProductName(z.object(baseFields)),
  'social-caption-generator': requireProductName(
    z.object({ ...baseFields, platform: z.enum(SOCIAL_PLATFORMS).default('instagram') })
  ),
  'support-reply-generator': z
    .object({
      customerMessage: z
        .string()
        .trim()
        .min(10, 'Paste the customer message (at least 10 characters).')
        .max(3000),
      productName: z.string().trim().max(200).default(''),
      marketplace: z.enum(MARKETPLACE_IDS).default('general'),
      tone: z.enum(TONES).default('empathetic'),
      brandVoiceId: z.string().trim().max(80).optional().or(z.literal('')),
    }),
  'brand-voice-generator': requireProductName(
    z.object({
      productName: baseFields.productName,
      category: baseFields.category,
      targetCustomer: baseFields.targetCustomer,
      keywords: baseFields.keywords,
      tone: baseFields.tone,
    })
  ),
  'keyword-assistant': requireProductName(
    z.object({
      productName: baseFields.productName,
      category: baseFields.category,
      features: baseFields.features,
      targetCustomer: baseFields.targetCustomer,
      keywords: baseFields.keywords,
      marketplace: baseFields.marketplace,
    })
  ),
  'bulk-content-generator': bulkItemsSchema,
};

/* --------------------------------- output --------------------------------- */

export const titlesOutput = z.object({
  titles: z
    .array(z.object({ text: z.string(), promise: z.string().optional().default('') }))
    .min(2)
    .max(4),
  primaryKeyword: z.string().optional().default(''),
});

export const seoDescriptionOutput = z.object({
  seoTitle: z.string(),
  metaDescription: z.string(),
  description: z.string(),
  bullets: z.array(z.string()).min(3).max(8),
});

export const optimizerOutput = z.object({
  audit: z
    .array(z.object({ area: z.string(), issue: z.string(), fix: z.string() }))
    .min(3)
    .max(6),
  title: z.string(),
  bullets: z.array(z.string()).min(3).max(8),
  description: z.string(),
  keywords: z.array(z.string()).min(3).max(15),
});

export const adCopyOutput = z.object({
  angles: z
    .array(
      z.object({
        angle: z.string(),
        hook: z.string(),
        primaryText: z.string(),
        cta: z.string(),
      })
    )
    .min(2)
    .max(5),
  hashtags: z.array(z.string()).max(15).optional().default([]),
});

export const socialCaptionOutput = z.object({
  captions: z
    .array(
      z.object({
        platform: z.string(),
        caption: z.string(),
        hashtags: z.array(z.string()).max(12),
      })
    )
    .min(2)
    .max(5),
});

export const supportReplyOutput = z.object({
  replies: z
    .array(z.object({ scenario: z.string(), reply: z.string() }))
    .min(1)
    .max(4),
  escalationNote: z.string().optional().default(''),
});

export const brandVoiceOutput = z.object({
  voiceName: z.string(),
  summary: z.string(),
  toneRules: z.array(z.string()).min(3).max(8),
  vocabulary: z.object({
    use: z.array(z.string()).min(3).max(12),
    avoid: z.array(z.string()).min(3).max(12),
  }),
  sampleLines: z.array(z.string()).min(2).max(6),
});

export const keywordOutput = z.object({
  primary: z.array(z.string()).min(3).max(10),
  longTail: z.array(z.string()).min(3).max(15),
  related: z.array(z.string()).min(3).max(15),
  searchIntentNotes: z.string().optional().default(''),
});

export const bulkOutput = z.object({
  items: z
    .array(
      z.object({
        productName: z.string(),
        title: z.string(),
        description: z.string(),
      })
    )
    .min(1)
    .max(10),
});

export const OUTPUT_SCHEMAS: Record<ToolId, z.ZodTypeAny> = {
  'product-title-generator': titlesOutput,
  'seo-product-description': seoDescriptionOutput,
  'marketplace-listing-optimizer': optimizerOutput,
  'ad-copy-generator': adCopyOutput,
  'social-caption-generator': socialCaptionOutput,
  'support-reply-generator': supportReplyOutput,
  'brand-voice-generator': brandVoiceOutput,
  'keyword-assistant': keywordOutput,
  'bulk-content-generator': bulkOutput,
};

/* --------------------------------- helpers -------------------------------- */

export interface BulkProductItem {
  name: string;
  details: string;
}

/** Parse newline-separated bulk input ("Name | details") into items. */
export function parseBulkProducts(raw: string, maxItems = 10): BulkProductItem[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((line) => {
      const pipeIndex = line.indexOf('|');
      if (pipeIndex === -1) return { name: line, details: '' };
      return {
        name: line.slice(0, pipeIndex).trim(),
        details: line.slice(pipeIndex + 1).trim(),
      };
    })
    .filter((item) => item.name.length > 0);
}
