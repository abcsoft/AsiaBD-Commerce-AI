# Vercel/PostgreSQL migration — staged implementation

This branch starts the migration; **it is not deployment-ready**.

## Findings
- `motion/react` is imported in CountUp and Reveal but `motion` was absent from package dependencies.
- Auth and workspace persistence call a synchronous `better-sqlite3` API from `src/lib/auth.ts` and `src/lib/db.ts`.
- Credit updates must remain atomic; moving SQL to async requires updating all calling route handlers and server components.
- `src/lib/rate-limit.ts` uses per-instance memory and must be replaced with a distributed limiter on Vercel.
- SQLite file storage is not durable on serverless functions.

## Stage 1 (this draft PR)
- Declare Motion, PostgreSQL client and pg TypeScript types.
- Add `db/postgres/001_initial.sql` as a schema foundation preserving legacy text date and JSON columns.
- **Pending:** regenerate `package-lock.json` with `npm install` using Node/npm, then run `npm ci`, typecheck, and build; do not merge until lockfile is updated.

## Stage 2 (application cutover)
1. Provision PostgreSQL in a region close to Vercel; use a pooled TLS `DATABASE_URL`; apply schema through a reviewed migration command.
2. Refactor repository functions in `src/lib/db.ts` to async parameterized `pg` queries. Update every caller to await results; remove `better-sqlite3` and filesystem startup.
3. Refactor authentication session and account functions in `src/lib/auth.ts` to async PostgreSQL queries; preserve password hash verification and cookie policy.
4. Create workspace and welcome ledger exactly once in a single transaction; seed examples once using conflict-safe inserts.
5. Generation completion must lock the workspace row (`SELECT ... FOR UPDATE`) and update balance, insert generation and ledger in **one transaction**. Test parallel requests for double spend / overdraw.
6. Migrate saved-item CRUD, dashboard aggregates, and search (SQL LIKE compatibility) with account scoping preserved.
7. If existing SQLite customer data is needed, export/import users, workspaces, sessions, generations, saved items, and ledger with counts and checksums; freeze writes during cutover.
8. Replace in-memory rate limiting with Redis/Upstash for cross-instance enforcement.
9. Add PostgreSQL integration tests for signup/login/session expiry, atomic credits, concurrent generations, saved items, and all API endpoints. Run production build and staging smoke tests.
10. Configure Vercel environments and deploy only after verification; keep a database backup and rollback plan.

## Suggested Vercel env
`DATABASE_URL`, `ANTHROPIC_API_KEY`, `APP_URL=https://asiabd.shop`, optional `DEMO_MODE`, distributed rate-limit credentials.

Do not enter secrets into GitHub or commit local `.env` files.
