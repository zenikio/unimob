# Unimob

A free, permanent library of previous-year question papers and notes for Indian universities.
No login, no ads, no tracking: pick your university, find your subject, read the PDF.

Live at **[unimob.in](https://unimob.in)**.

## How it works

The site is fully static. All PDFs live in a private Cloudflare R2 bucket, the catalogue (universities,
subjects, resources) lives in Cloudflare D1, and a snapshot of that catalogue is committed as
[`src/lib/data/content.json`](src/lib/data/content.json). Every page is prerendered from the snapshot,
so visitors never trigger a database query. The only dynamic route is `/pdf/[id]`, which streams a file from R2.

**Stack:** SvelteKit (Svelte 5, TypeScript) on Cloudflare Workers, Tailwind CSS + DaisyUI, D1 + Drizzle ORM,
R2, Fuse.js for the homepage search.

## Run it locally

You don't need a Cloudflare account to work on the site.

```sh
npm install
npm run dev
```

The pages render from the committed `content.json`. PDFs won't load locally because the R2 bucket is empty on your
machine; everything else works.

```sh
npm run check    # types
npm run build    # production build (from the committed snapshot)
```

## Adding content (maintainers)

Needs a Cloudflare account with the `unimob-db` D1 database and `unimob-pdfs` R2 bucket (see `wrangler.jsonc`).

1. Put PDFs in `<folder>/<university-slug>/[Category] Title [Subject (CODE)].pdf`.
2. `node scripts/import.ts <folder> --apply` uploads the files and writes the rows (omit `--apply` for a dry run).
3. `npm run release` refreshes the snapshot, builds, and deploys.

**Forking?** `wrangler.jsonc` points at the maintainer's D1 database and R2 bucket, which you can't use. Create your own
(`npx wrangler d1 create unimob-db`, `npx wrangler r2 bucket create unimob-pdfs`) and replace the `database_id` and
`bucket_name` there, then run `npx wrangler d1 migrations apply unimob-db --remote`.

Edit or hide rows with `npm run db:studio`, or set a resource's `status` to `hidden`. More detail in
[`docs/sorcery.md`](docs/sorcery.md), which is also the briefing for AI coding agents working in this repo.

## Contributing

- **Study material:** email PDFs to [hello@unimob.in](mailto:hello@unimob.in). We organise and host them.
- **Code:** issues and pull requests are welcome. The design goal is brutal minimalism (static pages, as few moving
  parts as possible), so please keep changes small and boring.

## Takedown requests

If you are a rights holder and want a document removed, email [hello@unimob.in](mailto:hello@unimob.in) with the link
and we will take it down promptly.

## License

The code is released under the [MIT License](LICENSE). The study materials (PDFs) are not part of this repository
and remain the property of their original authors.
