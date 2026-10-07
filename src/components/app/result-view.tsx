'use client';

import { getMarketplace } from '@/lib/marketplaces';
import { cn } from '@/lib/utils';

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const asStr = (v: unknown): string => (typeof v === 'string' ? v : '');
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

interface ResultViewProps {
  toolId: string;
  value: Rec;
  onChange?: (next: Rec) => void;
  compact?: boolean;
  marketplaceId?: string | null;
}

function CharCount({ text, limit }: { text: string; limit: number }) {
  const over = text.length > limit;
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        over ? 'text-error-600 font-medium' : 'text-gray-400 dark:text-gray-500'
      )}
    >
      {text.length}/{limit}
    </span>
  );
}

function SectionCard({
  title,
  children,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-primary p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h4>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Field({
  value,
  onChange,
  rows = 2,
  className,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  rows?: number;
  className?: string;
  placeholder?: string;
}) {
  if (!onChange) {
    return (
      <p className={cn('text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap', className)}>
        {value || '-'}
      </p>
    );
  }
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full resize-y rounded-xl border border-transparent bg-transparent px-2 py-1.5 -mx-2 text-sm text-gray-700 dark:text-gray-300',
        'hover:border-gray-200 dark:hover:border-gray-700 focus:border-primary-300 focus:outline-0 focus:ring-2 focus:ring-primary-300/20',
        'dark:focus:border-primary-500 transition',
        className
      )}
    />
  );
}

