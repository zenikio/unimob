# Unimob: guide for contributors and AI agents

This file describes the project's stack, design rules and workflows. Read it before changing anything.

# Stack

- Framework: SvelteKit (TypeScript, Svelte 5 runes) on Cloudflare Workers via `@sveltejs/adapter-cloudflare`.
- Styling: Tailwind CSS v4 + DaisyUI. Icons: always `phosphor-svelte`.
- Database: Cloudflare D1 (serverless SQLite) with Drizzle ORM. D1 is the source of truth for content, but the public site NEVER queries it: pages are prerendered from a build-time snapshot (see "Static site" below).
- Storage: Cloudflare R2 (private bucket, served only through the Worker).
- Auth: Better-Auth (Google OAuth). Optional and currently OFF. See "Auth" below.
- SEO: `svelte-meta-tags` (meta + JSON-LD), `super-sitemap` for `/sitemap.xml`.
- PDF viewer: `@embedpdf/svelte-pdf-viewer`.

Do not suggest alternative libraries or tools outside this stack. No Docker, no Podman, no servers, no Go, no Postgres. Those were v1 and are gone.

# Philosophy (read this before writing anything)

Brutal minimalism. Unimob is a free library of PYQs and notes for Indian universities. The 300+ verified PDFs are the moat; the tech is plumbing and should disappear and cost nothing.

1. **Extreme simplification.** If a static page works, use a static page. If a database query can be avoided, avoid it. No search APIs, no microservices, no over-engineering.
2. **Pure convenience.** No login to read a PDF. No onboarding forms. Land, click university, read.
3. **AI-native.** Only standard, heavily documented tools, so any agent can refactor without hallucinating.
4. **Do not build what a dashboard already gives us.** Admin CRUD is Drizzle Studio (or one-line SQL via wrangler) and one import script. Do not build an admin panel unless explicitly asked.

# Working rules

- Write clean, boring, modular code.
- Don't refactor code you weren't asked to touch.
- Before writing code, confirm your understanding of the requirement and flag ambiguities. Don't assume.
- Never read `.env` or any secrets file; you don't need it.

# Codebase layout

```
codebase/
├── drizzle/                 generated SQL migrations (never hand-edit)
├── scripts/import.ts        bulk importer: folder of PDFs -> D1 + R2
├── scripts/snapshot.ts      D1 -> src/lib/data/content.json (run by `npm run release`)
├── src/
│   ├── env.ts               declared env vars (all optional, see below)
│   ├── hooks.server.ts      auth hook; skips auth when secrets are absent
│   ├── lib/
│   │   ├── content.ts       typed helpers over data/content.json (the snapshot)
│   │   ├── data/content.json  build-time snapshot of D1 (institutions, subjects, resources)
│   │   ├── components/      Navbar etc.
│   │   └── server/
│   │       ├── auth.ts      Better-Auth config
│   │       └── db/          schema.ts (source of truth), auth.schema.ts, index.ts (getDb)
│   └── routes/
│       ├── +page.svelte         home: searchable list of all subjects (prerendered, has MAINTENANCE flag)
│       ├── i/[slug]             institution page: lists subjects
│       ├── i/[slug]/[codeSlug]  subject page: resources grouped by category
│       ├── r/[id]/[slug]        resource page: PDF viewer
│       ├── pdf/[id]             the only dynamic route: streams the PDF from R2 (inline, or ?download=1)
│       ├── sitemap.xml          prerendered from the snapshot
│       └── contribute, support, privacy, terms, cookies
├── static/                  robots.txt, favicon, manifest (og.png is still missing)
└── wrangler.jsonc           bindings
```

Import alias: `#lib/*` -> `src/lib/*` (e.g. `#lib/server/db/schema.ts`). Not `$lib`.

# Bindings and data

Cloudflare bindings (declared in `wrangler.jsonc`, typed in `worker-configuration.d.ts`):

| Binding | What | Name |
|---|---|---|
| `unimob_db` | D1 database | `unimob-db` |
| `unimob_files` | R2 bucket | `unimob-pdfs` |

Read them with `import { env } from 'cloudflare:workers'`. After editing `wrangler.jsonc`, run `npx wrangler types` or `npm run build` fails its `--check`.

Schema (`src/lib/server/db/schema.ts` is the source of truth):

- `institution` (id, name, shortName, slug unique)
- `subject` (id, institutionId, name, code, codeSlug, short). Unique on (institutionId, codeSlug).
- `resource` (id, subjectId, title, slug, category, fileKey, examType, examYear, examMonth, status, createdAt, updatedAt)
  - `category` is a fixed enum: `pyq | notes | handwritten | practice | assignment | other`
  - `status` is `published | hidden`. Only `published` is ever shown or served.
  - `fileKey` is the R2 object key, `resources/<12-char content hash>.pdf`.

To change the schema: edit `schema.ts`, `npm run db:generate`, then `npx wrangler d1 migrations apply unimob-db --remote`.

# Static site (the core design decision)

