import { TOOL_BY_ID } from '@/lib/tools/registry';
import type { ToolId } from '@/lib/tools/registry';

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function clip(s: string, limit: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= limit ? t : t.slice(0, limit - 1).trimEnd() + '…';
}

/** Short one-line preview of a generation output, for lists. */
export function summarizeOutput(toolId: string, output: unknown): string {
  if (!isRec(output)) return '';
  switch (toolId) {
    case 'product-title-generator': {
      const first = arr(output.titles)[0];
      return clip(str(isRec(first) ? first.text : undefined), 120);
    }
    case 'seo-product-description':
      return clip(str(output.seoTitle), 120);
    case 'marketplace-listing-optimizer':
      return clip(`Optimized: ${str(output.title)}`, 120);
    case 'ad-copy-generator': {
      const first = arr(output.angles)[0];
      return clip(`Ad angle: ${str(isRec(first) ? first.hook : undefined)}`, 120);
    }
    case 'social-caption-generator': {
      const first = arr(output.captions)[0];
      return clip(isRec(first) ? str(first.caption) : '', 120);
    }
    case 'support-reply-generator': {
      const first = arr(output.replies)[0];
      return clip(isRec(first) ? str(first.reply) : '', 120);
    }
    case 'brand-voice-generator':
      return clip(str(output.voiceName), 120);
    case 'keyword-assistant':
      return clip(arr(output.primary).map((k) => str(k)).join(', '), 120);
    case 'bulk-content-generator':
      return `${arr(output.items).length} products generated`;
    default:
      return '';
  }
}

/** Suggested title when saving to the library. */
export function suggestSavedTitle(
  toolId: string,
  output: unknown,
  productName?: string
): string {
  const tool = TOOL_BY_ID[toolId as ToolId];
  const base = productName?.trim() || '';
  if (!isRec(output)) return tool ? `${tool.shortName}` : 'Saved output';
  if (toolId === 'brand-voice-generator') {
    return str(output.voiceName, base || 'Brand voice');
  }
  if (toolId === 'bulk-content-generator') {
    return `Bulk content - ${arr(output.items).length} products`;
  }
  return base ? `${base} - ${tool?.shortName ?? 'Output'}` : (tool?.shortName ?? 'Saved output');
}

function humanize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

function renderValue(label: string, value: unknown, lines: string[], indent = 0) {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return;
  if (typeof value === 'string' || typeof value === 'number') {
    lines.push(`${pad}${label}: ${value}`);
    return;
  }
  if (Array.isArray(value)) {
    if (!value.length) return;
    lines.push(`${pad}${label}:`);
    value.forEach((item, i) => {
      if (typeof item === 'string' || typeof item === 'number') {
        lines.push(`${'  '.repeat(indent + 1)}${i + 1}. ${item}`);
      } else if (isRec(item)) {
        lines.push(`${'  '.repeat(indent + 1)}${i + 1}.`);
        Object.entries(item).forEach(([k, v]) =>
          renderValue(humanize(k), v, lines, indent + 2)
        );
      } else {
        lines.push(`${'  '.repeat(indent + 1)}${i + 1}. ${String(item)}`);
      }
    });
    return;
  }
  if (isRec(value)) {
    lines.push(`${pad}${label}:`);
    Object.entries(value).forEach(([k, v]) =>
      renderValue(humanize(k), v, lines, indent + 1)
    );
  }
}

/** Human-readable export text for a tool output (.txt / copy button). */
export function buildExportText(
  toolId: string,
  output: unknown,
  meta?: { marketplace?: string | null; tone?: string | null; source?: string }
): string {
  const tool = TOOL_BY_ID[toolId as ToolId];
  const lines: string[] = [];
  lines.push(`AsiaBD Commerce AI - ${tool?.name ?? toolId}`);
  if (meta?.marketplace) lines.push(`Marketplace: ${meta.marketplace}`);
  if (meta?.tone) lines.push(`Tone: ${meta.tone}`);
  if (meta?.source) lines.push(`Source: ${meta.source}`);
  lines.push('─'.repeat(48));
  if (isRec(output)) {
    Object.entries(output).forEach(([k, v]) => renderValue(humanize(k), v, lines));
  }
  return lines.join('\n');
}

/** CSV export for the Bulk Content Generator. */
export function buildBulkCsv(output: unknown): string {
  if (!isRec(output)) return '';
  const escape = (s: string) => `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const rows = [['product_name', 'title', 'description'].join(',')];
  arr(output.items).forEach((item) => {
    if (!isRec(item)) return;
    rows.push(
      [
        escape(str(item.productName)),
        escape(str(item.title)),
        escape(str(item.description)),
      ].join(',')
    );
  });
  return rows.join('\r\n');
}
