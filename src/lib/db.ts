import BetterSqlite3 from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '@/lib/errors';
import { summarizeOutput, suggestSavedTitle } from '@/lib/output-utils';
import type {
  GenerationInputs,
  GenerationSummary,
  LedgerEntry,
  OverviewResponse,
  SavedItem,
  TopToolStat,
} from '@/lib/types';

type SqliteDb = BetterSqlite3.Database;

const globalForDb = globalThis as unknown as { __asiabdDb?: SqliteDb };

function startingCredits(): number {
  const n = Number(process.env.ASIABD_STARTING_CREDITS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 50;
}

function dbFilePath(): string {
  return (
    process.env.ASIABD_DB_PATH?.trim() ||
    path.join(process.cwd(), 'data', 'asiabd.db')
  );
}

function migrate(d: SqliteDb) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      credits INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      tool_id TEXT NOT NULL,
      marketplace TEXT,
      tone TEXT,
      source TEXT NOT NULL,
      inputs TEXT NOT NULL,
      output TEXT NOT NULL,
      credits_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_generations_ws
      ON generations (workspace_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS saved_items (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      generation_id TEXT,
      tool_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      marketplace TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_saved_ws
      ON saved_items (workspace_id, updated_at DESC);

    CREATE TABLE IF NOT EXISTS credit_ledger (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reason TEXT,
      tool_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_ledger_ws
      ON credit_ledger (workspace_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user
      ON auth_sessions (user_id);
  `);
}

export function getDb(): SqliteDb {
  if (!globalForDb.__asiabdDb) {
    const file = dbFilePath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const d = new BetterSqlite3(file);
    d.pragma('journal_mode = WAL');
    migrate(d);
    globalForDb.__asiabdDb = d;
  }
  return globalForDb.__asiabdDb;
}

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ------------------------------- workspaces ------------------------------- */

interface WorkspaceRow {
  id: string;
  credits: number;
}

export function getOrCreateWorkspace(id: string): WorkspaceRow {
  const d = getDb();
  const existing = d
    .prepare('SELECT id, credits FROM workspaces WHERE id = ?')
    .get(id) as WorkspaceRow | undefined;
  if (existing) return existing;

  const tx = d.transaction(() => {
    const info = d
      .prepare('INSERT OR IGNORE INTO workspaces (id, credits) VALUES (?, ?)')
      .run(id, startingCredits());
    if (info.changes > 0) {
      d.prepare(
        `INSERT INTO credit_ledger (id, workspace_id, type, amount, balance_after, reason, tool_id)
         VALUES (?, ?, 'grant', ?, ?, 'Welcome credits', NULL)`
      ).run(randomUUID(), id, startingCredits(), startingCredits());
      seedDemoLibrary(id);
    }
  });
  tx();

  return d
    .prepare('SELECT id, credits FROM workspaces WHERE id = ?')
    .get(id) as WorkspaceRow;
}

export function getCredits(workspaceId: string): number {
  const row = getOrCreateWorkspace(workspaceId);
  return row.credits;
}

function seedDemoLibrary(workspaceId: string) {
  const d = getDb();
  const now = new Date().toISOString();
  const items = [
    {
      toolId: 'product-title-generator',
      title: 'AeroStride Everyday Running Shoes - Title Generator',
      marketplace: 'amazon',
      tags: ['demo', 'shoes'],
      content: JSON.stringify({
        titles: [
          {
            text: 'AeroStride Everyday Running Shoes - Breathable Knit Upper',
            promise: 'Leads with the core keyword shoppers search for on Amazon.',
          },
          {
            text: 'Running Shoes: AeroStride with memory-foam insole',
            promise: 'Benefit-led structure that reads naturally in search results.',
          },
          {
            text: 'AeroStride Everyday Running Shoes, anti-slip rubber outsole, lightweight 260g',
            promise: 'Spec-rich format for comparison shoppers.',
          },
        ],
        primaryKeyword: 'running shoes',
      }),
    },
    {
      toolId: 'seo-product-description',
      title: 'GlowDrop Vitamin C Serum - SEO Description',
      marketplace: 'shopify',
      tags: ['demo', 'skincare'],
      content: JSON.stringify({
        seoTitle: 'GlowDrop Vitamin C Serum | Brightening Daily Serum',
        metaDescription:
          'Shop GlowDrop Vitamin C Serum. 15% vitamin C with hyaluronic acid, fragrance-free. Bright, hydrated skin in your daily routine.',
        description:
          'Meet the GlowDrop Vitamin C Serum - a standout pick in facial serums & treatments.\n\nIt comes with 15% vitamin C, hyaluronic acid, and a fragrance-free formula, so you get performance where it counts.\n\nIf you are shopping for vitamin c serum or brightening serum, this is a straightforward choice - clear value, no compromises on the essentials.',
        bullets: [
          '15% vitamin C - supports a brighter, more even look',
          'Hyaluronic acid - comfortable hydration that layers well',
          'Fragrance-free formula - gentle for daily routines',
          '30ml amber bottle - protects the formula from light',
          'Suitable for daily use - morning or evening',
        ],
      }),
    },
    {
      toolId: 'brand-voice-generator',
      title: 'GlowDrop - Confident skincare voice',
      marketplace: null,
      tags: ['demo', 'skincare'],
      content: JSON.stringify({
        voiceName: 'GlowDrop - Confident skincare voice',
        summary:
          'A friendly, expert voice for skincare shoppers aged 20-40. Sounds like a knowledgeable friend: specific, warm, and free of hype.',
        toneRules: [
          'Lead with the skin benefit before the ingredient.',
          'Talk like a knowledgeable friend - never salesy or clinical.',
          'Stay friendly; avoid corporate jargon.',
          'Short sentences. Concrete details. No empty promises.',
        ],
        vocabulary: {
          use: ['bright', 'hydrated', 'daily ritual', 'gentle', 'glow'],
          avoid: ['miracle', 'instantly', 'best ever', 'guaranteed'],
        },
        sampleLines: [
          'Vitamin C that fits your morning, not the other way around.',
          'No gimmicks - just bright, hydrated skin you can see.',
          'Swap five minutes of guesswork for one simple step.',
        ],
      }),
    },
  ];

  const insert = d.prepare(
    `INSERT INTO saved_items (id, workspace_id, generation_id, tool_id, title, content, marketplace, tags, created_at, updated_at)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const item of items) {
    insert.run(
      randomUUID(),
      workspaceId,
      item.toolId,
      item.title,
      item.content,
      item.marketplace,
      JSON.stringify(item.tags),
      now,
      now
    );
  }
}

/* ------------------------------- generations ------------------------------ */

export interface CompleteGenerationParams {
  workspaceId: string;
  toolId: string;
  marketplace: string | null;
  tone: string | null;
  source: 'claude' | 'demo';
  inputs: GenerationInputs;
  output: unknown;
  cost: number;
}

export function completeGeneration(params: CompleteGenerationParams): {
  generationId: string;
  balance: number;
} {
  const d = getDb();
  const tx = d.transaction(() => {
    const ws = d
      .prepare('SELECT credits FROM workspaces WHERE id = ?')
      .get(params.workspaceId) as { credits: number } | undefined;
    if (!ws) throw new AppError('not_found', 'Workspace not found.');

    if (ws.credits < params.cost) {
      throw new AppError(
        'insufficient_credits',
        `Not enough credits - this run costs ${params.cost}, you have ${ws.credits}.`
      );
    }

    const balance = ws.credits - params.cost;
    const generationId = randomUUID();

    d.prepare('UPDATE workspaces SET credits = ? WHERE id = ?').run(
      balance,
      params.workspaceId
    );
    d.prepare(
      `INSERT INTO generations (id, workspace_id, tool_id, marketplace, tone, source, inputs, output, credits_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      generationId,
      params.workspaceId,
      params.toolId,
      params.marketplace,
      params.tone,
      params.source,
      JSON.stringify(params.inputs),
      JSON.stringify(params.output),
      params.cost
    );

    if (params.cost > 0) {
      d.prepare(
        `INSERT INTO credit_ledger (id, workspace_id, type, amount, balance_after, reason, tool_id)
         VALUES (?, ?, 'usage', ?, ?, ?, ?)`
      ).run(
        randomUUID(),
        params.workspaceId,
        params.cost,
        balance,
        'Generation',
        params.toolId
      );
    }

    return { generationId, balance };
  });

  return tx();
}

export function listGenerations(
  workspaceId: string,
  limit = 20
): GenerationSummary[] {
  const d = getDb();
  const rows = d
    .prepare(
      `SELECT id, tool_id, marketplace, source, credits_used, output, created_at
       FROM generations WHERE workspace_id = ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .all(workspaceId, limit) as Array<{
    id: string;
    tool_id: string;
    marketplace: string | null;
    source: string;
    credits_used: number;
    output: string;
    created_at: string;
  }>;

  return rows.map((row) => {
    const output = parseJson<Record<string, unknown>>(row.output, {});
    return {
      id: row.id,
      toolId: row.tool_id,
      marketplace: row.marketplace,
      source: row.source,
      credits: row.credits_used,
      createdAt: row.created_at,
      preview: summarizeOutput(row.tool_id, output),
    };
  });
}

export function topTools(workspaceId: string, limit = 5): TopToolStat[] {
  const d = getDb();
  const rows = d
    .prepare(
      `SELECT tool_id, COUNT(*) as count, SUM(credits_used) as credits
       FROM generations WHERE workspace_id = ?
       GROUP BY tool_id ORDER BY count DESC LIMIT ?`
    )
    .all(workspaceId, limit) as Array<{
    tool_id: string;
    count: number;
    credits: number | null;
  }>;
  return rows.map((r) => ({
    toolId: r.tool_id,
    count: r.count,
    credits: r.credits ?? 0,
  }));
}

export function listLedger(workspaceId: string, limit = 15): LedgerEntry[] {
  const d = getDb();
  const rows = d
    .prepare(
      `SELECT id, type, amount, balance_after, reason, tool_id, created_at
       FROM credit_ledger WHERE workspace_id = ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .all(workspaceId, limit) as Array<{
    id: string;
    type: LedgerEntry['type'];
    amount: number;
    balance_after: number;
    reason: string | null;
    tool_id: string | null;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    balanceAfter: r.balance_after,
    reason: r.reason,
    toolId: r.tool_id,
    createdAt: r.created_at,
  }));
}

/* ------------------------------ saved items ------------------------------- */

interface SavedItemRow {
  id: string;
  tool_id: string;
  title: string;
  content: string;
  marketplace: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
}

function mapSavedItem(row: SavedItemRow): SavedItem {
  return {
    id: row.id,
    toolId: row.tool_id,
    title: row.title,
    content: row.content,
    marketplace: row.marketplace,
    tags: parseJson<string[]>(row.tags, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listSavedItems(
  workspaceId: string,
  filters?: { toolId?: string; marketplace?: string; q?: string }
): SavedItem[] {
  const d = getDb();
  const clauses = ['workspace_id = ?'];
  const params: Array<string> = [workspaceId];

  if (filters?.toolId) {
    clauses.push('tool_id = ?');
    params.push(filters.toolId);
  }
  if (filters?.marketplace) {
    clauses.push('marketplace = ?');
    params.push(filters.marketplace);
  }
  if (filters?.q) {
    clauses.push('(title LIKE ? OR content LIKE ?)');
    const like = `%${filters.q}%`;
    params.push(like, like);
  }

  const rows = d
    .prepare(
      `SELECT id, tool_id, title, content, marketplace, tags, created_at, updated_at
       FROM saved_items WHERE ${clauses.join(' AND ')}
       ORDER BY updated_at DESC LIMIT 200`
    )
    .all(...params) as SavedItemRow[];

  return rows.map(mapSavedItem);
}

export function countSavedItems(workspaceId: string): number {
  const d = getDb();
  const row = d
    .prepare('SELECT COUNT(*) as c FROM saved_items WHERE workspace_id = ?')
    .get(workspaceId) as { c: number };
  return row.c;
}

export function getSavedItem(
  workspaceId: string,
  itemId: string
): SavedItem | null {
  const d = getDb();
  const row = d
    .prepare(
      `SELECT id, tool_id, title, content, marketplace, tags, created_at, updated_at
       FROM saved_items WHERE id = ? AND workspace_id = ?`
    )
    .get(itemId, workspaceId) as SavedItemRow | undefined;
  return row ? mapSavedItem(row) : null;
}

export function insertSavedItem(params: {
  workspaceId: string;
  toolId: string;
  title: string;
  content: string;
  marketplace?: string | null;
  tags?: string[];
  generationId?: string | null;
}): SavedItem {
  const d = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  d.prepare(
    `INSERT INTO saved_items (id, workspace_id, generation_id, tool_id, title, content, marketplace, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    params.workspaceId,
    params.generationId ?? null,
    params.toolId,
    params.title,
    params.content,
    params.marketplace ?? null,
    JSON.stringify(params.tags ?? []),
    now,
    now
  );
  return getSavedItem(params.workspaceId, id) as SavedItem;
}

export function updateSavedItem(
  workspaceId: string,
  itemId: string,
  updates: { title?: string; content?: string; tags?: string[] }
): SavedItem | null {
  const existing = getSavedItem(workspaceId, itemId);
  if (!existing) return null;
  const d = getDb();
  d.prepare(
    `UPDATE saved_items SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ? AND workspace_id = ?`
  ).run(
    updates.title ?? existing.title,
    updates.content ?? existing.content,
    JSON.stringify(updates.tags ?? existing.tags),
    new Date().toISOString(),
    itemId,
    workspaceId
  );
  return getSavedItem(workspaceId, itemId);
}

export function deleteSavedItem(workspaceId: string, itemId: string): boolean {
  const d = getDb();
  const info = d
    .prepare('DELETE FROM saved_items WHERE id = ? AND workspace_id = ?')
    .run(itemId, workspaceId);
  return info.changes > 0;
}

/* -------------------------------- overview -------------------------------- */

export function getOverview(workspaceId: string): Omit<OverviewResponse, 'demoMode'> {
  getOrCreateWorkspace(workspaceId);
  return {
    credits: getCredits(workspaceId),
    ledger: listLedger(workspaceId, 12),
    generations: listGenerations(workspaceId, 10),
    topTools: topTools(workspaceId, 5),
    savedCount: countSavedItems(workspaceId),
  };
}

/** Format a saved brand voice item into prompt-ready text. */
export function brandVoiceToPromptText(content: string): string {
  try {
    const v = JSON.parse(content) as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof v.voiceName === 'string') parts.push(`Voice: ${v.voiceName}`);
    if (typeof v.summary === 'string') parts.push(`Summary: ${v.summary}`);
    if (Array.isArray(v.toneRules))
      parts.push(`Tone rules:\n- ${(v.toneRules as string[]).join('\n- ')}`);
    if (v.vocabulary && typeof v.vocabulary === 'object') {
      const vocab = v.vocabulary as { use?: string[]; avoid?: string[] };
      if (vocab.use?.length) parts.push(`Preferred words: ${vocab.use.join(', ')}`);
      if (vocab.avoid?.length) parts.push(`Avoid words: ${vocab.avoid.join(', ')}`);
    }
    if (Array.isArray(v.sampleLines))
      parts.push(`Sample lines:\n- ${(v.sampleLines as string[]).join('\n- ')}`);
    return parts.join('\n') || content;
  } catch {
    return content;
  }
}

export { suggestSavedTitle };
