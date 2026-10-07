import { getMarketplace } from '@/lib/marketplaces';
import type { ToolId } from '@/lib/tools/registry';
import { parseBulkProducts } from '@/lib/tools/schemas';
import type { GenerationInputs, ToolOutput } from '@/lib/types';

/**
 * Deterministic demo-mode generation.
 *
 * Produces realistic-looking sample output derived strictly from the inputs,
 * so the entire product (credits, library, exports, dashboard) can be
 * explored with zero configuration and no external API calls.
 */

function splitList(raw: unknown): string[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function cap(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function stable(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clip(s: string, limit: number): string {
  if (s.length <= limit) return s;
  return s.slice(0, Math.max(1, limit - 1)).trimEnd() + '…';
}

interface Ctx {
  name: string;
  category: string;
  features: string[];
  target: string;
  keywords: string[];
  marketplace: ReturnType<typeof getMarketplace>;
  tone: string;
}

function ctxOf(inputs: GenerationInputs): Ctx {
  return {
    name: String(inputs.productName ?? '').trim(),
    category: String(inputs.category ?? '').trim(),
    features: splitList(inputs.features),
    target: String(inputs.targetCustomer ?? '').trim(),
    keywords: splitList(inputs.keywords),
    marketplace: getMarketplace(inputs.marketplace),
    tone: String(inputs.tone ?? 'professional'),
  };
}

const KW_FALLBACK = ['quality', 'everyday', 'premium'];

function kw(c: Ctx, i: number): string {
  return c.keywords[i] ?? KW_FALLBACK[i % KW_FALLBACK.length];
}

function buildTitles(c: Ctx): ToolOutput {
  const f = c.features;
  const limit = c.marketplace.titleLimit;
  const t1 = cap(
    `${c.name}${f[0] ? ` - ${cap(f[0])}` : ` - ${cap(kw(c, 0))}`}`
  );
  const t2 = cap(
    `${kw(c, 0) && c.keywords[0] ? `${cap(c.keywords[0])}: ` : ''}${c.name}${f[1] ? ` with ${f[1].toLowerCase()}` : ''}`
  );
  const t3 = cap(
    `${c.name}${f[2] ? `, ${f[2].toLowerCase()}` : ''}${f[3] ? `, ${f[3].toLowerCase()}` : ''}`
  );

  const titles = [t1, t2, t3].map((text, i) => ({
    text: clip(text, limit),
    promise: [
      `Leads with the core keyword shoppers search for on ${c.marketplace.label}.`,
      'Benefit-led structure that reads naturally in search results.',
      'Spec-rich format for comparison shoppers.',
    ][i] as string,
  }));

  return { titles, primaryKeyword: c.keywords[0] ?? c.name.split(' ')[0] };
}

function buildBullets(c: Ctx): string[] {
  const f = [...c.features];
  const fallbacks = [
    `Made for ${c.target ? c.target.toLowerCase() : 'everyday use'}`,
    `Great fit for the ${c.category.toLowerCase() || 'category'} market`,
    `Backed by clear sizing and care details you can publish`,
  ];
  while (f.length < 5) f.push(fallbacks[f.length - c.features.length] ?? fallbacks[0]);
  return f.slice(0, 5).map((item) => {
    const [head, ...rest] = item.split(/\s*[--]\s*/);
    if (rest.length && rest.join(' ').length > 2) return `${cap(head)} - ${rest.join(' ').toLowerCase()}`;
    return cap(item);
  });
}

function buildDescription(c: Ctx): string {
  const intros = [
    `Meet the ${c.name}${c.category ? ` - a standout pick in ${c.category.toLowerCase()}` : ''}.`,
    `The ${c.name} is built for ${c.target ? c.target.toLowerCase() : 'buyers who want dependable quality'}.`,
  ];
  const mid = c.features.length
    ? `It comes with ${joinAnd(c.features.slice(0, 3).map((x) => x.toLowerCase()))}, so you get performance where it counts.`
    : 'Every detail is chosen to keep the experience simple, reliable, and pleasant to use.';
  const end = `If you are shopping for ${kw(c, 0)}${c.keywords[1] ? ` or ${c.keywords[1]}` : ''}, this is a straightforward choice - clear value, no compromises on the essentials.`;

  return [intros[stable(c.name) % 2], mid, end].join('\n\n');
}

function buildAudit(c: Ctx): { area: string; issue: string; fix: string }[] {
  return [
    {
      area: 'Title',
      issue: 'Primary keyword not front-loaded; length exceeds the ideal window.',
      fix: `Open with "${kw(c, 0)}" and keep the full title within ${c.marketplace.titleLimit} characters.`,
    },
    {
      area: 'Bullets',
      issue: 'Features listed, but benefits and outcomes are missing.',
      fix: 'Rewrite each bullet as a benefit statement and keep one idea per bullet.',
    },
    {
      area: 'Keywords',
      issue: 'No long-tail phrases targeting buyer intent.',
      fix: `Add intent phrases like "best ${kw(c, 0)} for ${c.target ? c.target.split(' ').slice(0, 3).join(' ').toLowerCase() : 'daily use'}".`,
    },
    {
      area: 'Description',
      issue: 'Opening paragraph repeats the title instead of selling the product.',
      fix: 'Lead with the problem the product solves for the target customer, then follow with specs.',
    },
  ];
}

/** Main demo entry point - deterministic output per tool. */
export function runDemoGeneration(
  toolId: ToolId,
  inputs: GenerationInputs
): ToolOutput {
  const c = ctxOf(inputs);

  switch (toolId) {
    case 'product-title-generator':
      return buildTitles(c);

    case 'seo-product-description': {
      const seoTitle = clip(`${c.name}${c.keywords[0] ? ` | ${cap(c.keywords[0])}` : ''}`, 65);
      const metaDescription = clip(
        `Shop the ${c.name}. ${c.features[0] ? cap(c.features[0]) + '. ' : ''}${c.target ? `Perfect for ${c.target.toLowerCase()}.` : ''} Order today.`,
        155
      );
      return {
        seoTitle,
        metaDescription,
        description: buildDescription(c),
        bullets: buildBullets(c),
      };
    }

    case 'marketplace-listing-optimizer': {
      const titles = buildTitles(c) as { titles: { text: string }[] };
      return {
        audit: buildAudit(c),
        title: titles.titles[0].text,
        bullets: buildBullets(c),
        description: buildDescription(c),
        keywords: [
          ...c.keywords.slice(0, 3),
          `${c.name.toLowerCase()}`,
          `best ${kw(c, 0)}`,
          `${kw(c, 0)} ${c.marketplace.id === 'general' ? 'online' : `for ${c.marketplace.label.toLowerCase()}`}`,
        ].slice(0, 8),
      };
    }

    case 'ad-copy-generator': {
      return {
        angles: [
          {
            angle: 'Problem → solution',
            hook: c.target ? `Still settling for less than you deserve?` : 'Upgrade your everyday essentials.',
            primaryText: `If you deal with the problems most ${kw(c, 0)} shoppers know too well, the ${c.name} is the fix - ${c.features[0] ? c.features[0].toLowerCase() : 'built around what actually matters'}. See why buyers keep coming back.`,
            cta: 'Shop now',
          },
          {
            angle: 'Feature spotlight',
            hook: c.features[0] ? cap(c.features[0]) : 'Details that make the difference.',
            primaryText: `We obsessed over the details so you do not have to. ${c.name}${c.features[1] ? ` includes ${c.features[1].toLowerCase()}` : ''} - made for ${c.target ? c.target.toLowerCase() : 'everyday use'}.`,
            cta: 'See it today',
          },
          {
            angle: 'Value angle',
            hook: 'Quality that speaks for itself.',
            primaryText: `The ${c.name} delivers where it counts: ${joinAnd(c.features.slice(0, 2).map((x) => x.toLowerCase())) || 'smart design and dependable performance'}. A smart pick for ${kw(c, 0)} shoppers who want real value.`,
            cta: 'Get yours',
          },
        ],
        hashtags: c.keywords.map((k) => k.replace(/\s+/g, '')).slice(0, 8),
      };
    }

    case 'social-caption-generator': {
      const chosen = String(inputs.platform ?? 'instagram');
      const others = ['instagram', 'tiktok', 'facebook'].filter((p) => p !== chosen).slice(0, 2);
      const make = (platform: string) => ({
        platform,
        caption:
          platform === 'tiktok'
            ? `${cap(c.name)} - yes, it is really like this 😍 ${c.features[0] ? cap(c.features[0]) + '.' : ''} Link in bio.`
            : `New favorite alert: the ${c.name} ✨ ${c.features[0] ? cap(c.features[0]) + '.' : ''} ${c.target ? `Made for ${c.target.toLowerCase()}.` : ''} Tap to shop.`,
        hashtags: [...c.keywords.map((k) => k.replace(/\s+/g, '').toLowerCase()), c.marketplace.id, 'newin'].slice(0, 10),
      });
      return { captions: [make(chosen), ...others.map(make)] };
    }

    case 'support-reply-generator': {
      const message = String(inputs.customerMessage ?? '').toLowerCase();
      const referencing = c.name ? `your order for the ${c.name}` : 'your order';
      const apology = /late|delay|not arrived|still waiting|days/.test(message)
        ? `I am really sorry about the delay with ${referencing} - that is not the experience we want for you.`
        : /broken|damaged|wrong|defect/.test(message)
          ? `I am very sorry to hear about the issue with ${referencing}. We will make this right.`
          : `Thanks so much for reaching out about ${referencing}.`;
      return {
        replies: [
          {
            scenario: 'Empathetic + resolution',
            reply: `${apology}\n\nI have flagged this to our team and here is what happens next: we will review the details and follow up with you within 24 hours with a concrete solution. If you can reply with your order number, I will get you a faster answer.\n\nThank you for your patience - we appreciate you.`,
          },
          {
            scenario: 'Concise + options',
            reply: `Hi there - thanks for your message about ${referencing}. To help you fast, could you confirm your order number and the email used at checkout? Once I have that, I can look into this right away.\n\nIn the meantime, I have logged your issue so it is tracked on our side.`,
          },
        ],
        escalationNote:
          'Escalate to a human agent if the customer asks for a refund beyond policy, references legal action, or a platform case has been opened.',
      };
    }

    case 'brand-voice-generator': {
      const name = c.name || c.category || 'Your brand';
      return {
        voiceName: `${name} - ${cap(c.tone)} ${c.category ? c.category.split(' ')[0].toLowerCase() : 'store'} voice`,
        summary: `A ${c.tone} voice for ${name} aimed at ${c.target ? c.target.toLowerCase() : 'modern e-commerce buyers'}. It sounds like a knowledgeable friend: specific, warm, and free of hype.`,
        toneRules: [
          'Lead with the buyer benefit before the feature.',
          'Talk like a knowledgeable friend - never salesy or robotic.',
          `Stay ${c.tone}; avoid corporate jargon.`,
          'Short sentences. Concrete details. No empty promises.',
        ],
        vocabulary: {
          use: [...c.keywords.slice(0, 3), 'everyday', 'crafted', 'reliable', 'designed for'],
          avoid: ['cheap', 'miracle', 'best ever', 'guaranteed', 'one-size-fits-all'],
        },
        sampleLines: [
          `${cap(c.name)}: built for ${c.target ? c.target.toLowerCase() : 'real life'}, priced for right now.`,
          `No gimmicks - just ${c.features[0] ? c.features[0].toLowerCase() : 'the details that matter'}, done properly.`,
          `If it is not better for you, it is not finished. That is the standard.`,
        ],
      };
    }

    case 'keyword-assistant': {
      const base = kw(c, 0);
      return {
        primary: [base, `best ${base}`, `${base} online`, `buy ${base}`].slice(0, 6),
        longTail: [
          `best ${base} for ${c.target ? c.target.split(' ').slice(0, 4).join(' ').toLowerCase() : 'everyday use'}`,
          `${base} with ${(c.features[0] ?? 'quality materials').toLowerCase()}`,
          `affordable ${base} for ${c.marketplace.id === 'general' ? 'home delivery' : c.marketplace.label.toLowerCase()}`,
          `${base} reviews`,
          `${base} buying guide`,
        ],
        related: [
          ...c.keywords.slice(1, 4),
          `${c.category.toLowerCase() || base + ' collection'}`,
          `gift ideas ${base}`,
        ].slice(0, 6),
        searchIntentNotes: `Shoppers searching "${base}" are mostly in buying mode. Lead with transactional keywords ("buy", "best", "price") in titles and ads, and use long-tail phrases in descriptions. ${c.marketplace.id === 'etsy' ? 'On Etsy, prioritize gift and occasion phrases.' : ''}`.trim(),
      };
    }

    case 'bulk-content-generator': {
      const items = parseBulkProducts(String(inputs.products ?? ''), 10);
      const limit = c.marketplace.titleLimit;
      return {
        items: items.map((item) => ({
          productName: item.name,
          title: clip(
            `${cap(item.name)}${item.details ? ` - ${cap(item.details.split(/[,\n;]/)[0] ?? '')}` : ` - ${cap(kw(c, 0))}`}`,
            limit
          ),
          description: `${cap(item.name)}${item.details ? `: ${item.details}` : ''}. Designed for ${c.target ? c.target.toLowerCase() : 'everyday buyers'}, with the details that matter up front. A clean, reliable pick for ${kw(c, 0)} shoppers - ready to publish on ${c.marketplace.label}.`,
        })),
      };
    }

    default:
      return { message: 'Demo output unavailable for this tool.' };
  }
}