Content changes rarely, so the site is fully static. `npm run release` first runs `scripts/snapshot.ts`, which reads D1 once and writes `src/lib/data/content.json` (committed to git); every page (`/`, `/i/*`, `/i/*/*`, `/r/*/*`, `/sitemap.xml`) is prerendered from it via `#lib/content.ts`. Visitors never cause a D1 read. The only runtime code is `/pdf/[id]`, which looks up the file key in the snapshot and streams from R2.

- **Never add D1 queries to public pages.** An earlier version queried D1 per request and burned 200k rows read in one day (a join scans far more rows than it returns).
- **Never hardcode `url.origin` for canonical/OG URLs.** At prerender time it is a placeholder host. Use `https://unimob.in`.
- A resource whose id or slug is not in the snapshot is a 404. There is no slug-redirect.

# How PDFs are served

R2 is private. `/pdf/[id]` looks up the published resource, reads `fileKey`, and streams it from R2 with Range support (the viewer needs it) and `x-robots-tag: noindex`. The indexable canonical URL is the HTML page `/r/[id]/[slug]`. Never expose the bucket publicly or hardcode R2 URLs.

# Adding and changing content (no admin UI, by design)

Flow: change D1 (+ R2) -> `npm run release`. Nothing shows on the site until then.

1. **Add PDFs:** put them in `<folder>/<institution-slug>/[Category] Title [Subject (CODE)].pdf`, then `node scripts/import.ts <folder> --apply` (without `--apply` it is a dry run that writes `import.sql`).
   - Optional `<folder>/institutions.json`: `{ "ymca": { "name": "YMCA University", "shortName": "YMCA" } }`.
   - Resource ids are a hash of the PDF bytes and every insert is an upsert, so re-running is safe. Identical PDFs under different names are skipped.
   - Uploads retry on Cloudflare 500s and progress is kept in `import.done`, so re-running resumes.
   - Unknown category names fall into `other`; the dry run prints them. Add a rule in `mapCategory` if one is wrong.
2. **Edit / delete / hide:** `npm run db:studio` (needs `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` in `.env`; token needs D1 edit), or one-line SQL:
   `npx wrangler d1 execute unimob-db --remote --command "UPDATE resource SET status='hidden' WHERE id='<id>'"`.
   Hidden resources drop out of the site at the next build.
3. **Publish:** `npm run release` (snapshot -> build -> deploy). `npm run build` alone builds from the committed `content.json`, so forks and contributors need no Cloudflare access; `npm run snapshot` refreshes just the snapshot.
4. **Contributions:** people email PDFs to hello@unimob.in. The maintainer renames them to the filename format and runs step 1.

# SEO rules

SEO matters; the site has been through soft-404 and indexing fixes. Keep these true:

- Every public page is prerendered from the snapshot (`prerender = true` with `entries`). No mock fallbacks, ever.
- `/sitemap.xml` is prerendered and lists only pages that have content. Do not add placeholder URLs.
- A subject page with zero published resources is `noindex,follow`.
- Unknown or hidden resources return a real 404.
- Meta and JSON-LD come from `svelte-meta-tags`: base tags in `routes/+layout.ts`, per-page tags in each `+page.ts`.
- Known gap: `static/og.png` is referenced but does not exist yet.

# Auth (currently off)

Login is optional. `hooks.server.ts` skips Better-Auth when `ORIGIN`, `BETTER_AUTH_SECRET` or the D1 binding is missing, and `env.ts` marks both variables optional. Without this, the Worker throws `env_invalid` / Error 1101 on every dynamic page. No page requires login. To turn it on later, set secrets `ORIGIN`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` with `npx wrangler secret put <NAME>`, and add `https://unimob.in/api/auth/callback/google` as a Google redirect URI. Do not add login walls to reading.

# Commands

```
npm run dev                 # local dev
npm run check               # wrangler types --check + svelte-check
npm run build               # build from the committed snapshot (sets the memory flag itself)
npm run release             # snapshot + build + deploy (R2 bucket must already exist)
npx wrangler tail           # live Worker logs; use this first for any 500 / Error 1101
npm run db:generate         # new migration from schema.ts
npx wrangler d1 migrations apply unimob-db --remote
```

# Gotchas (learned the hard way)

- **Error 1101 on dynamic pages, home works:** the home page is prerendered static, so it bypasses the Worker. Check `wrangler tail`; the usual cause is a required env var or a missing binding.
- **Deploy fails on the R2 binding:** create the bucket first: `npx wrangler r2 bucket create unimob-pdfs`.
- **`wrangler types --check` fails the build:** run `npx wrangler types` after touching `wrangler.jsonc`.
- **Build killed (exit 137):** out of memory; `npm run build` already sets `NODE_OPTIONS=--max-old-space-size=3072`, so use it instead of calling `vite build` directly.
- **Never read bindings at module top level:** use `env` inside request handlers, because it does not exist at build time.
- **Maintenance banner:** `MAINTENANCE` constant at the top of `routes/+page.svelte`. Set it to `false` when done.