export default function ResultView({
  toolId,
  value,
  onChange,
  compact,
  marketplaceId,
}: ResultViewProps) {
  const update = (key: string, v: unknown) => onChange?.({ ...value, [key]: v });

  const updateArr = (
    key: string,
    index: number,
    field: string | null,
    v: unknown
  ) => {
    const arr = [...asArr(value[key])];
    if (field === null) {
      arr[index] = v;
    } else if (isRec(arr[index])) {
      arr[index] = { ...(arr[index] as Rec), [field]: v };
    }
    update(key, arr);
  };

  const updateNested = (key: string, sub: string, v: unknown) => {
    const obj = isRec(value[key]) ? (value[key] as Rec) : {};
    update(key, { ...obj, [sub]: v });
  };

  const linesToArr = (s: string) =>
    s
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

  const arrToLines = (v: unknown) => asArr(v).map((x) => asStr(x)).join('\n');

  const limit = marketplaceId
    ? getMarketplace(marketplaceId).titleLimit
    : undefined;

  const editable = !compact && Boolean(onChange);

  switch (toolId) {
    case 'product-title-generator': {
      const titles = asArr(value.titles).filter(isRec);
      return (
        <div className="space-y-4">
          {titles.map((t, i) => (
            <SectionCard
              key={i}
              title={`Title option ${i + 1}`}
              aside={
                limit ? <CharCount text={asStr(t.text)} limit={limit} /> : undefined
              }
            >
              <Field
                value={asStr(t.text)}
                onChange={editable ? (v) => updateArr('titles', i, 'text', v) : undefined}
                rows={2}
                className="font-medium text-gray-800 dark:text-white/90"
              />
              {(asStr(t.promise) || editable) && (
                <Field
                  value={asStr(t.promise)}
                  onChange={editable ? (v) => updateArr('titles', i, 'promise', v) : undefined}
                  rows={1}
                  className="text-gray-500"
                  placeholder="Why this angle works"
                />
              )}
            </SectionCard>
          ))}
          {asStr(value.primaryKeyword) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Primary keyword: <strong>{asStr(value.primaryKeyword)}</strong>
            </p>
          )}
        </div>
      );
    }

    case 'seo-product-description': {
      return (
        <div className="space-y-4">
          <SectionCard
            title="SEO title"
            aside={<CharCount text={asStr(value.seoTitle)} limit={65} />}
          >
            <Field
              value={asStr(value.seoTitle)}
              onChange={editable ? (v) => update('seoTitle', v) : undefined}
              rows={1}
            />
          </SectionCard>
          <SectionCard
            title="Meta description"
            aside={<CharCount text={asStr(value.metaDescription)} limit={155} />}
          >
            <Field
              value={asStr(value.metaDescription)}
              onChange={editable ? (v) => update('metaDescription', v) : undefined}
            />
          </SectionCard>
          <SectionCard title="Description">
            <Field
              value={asStr(value.description)}
              onChange={editable ? (v) => update('description', v) : undefined}
              rows={7}
            />
          </SectionCard>
          <SectionCard title="Highlight bullets">
            <Field
              value={arrToLines(value.bullets)}
              onChange={
                editable ? (v) => update('bullets', linesToArr(v)) : undefined
              }
              rows={5}
            />
          </SectionCard>
        </div>
      );
    }

    case 'marketplace-listing-optimizer': {
      const audit = asArr(value.audit).filter(isRec);
      return (
        <div className="space-y-4">
          <SectionCard title="Listing audit">
            <div className="space-y-3">
              {audit.map((row, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"
                >
                  <div className="mb-1">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-500">
                      {asStr(row.area)}
                    </span>
                  </div>
                  <Field
                    value={asStr(row.issue)}
                    onChange={editable ? (v) => updateArr('audit', i, 'issue', v) : undefined}
                    rows={1}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Field
                    value={asStr(row.fix)}
                    onChange={editable ? (v) => updateArr('audit', i, 'fix', v) : undefined}
                    rows={1}
                    className="text-gray-800 dark:text-white/90"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard
            title="Optimized title"
            aside={
              limit ? <CharCount text={asStr(value.title)} limit={limit} /> : undefined
            }
          >
            <Field
              value={asStr(value.title)}
              onChange={editable ? (v) => update('title', v) : undefined}
            />
          </SectionCard>
          <SectionCard title="Optimized bullets">
            <Field
              value={arrToLines(value.bullets)}
              onChange={
                editable ? (v) => update('bullets', linesToArr(v)) : undefined
              }
              rows={5}
            />
          </SectionCard>
          <SectionCard title="Optimized description">
            <Field
              value={asStr(value.description)}
              onChange={editable ? (v) => update('description', v) : undefined}
              rows={7}
            />
          </SectionCard>
          <SectionCard title="Keywords">
            <Field
              value={arrToLines(value.keywords)}
              onChange={
                editable ? (v) => update('keywords', linesToArr(v)) : undefined
              }
              rows={3}
            />
          </SectionCard>
        </div>
      );
    }

    case 'ad-copy-generator': {
      const angles = asArr(value.angles).filter(isRec);
      return (
        <div className="space-y-4">
          {angles.map((a, i) => (
            <SectionCard key={i} title={`Angle ${i + 1}`}>
              <div className="space-y-2">
                <Field
                  value={asStr(a.angle)}
                  onChange={editable ? (v) => updateArr('angles', i, 'angle', v) : undefined}
                  rows={1}
                  className="font-semibold text-gray-800 dark:text-white/90"
                />
                <Field
                  value={asStr(a.hook)}
                  onChange={editable ? (v) => updateArr('angles', i, 'hook', v) : undefined}
                  rows={1}
                />
                <Field
                  value={asStr(a.primaryText)}
                  onChange={editable ? (v) => updateArr('angles', i, 'primaryText', v) : undefined}
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">CTA:</span>
                  <Field
                    value={asStr(a.cta)}
                    onChange={editable ? (v) => updateArr('angles', i, 'cta', v) : undefined}
                    rows={1}
                    className="flex-1"
                  />
                </div>
              </div>
            </SectionCard>
          ))}
          {asArr(value.hashtags).length > 0 && (
            <SectionCard title="Hashtags">
              <Field
                value={arrToLines(value.hashtags)}
                onChange={
                  editable ? (v) => update('hashtags', linesToArr(v)) : undefined
                }
                rows={4}
              />
            </SectionCard>
          )}
        </div>
      );
    }

    case 'social-caption-generator': {
      const captions = asArr(value.captions).filter(isRec);
      return (
        <div className="space-y-4">
          {captions.map((c, i) => (
            <SectionCard
              key={i}
              title={asStr(c.platform).replace(/^./, (m) => m.toUpperCase())}
            >
              <Field
                value={asStr(c.caption)}
                onChange={editable ? (v) => updateArr('captions', i, 'caption', v) : undefined}
                rows={4}
              />
              <div className="mt-2">
                <Field
                  value={arrToLines(c.hashtags)
                    .split('\n')
                    .map((h) => (h ? `#${h.replace(/^#/, '')}` : h))
                    .join(' ')}
                  onChange={
                    editable
                      ? (v) =>
                          updateArr(
                            'captions',
                            i,
                            'hashtags',
                            v
                              .split(/\s+/)
                              .map((h) => h.replace(/^#/, '').trim())
                              .filter(Boolean)
                          )
                      : undefined
                  }
                  rows={2}
                  className="text-primary-600 dark:text-primary-400"
                  placeholder="#hashtags"
                />
              </div>
            </SectionCard>
          ))}
        </div>
      );
    }

    case 'support-reply-generator': {
      const replies = asArr(value.replies).filter(isRec);
      return (
        <div className="space-y-4">
          {replies.map((r, i) => (
            <SectionCard key={i} title={asStr(r.scenario) || `Reply ${i + 1}`}>
              <Field
                value={asStr(r.reply)}
                onChange={editable ? (v) => updateArr('replies', i, 'reply', v) : undefined}
                rows={7}
              />
            </SectionCard>
          ))}
          {asStr(value.escalationNote) && (
            <SectionCard title="When to escalate">
              <Field
                value={asStr(value.escalationNote)}
                onChange={
                  editable ? (v) => update('escalationNote', v) : undefined
                }
                rows={2}
                className="text-gray-500"
              />
            </SectionCard>
          )}
        </div>
      );
    }

    case 'brand-voice-generator': {
      const vocab = isRec(value.vocabulary) ? value.vocabulary : {};
      return (
        <div className="space-y-4">
          <SectionCard title="Voice name">
            <Field
              value={asStr(value.voiceName)}
              onChange={editable ? (v) => update('voiceName', v) : undefined}
              rows={1}
              className="font-semibold text-gray-800 dark:text-white/90"
            />
          </SectionCard>
          <SectionCard title="Summary">
            <Field
              value={asStr(value.summary)}
              onChange={editable ? (v) => update('summary', v) : undefined}
              rows={3}
            />
          </SectionCard>
          <SectionCard title="Tone rules">
            <Field
              value={arrToLines(value.toneRules)}
              onChange={
                editable ? (v) => update('toneRules', linesToArr(v)) : undefined
              }
              rows={5}
            />
          </SectionCard>
          <SectionCard title="Vocabulary">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-success-600 mb-1">Use</p>
                <Field
                  value={arrToLines(vocab.use)}
                  onChange={
                    editable
                      ? (v) => updateNested('vocabulary', 'use', linesToArr(v))
                      : undefined
                  }
                  rows={4}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-error-600 mb-1">Avoid</p>
                <Field
                  value={arrToLines(vocab.avoid)}
                  onChange={
                    editable
                      ? (v) => updateNested('vocabulary', 'avoid', linesToArr(v))
                      : undefined
                  }
                  rows={4}
                />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Sample lines">
            <Field
              value={arrToLines(value.sampleLines)}
              onChange={
                editable ? (v) => update('sampleLines', linesToArr(v)) : undefined
              }
              rows={4}
            />
          </SectionCard>
        </div>
      );
    }

    case 'keyword-assistant': {
      return (
        <div className="space-y-4">
          <SectionCard title="Primary keywords">
            <Field
              value={arrToLines(value.primary)}
              onChange={editable ? (v) => update('primary', linesToArr(v)) : undefined}
              rows={4}
            />
          </SectionCard>
          <SectionCard title="Long-tail phrases">
            <Field
              value={arrToLines(value.longTail)}
              onChange={editable ? (v) => update('longTail', linesToArr(v)) : undefined}
              rows={5}
            />
          </SectionCard>
          <SectionCard title="Related terms">
            <Field
              value={arrToLines(value.related)}
              onChange={editable ? (v) => update('related', linesToArr(v)) : undefined}
              rows={4}
            />
          </SectionCard>
          {asStr(value.searchIntentNotes) && (
            <SectionCard title="Search intent notes">
              <Field
                value={asStr(value.searchIntentNotes)}
                onChange={
                  editable ? (v) => update('searchIntentNotes', v) : undefined
                }
                rows={4}
              />
            </SectionCard>
          )}
        </div>
      );
    }

    case 'bulk-content-generator': {
      const items = asArr(value.items).filter(isRec);
      return (
        <div className="space-y-4">
          {items.map((item, i) => (
            <SectionCard key={i} title={asStr(item.productName) || `Product ${i + 1}`}>
              <div className="space-y-2">
                <Field
                  value={asStr(item.productName)}
                  onChange={editable ? (v) => updateArr('items', i, 'productName', v) : undefined}
                  rows={1}
                  className="text-xs uppercase tracking-wide text-gray-400"
                />
                <Field
                  value={asStr(item.title)}
                  onChange={editable ? (v) => updateArr('items', i, 'title', v) : undefined}
                  rows={2}
                  className="font-medium text-gray-800 dark:text-white/90"
                />
                <Field
                  value={asStr(item.description)}
                  onChange={editable ? (v) => updateArr('items', i, 'description', v) : undefined}
                  rows={4}
                />
              </div>
            </SectionCard>
          ))}
        </div>
      );
    }

    default:
      return (
        <pre className="text-xs overflow-auto rounded-xl bg-gray-50 dark:bg-dark-secondary p-4">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
  }
}
