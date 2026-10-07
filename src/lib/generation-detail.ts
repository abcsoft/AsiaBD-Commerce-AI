import { getDb } from '@/lib/db';
import type { ToolOutput } from '@/lib/types';

export interface GenerationDetail {
  id: string;
  toolId: string;
  marketplace: string | null;
  tone: string | null;
  source: string;
  output: ToolOutput;
  createdAt: string;
}

export function getGenerationDetail(
  workspaceId: string,
  id: string
): GenerationDetail | null {
  const d = getDb();
  const row = d
    .prepare(
      `SELECT id, tool_id, marketplace, tone, source, output, created_at
       FROM generations WHERE id = ? AND workspace_id = ?`
    )
    .get(id, workspaceId) as
    | {
        id: string;
        tool_id: string;
        marketplace: string | null;
        tone: string | null;
        source: string;
        output: string;
        created_at: string;
      }
    | undefined;

  if (!row) return null;

  let output: ToolOutput = {};
  try {
    output = JSON.parse(row.output) as ToolOutput;
  } catch {
    output = {};
  }

  return {
    id: row.id,
    toolId: row.tool_id,
    marketplace: row.marketplace,
    tone: row.tone,
    source: row.source,
    output,
    createdAt: row.created_at,
  };
}
