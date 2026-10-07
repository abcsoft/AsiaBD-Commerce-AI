# AsiaBD Commerce AI

**AI content and listing suite for e-commerce sellers** - write, optimize, and scale product content for Shopify, Amazon, Etsy, TikTok Shop, and your own store.

> AsiaBD Commerce AI started from the [AI Starter Kit OSS](https://github.com/AIStarterKit/ai-saas-starter-kit-nextjs) (Next.js + Tailwind CSS) and has been transformed into a focused vertical SaaS product for e-commerce sellers.

---

## What it does

Describe a product once - name, category, features, target customer, keywords - choose a marketplace and tone, and get publish-ready content. Nine generation tools plus a saved content library:

| # | Tool | What you get |
|---|------|--------------|
| 1 | **Product Title Generator** | 3 marketplace-optimized title options with keyword front-loading |
| 2 | **SEO Product Description** | SEO title, meta description, full description, highlight bullets |
| 3 | **Marketplace Listing Optimizer** | Audit findings + fixes, then an optimized title/bullets/description |
| 4 | **Ad Copy Generator** | 3 ad angles with hooks, primary text, and CTAs |
| 5 | **Social Caption Generator** | Ready-to-post captions + hashtags per platform |
| 6 | **Customer Support Reply Generator** | On-brand replies for any customer message |
| 7 | **Brand Voice Generator** | Reusable voice profile (tone rules, vocabulary, samples) |
| 8 | **Keyword Assistant** | Primary, long-tail, and related keywords with intent notes |
| 9 | **Bulk Content Generator** | Title + description for up to 10 products per run (CSV/JSON export) |
| 10 | **Saved Content Library** | Everything you save - searchable, editable, exportable |

### Key product behavior

- **Marketplace-aware output** - title limits, bullet structures, and tag conventions per marketplace, centralized in `src/lib/marketplaces.ts`.
- **Claude-powered** - generation runs server-side through Anthropic's API with structured JSON outputs (tool-use), validation (zod), bounded retries, and timeouts. API keys never reach the browser.
- **Demo mode** - with no `ANTHROPIC_API_KEY` configured (or `DEMO_MODE=1`), every tool returns realistic sample output so the entire product is explorable offline. Demo output is clearly labeled.
- **Credits & ledger** - every workspace starts with 50 credits (configurable). Costs: 1-2 credits per generation; bulk charges per item. Credits are only deducted when a generation succeeds - failures are never charged. Full ledger on the dashboard.
- **Accounts & authentication** - email + password accounts with server-side sessions (30-day httpOnly cookie). The app (dashboard, tools, library) and its APIs require sign-in; new accounts start with 50 welcome credits. Passwords are hashed with scrypt (`node:crypto`) - no third-party auth dependency.
- **Rate limiting** - generation endpoints are limited per session (10 requests/minute by default) with `429` + retry-after responses.
- **Saved library** - save, edit, search, and export outputs (TXT / JSON / CSV).

## Quickstart

```bash
npm install

# optional - enable live Claude generation:
# create .env.local (Windows: copy .env.example .env.local) and set ANTHROPIC_API_KEY

npm run dev
```

Open http://localhost:3000 - the app boots in **demo mode** with zero configuration. Create a free account on first visit (Sign Up) - every new account starts with 50 credits.

Then try: **Dashboard → Quick generate**, or open **Tools → Product Title Generator**, load a sample product, and hit Generate.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For live generation | Anthropic API key. Server-side only. |
| `ANTHROPIC_MODEL` | No | Claude model id. Default: `claude-sonnet-4-5`. |
| `DEMO_MODE` | No | Set to `1` to force demo mode even with a key. |
| `APP_URL` | No | Public URL used for metadata. Default: `https://asiabd.shop`. |
| `ASIABD_DB_PATH` | No | SQLite file location. Default: `./data/asiabd.db`. |
| `ASIABD_STARTING_CREDITS` | No | Welcome credits per workspace. Default: `50`. |

See `.env.example` for the full template.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run smoke` | End-to-end smoke test against a running server (see below) |

Smoke test usage:

```bash
npm run build && npm start -- -p 3344
# in another terminal:
SMOKE_BASE=http://localhost:3344 npm run smoke
```

## Architecture

```
src/
  app/
    (site)/            # marketing site: landing, pricing, trust pages, auth
    (app)/             # product app: dashboard, tools, library (shared shell)
    api/               # generate, overview, library, generations endpoints
  components/
    app/               # product UI (tool workspace, result editor, library…)
    sections/          # marketing sections
  lib/
    ai/                # Claude client, prompts, demo generator
    tools/             # tool registry + zod schemas
    db.ts              # SQLite persistence (workspaces, generations, ledger…)
    generate.ts        # generation orchestrator (rate limit → credits → AI → ledger)
    credits / session / rate-limit / output-utils …
  middleware.ts        # anonymous workspace session cookie
```

**Data layer:** SQLite via `better-sqlite3` (single file, zero services) with a
request-scoped repository in `src/lib/db.ts`. Perfect for local use and
single-instance deployments. For serverless hosts, see `docs/deployment.md`
for the storage-swap path.

**Security:** all provider calls happen in route handlers (`src/app/api/*`)
with `runtime = 'nodejs'`; keys are read from server env only. Workspace data
is scoped to the signed-in account through a 30-day httpOnly session cookie.

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for deploying to a Node host
(recommended) or Vercel + managed Postgres (Neon), plus domain setup for
`asiabd.shop`.

## Documentation

- [Deployment guide](docs/deployment.md)
- [Demo video recording](public/videos/asiabd-commerce-ai-demo.mp4) (embedded in the landing page walkthrough)
- [Demo video script (60-90s)](docs/demo-video-script.md)
- [Product description (application-ready)](docs/product-description.md)

## License

MIT - includes code from the AI Starter Kit OSS template. See `LICENSE`.
