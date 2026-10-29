// Imports the unzipped "Download all PDFs" export from the old Unimob into D1 + R2.
//
//   node scripts/import.ts ./export             # dry run: parses, writes import.sql, prints a summary
//   node scripts/import.ts ./export --apply     # runs it against the REMOTE D1 + R2
//   node scripts/import.ts ./export --apply --local   # same, against the local wrangler dev state
//
// Expects:  <dir>/<institution-slug>/[Category] Title [Subject (CODE)].pdf
// Optional: <dir>/institutions.json  ->  { "ymca": { "name": "YMCA University", "shortName": "YMCA" } }
//
// Safe to re-run: ids come from the PDF's content hash, and every insert is an upsert.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const DB = 'unimob-db';
const BUCKET = 'unimob-pdfs';
const CATEGORIES = ['pyq', 'notes', 'handwritten', 'practice', 'assignment', 'other'] as const;
type Category = (typeof CATEGORIES)[number];

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const apply = args.includes('--apply');
const where = args.includes('--local') ? '--local' : '--remote';
if (!dir) {
	console.error('usage: node scripts/import.ts <export-dir> [--apply] [--local]');
	process.exit(1);
}

const slugify = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
const q = (s: string | number | null) =>
	s === null ? 'NULL' : typeof s === 'number' ? String(s) : `'${s.replaceAll("'", "''")}'`;

function mapCategory(raw: string): Category {
	const c = raw.toLowerCase();
	if (/pyq|previous|past|question paper|\bpaper/.test(c)) return 'pyq';
	if (/hand/.test(c)) return 'handwritten';
	if (/note/.test(c)) return 'notes';
	if (/practice|question bank|sample|mock/.test(c)) return 'practice';
	if (/assign/.test(c)) return 'assignment';
	return 'other';
}

// "[Category] Title [Subject (CODE)]" with an optional " (2)" suffix from duplicate names.
const NAME = /^\[([^\]]+)\] (.*) \[(.*?) \((.*)\)\]( \(\d+\))?$/;

const institutions = existsSync(join(dir, 'institutions.json'))
	? JSON.parse(readFileSync(join(dir, 'institutions.json'), 'utf8'))
	: {};

const sql: string[] = [];
const uploads: { key: string; file: string }[] = [];
const seenInst = new Set<string>();
const seenSubject = new Set<string>();
const seenResource = new Set<string>();
const unmapped = new Map<string, number>();
const skipped: string[] = [];
const now = Date.now();

for (const inst of readdirSync(dir, { withFileTypes: true })) {
	if (!inst.isDirectory()) continue;
	const instSlug = slugify(inst.name);

	for (const file of readdirSync(join(dir, inst.name))) {
		if (!file.endsWith('.pdf')) continue;
		const m = NAME.exec(file.slice(0, -4));
		if (!m) {
			skipped.push(`${inst.name}/${file}`);
			continue;
		}
		const [, rawCategory, title, subjectName, code] = m;
		const category = mapCategory(rawCategory);
		if (category === 'other') unmapped.set(rawCategory, (unmapped.get(rawCategory) ?? 0) + 1);

		const path = join(dir, inst.name, file);
		const id = createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 12);
		if (seenResource.has(id)) {
			skipped.push(`${inst.name}/${file} (identical PDF already imported)`);
			continue;
		}
		seenResource.add(id);

		const meta = institutions[instSlug] ?? {};
		if (!seenInst.has(instSlug)) {
			seenInst.add(instSlug);
			sql.push(
				`INSERT INTO institution (id, name, short_name, slug) VALUES (${q(crypto.randomUUID())}, ${q(meta.name ?? instSlug.toUpperCase())}, ${q(meta.shortName ?? instSlug.toUpperCase())}, ${q(instSlug)}) ON CONFLICT(slug) DO NOTHING;`
			);
		}

		const codeSlug = slugify(code);
		const instId = `(SELECT id FROM institution WHERE slug = ${q(instSlug)})`;
		if (!seenSubject.has(`${instSlug}/${codeSlug}`)) {
			seenSubject.add(`${instSlug}/${codeSlug}`);
			sql.push(
				`INSERT INTO subject (id, institution_id, name, code, code_slug) VALUES (${q(crypto.randomUUID())}, ${instId}, ${q(subjectName)}, ${q(code)}, ${q(codeSlug)}) ON CONFLICT(institution_id, code_slug) DO NOTHING;`
			);
		}

		const key = `resources/${id}.pdf`;
		const year = /\b(19|20)\d{2}\b/.exec(title)?.[0];
		sql.push(
			`INSERT INTO resource (id, subject_id, title, slug, category, file_key, exam_year, status, created_at, updated_at) VALUES (${q(id)}, (SELECT id FROM subject WHERE institution_id = ${instId} AND code_slug = ${q(codeSlug)}), ${q(title)}, ${q(slugify(title) || id)}, ${q(category)}, ${q(key)}, ${year ? Number(year) : 'NULL'}, 'published', ${now}, ${now}) ON CONFLICT(id) DO UPDATE SET title = excluded.title, slug = excluded.slug, category = excluded.category, file_key = excluded.file_key, exam_year = excluded.exam_year;`
		);
		uploads.push({ key, file: path });
	}
}

writeFileSync('import.sql', sql.join('\n') + '\n');
console.log(
	`${seenInst.size} institutions, ${seenSubject.size} subjects, ${uploads.length} resources -> import.sql`
);
if (unmapped.size) {
	console.log('categories filed under "other" (add a rule in mapCategory if wrong):');
	for (const [name, n] of unmapped) console.log(`  ${n}x  ${name}`);
}
if (skipped.length) console.log(`skipped ${skipped.length}:\n  ${skipped.join('\n  ')}`);

if (!apply) {
	console.log('\ndry run - nothing sent. Re-run with --apply to import.');
	process.exit(0);
}

const wrangler = (...a: string[]) => execFileSync('npx', ['wrangler', ...a], { stdio: 'inherit' });

// Cloudflare occasionally answers 500; retry, and remember what's uploaded so a re-run resumes.
const DONE_FILE = 'import.done';
const done = new Set(existsSync(DONE_FILE) ? readFileSync(DONE_FILE, 'utf8').split('\n') : []);
const failed: string[] = [];

wrangler('d1', 'execute', DB, where, '--file=import.sql');

for (const [i, { key, file }] of uploads.entries()) {
	if (done.has(key)) continue;
	console.log(`[${i + 1}/${uploads.length}] ${key}`);
	let ok = false;
	for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
		try {
			wrangler('r2', 'object', 'put', `${BUCKET}/${key}`, `--file=${file}`, '--content-type=application/pdf', where);
			ok = true;
		} catch {
			console.log(`  attempt ${attempt} failed${attempt < 4 ? ', retrying...' : ''}`);
			await new Promise((r) => setTimeout(r, attempt * 3000));
		}
	}
	if (ok) appendFileSync(DONE_FILE, key + '\n');
	else failed.push(file);
}

if (failed.length) {
	console.log(`\n${failed.length} uploads failed. Run the same command again to retry just those:\n  ${failed.join('\n  ')}`);
	process.exit(1);
}
console.log('done');
