# Deployment Guide - AsiaBD Commerce AI

The app is a Next.js 15 application with server-side routes (`nodejs` runtime)
backed by a local SQLite database. This guide covers two deployment paths:
a **Node server with a persistent disk (recommended)** and **Vercel + managed
Postgres** (serverless, requires a storage swap).

---

## 1. Option A - Node server with persistent disk (recommended)

Works on Railway, Render, Fly.io, a VPS (Hetzner/DigitalOcean), or any host
that runs a long-lived Node process with a persistent volume. This is the
zero-modification path - the SQLite database simply lives on disk.

**Steps**

1. Provision a Node 20+ instance with a persistent volume (e.g. mount at `/data`).
2. Clone the repo and install:

   ```bash
   npm ci
   npm run build
   ```

3. Configure environment variables (see checklist below), including:

   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   APP_URL=https://asiabd.shop
   ASIABD_DB_PATH=/data/asiabd.db
   ```

4. Start the server (e.g. with pm2, systemd, or the host's process manager):

   ```bash
   npm start -- -p 3000
   ```

5. Put a reverse proxy (Nginx/Caddy) in front for TLS, or use the host's built-in
   HTTPS. Point your health checks at `/` (returns 200).

**Backups:** back up the SQLite file (and its `-wal`/`-shm` companions) on a
schedule - e.g. `sqlite3 /data/asiabd.db ".backup /backups/asiabd-$(date +%F).db"`.

---

## 2. Option B - Vercel + managed Postgres (serverless)

Next.js deploys to Vercel out of the box, **but** two components need attention:

1. **Persistence.** Serverless functions have an ephemeral filesystem, so the
   SQLite file in `src/lib/db.ts` will not persist reliably. Swap the storage
   layer for a hosted database:
   - **Postgres (Neon, Supabase, Vercel Postgres):** replace `better-sqlite3`
     with `pg` (or `drizzle-orm/neon-http`) and port the small repository
     functions in `src/lib/db.ts` (6 tables: `workspaces`, `generations`,
     `saved_items`, `credit_ledger`). The SQL used is simple and portable.
   - **Turso (libSQL):** closest to SQLite - swap in `@libsql/client` and keep
     the same SQL nearly verbatim.
2. **Rate limiting.** The in-memory limiter in `src/lib/rate-limit.ts` is
   per-instance on serverless. For strict limits, back it with Redis/Upstash.

Then:

```bash
vercel                          # link the project
vercel env add ANTHROPIC_API_KEY
vercel env add APP_URL          # https://asiabd.shop
vercel env add DATABASE_URL     # your Postgres/libSQL URL
vercel --prod
```

Set the function region close to your database to minimize latency.

---

## 3. Domain setup - asiabd.shop

1. Add the domain in your host's dashboard (Vercel: Project → Domains;
   VPS: point DNS at your server).
2. DNS records:
   - Apex `asiabd.shop` → A record to the host IP (or the host's provided ALIAS/ANAME).
   - `www` → CNAME to the host target; redirect www → apex (or vice versa).
3. TLS/SSL is automatic on Vercel/Railway/Render; on a VPS use Caddy (auto-HTTPS)
   or certbot with Nginx.
4. Set `APP_URL=https://asiabd.shop` so metadata/canonical URLs are correct.

---

## 4. Environment checklist

| Variable | Where | Notes |
|----------|-------|-------|
| `ANTHROPIC_API_KEY` | Server only | Never `NEXT_PUBLIC_`. Rotate if leaked. |
| `ANTHROPIC_MODEL` | Optional | Defaults to a current Sonnet-class model. |
| `DEMO_MODE` | Optional | `1` forces demo output (useful for staging). |
| `APP_URL` | Build/runtime | Public URL for metadata. |
| `ASIABD_DB_PATH` | Node-host path | Point at the persistent volume. |
| `ASIABD_STARTING_CREDITS` | Optional | Default 50. |
| `DATABASE_URL` | Serverless path | Only after swapping the storage layer. |

---

## 5. Production checklist

- [ ] Keys are server-side only; confirm `NEXT_PUBLIC_` is not used for secrets.
- [ ] Auth cookies: with NODE_ENV=production and an https `APP_URL`, session cookies are
      marked `secure` automatically (see src/lib/auth.ts). Sessions live in the
      `auth_sessions` table - no external auth service to configure.
- [ ] `npm run build` and `npm run typecheck` pass on the deploy commit.
- [ ] Credits, ledger, and rate limiting verified against the production DB.
- [ ] Error monitoring (Sentry or host logs) wired to the `[api/generate]` logs.
- [ ] Database backups scheduled (Option A) or point-in-time recovery (Option B).
- [ ] Legal pages (Terms, Privacy, Refund, AI Disclosure) reviewed with counsel
      for your jurisdiction before launch.
- [ ] Payment integration (if/when added) - webhooks verified, no card data stored.
