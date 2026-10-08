-- Initial PostgreSQL schema for AsiaBD Commerce AI.
-- Apply to a fresh dedicated PostgreSQL database before application cutover.
-- This preserves the SQLite logical columns and JSON text encoding.
BEGIN;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
CREATE TABLE IF NOT EXISTS workspaces (
 id TEXT PRIMARY KEY,
 credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
 created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
CREATE TABLE IF NOT EXISTS generations (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL,
 tool_id TEXT NOT NULL, marketplace TEXT, tone TEXT,
 source TEXT NOT NULL, inputs TEXT NOT NULL, output TEXT NOT NULL,
 credits_used INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_generations_ws ON generations(workspace_id, created_at DESC);
CREATE TABLE IF NOT EXISTS saved_items (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, generation_id TEXT,
 tool_id TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
 marketplace TEXT, tags TEXT NOT NULL DEFAULT '[]',
 created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
 updated_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_saved_ws ON saved_items(workspace_id, updated_at DESC);
CREATE TABLE IF NOT EXISTS credit_ledger (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, type TEXT NOT NULL,
 amount INTEGER NOT NULL, balance_after INTEGER NOT NULL,
 reason TEXT, tool_id TEXT,
 created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);
CREATE INDEX IF NOT EXISTS idx_ledger_ws ON credit_ledger(workspace_id, created_at DESC);
CREATE TABLE IF NOT EXISTS auth_sessions (
 token TEXT PRIMARY KEY, user_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
 expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
COMMIT;
