import { getMarketplace, getToneLabel } from '@/lib/marketplaces';
import { getTool, type ToolId } from '@/lib/tools/registry';
import { parseBulkProducts } from '@/lib/tools/schemas';
import type { GenerationInputs } from '@/lib/types';

const SHARED_RULES = `Quality rules (always apply):
- Ground every claim in the provided product details. Never invent certifications, materials, prices, shipping terms, warranties, or guarantees.
- Never use superlatives that cannot be verified (e.g. "world's best", "#1"). No seller information, pricing, or shipping promises.
- Write for human buyers first, search engines second. No keyword stuffing. No clichés like "unleash" or "elevate".
- Vary sentence structure; keep language natural and specific to the product's category.
- If input details are thin, stay accurate and generic rather than fabricating specifics.
- Return your result ONLY by calling the emit_result tool with a single JSON object matching the given schema.`;

const TOOL_BRIEFS: Record<ToolId, string> = {
  'product-title-generator': `Produce exactly 3 distinct product title options ordered best-first for the selected marketplace. Respect the title character budget. Each option: a "text" (the title) and a short "promise" note (max 12 words) explaining the angle. Also include the single strongest "primaryKeyword".`,
  'seo-product-description': `Produce a full SEO description package: an SEO title within ~65 characters, a meta description within ~155 characters, a multi-paragraph product "description" (150-250 words), and 5 scannable highlight "bullets".`,
  'marketplace-listing-optimizer': `Act as a marketplace listing auditor. Produce an "audit" of 4-6 concrete findings, each with "area" (e.g. Title, Bullets, Keywords), "issue" (what is weak) and "fix" (specific improvement). Then produce the fully optimized "title", 5 "bullets", a rewrite of the "description", and 5-10 "keywords" to target.`,
  'ad-copy-generator': `Produce 3 distinct ad angles. For each: "angle" (strategy name), "hook" (first line), "primaryText" (40-90 words), and "cta" (call to action). Add up to 10 relevant "hashtags".`,
  'social-caption-generator': `Produce 3 caption options: one for the selected platform and two for other suitable platforms. Each has "platform", a ready-to-post "caption" (fits platform culture, ends naturally), and platform-appropriate "hashtags" (max 12, lowercase, no # symbol in the strings).`,
  'support-reply-generator': `Act as a senior e-commerce customer support specialist. Produce 2 reply options for the customer message, each with "scenario" (e.g. "Empathetic + resolution") and "reply" (ready to send, professional, matches the requested tone, never invents policy or promises refunds you cannot confirm). Add an "escalationNote" describing when to escalate internally.`,
  'brand-voice-generator': `Produce a reusable brand voice profile: "voiceName", a 2-3 sentence "summary", 4-6 "toneRules" (dos and donts as short rules), "vocabulary" with 5-8 "use" words/phrases and 4-6 "avoid" words/phrases specific to this niche, and 3-4 "sampleLines" that demonstrate the voice.`,
  'keyword-assistant': `Produce a keyword plan: 4-6 "primary" keywords, 5-8 "longTail" phrases, 5-8 "related" terms, and "searchIntentNotes" (2-4 sentences on intent and how to use these keywords).`,
  'bulk-content-generator': `Produce one "items" entry per provided product, in the same order. Each item: "productName" (echo the input name), "title" (marketplace-optimized, within budget) and "description" (70-120 words, complete and standalone).`,
};

export interface BuiltPrompt {
  system: string;
  user: string;
  toolDescription: string;
  maxTokens: number;
}

const MAX_TOKENS: Record<ToolId, number> = {
  'product-title-generator': 700,
  'seo-product-description': 1600,
  'marketplace-listing-optimizer': 2000,
  'ad-copy-generator': 1500,
  'social-caption-generator': 1200,
  'support-reply-generator': 1200,
  'brand-voice-generator': 1300,
  'keyword-assistant': 900,
  'bulk-content-generator': 3500,
};

function personaLines(toolId: ToolId): string {
  switch (toolId) {
    case 'support-reply-generator':
      return 'You are AsiaBD Commerce AI, an expert e-commerce customer support writer.';
    case 'brand-voice-generator':
      return 'You are AsiaBD Commerce AI, a senior brand strategist for e-commerce stores.';
    case 'keyword-assistant':
      return 'You are AsiaBD Commerce AI, an e-commerce SEO and marketplace keyword strategist.';
    default:
      return 'You are AsiaBD Commerce AI, a senior e-commerce copywriter and marketplace listing expert.';
  }
}

function formatInputs(toolId: ToolId, inputs: GenerationInputs): string {
  const lines: string[] = [];
  const push = (label: string, value: string | undefined) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  if (toolId === 'bulk-content-generator') {
    const items = parseBulkProducts(String(inputs.products ?? ''), 10);
    lines.push('Products (generate one output item for each, in order):');
    items.forEach((item, i) => {
      lines.push(
        `${i + 1}. ${item.name}${item.details ? ` - details: ${item.details}` : ''}`
      );
    });
    return lines.join('\n');
  }

  if (toolId === 'support-reply-generator') {
    push('Customer message', inputs.customerMessage as string);
    push('Product', inputs.productName as string);
  } else {
    push('Product name', inputs.productName as string);
    push('Category', inputs.category as string);
    push('Key features', inputs.features as string);
    push('Target customer', inputs.targetCustomer as string);
    push('Keywords to consider', inputs.keywords as string);
  }

  return lines.length ? lines.join('\n') : 'No extra details provided.';
}

export function buildPrompts(
  toolId: ToolId,
  inputs: GenerationInputs,
  brandVoiceText?: string | null
): BuiltPrompt {
  const tool = getTool(toolId);
  const marketplace = getMarketplace(inputs.marketplace);
  const tone = getToneLabel(inputs.tone);

  const marketLines: string[] = [
    `Target marketplace: ${marketplace.label}.`,
    `Title guidance: ${marketplace.titleGuidance} (budget: ~${marketplace.titleLimit} characters).`,
  ];
  if (marketplace.bullets)
    marketLines.push(
      `Use ${marketplace.bullets.count} ${marketplace.bullets.label.toLowerCase()} where the output includes bullets.`
    );
  if (marketplace.tags)
    marketLines.push(
      `Provide up to ${marketplace.tags.count} ${marketplace.tags.label.toLowerCase()} where applicable.`
    );
  marketLines.push(`Description style: ${marketplace.descriptionStyle}`);
  marketLines.push(`Keyword conventions: ${marketplace.keywordNotes}`);
  marketLines.push(`Marketplace specifics: ${marketplace.promptNotes}`);

  const voiceBlock = brandVoiceText
    ? `\nBrand voice profile to follow strictly (overrides generic tone where they conflict):\n${brandVoiceText}\n`
    : '';

  const system = `${personaLines(toolId)}
You write marketplace-ready content that converts for e-commerce sellers on Shopify, Amazon, Etsy, TikTok Shop, and their own stores.

Requested tone: ${tone}.${voiceBlock}
${marketLines.join('\n')}

${TOOL_BRIEFS[toolId]}

${SHARED_RULES}`;

  const user = `Here are the product details:
${formatInputs(toolId, inputs)}

Create the "${tool?.name ?? toolId}" result now.`;

  return {
    system,
    user,
    toolDescription: `Return the structured ${tool?.name ?? toolId} result for an e-commerce product.`,
    maxTokens: MAX_TOKENS[toolId],
  };
}
