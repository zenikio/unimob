// Pulls everything the public site shows out of the remote D1 into src/lib/data/content.json.
// The site is built from that file (no database reads at runtime). `npm run build` runs this first.
//
//   node scripts/snapshot.ts            # remote D1 (default)
//   node scripts/snapshot.ts --local    # local dev D1
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const where = process.argv.includes('--local') ? '--local' : '--remote';

function query<T>(sql: string): T[] {
	const out = execFileSync(
		'npx',
		['wrangler', 'd1', 'execute', 'unimob-db', where, '--json', '--command', sql],
		{ encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
	);
	return JSON.parse(out.slice(out.indexOf('[')))[0].results as T[];
}

const institutions = query(
	`SELECT slug, name, short_name AS shortName FROM institution ORDER BY slug`
);
const subjects = query(
	`SELECT i.slug AS institution, s.name, s.code, s.code_slug AS codeSlug
	 FROM subject s JOIN institution i ON i.id = s.institution_id
	 ORDER BY i.slug, s.name`
);
const resources = query(
	`SELECT r.id, r.slug, r.title, r.category, r.exam_year AS examYear, r.file_key AS fileKey,
	        r.updated_at AS updatedAt, i.slug AS institution, s.code_slug AS subject
	 FROM resource r
	 JOIN subject s ON s.id = r.subject_id
	 JOIN institution i ON i.id = s.institution_id
	 WHERE r.status = 'published'
	 ORDER BY r.exam_year DESC, r.created_at DESC`
);

writeFileSync(
	'src/lib/data/content.json',
	JSON.stringify({ institutions, subjects, resources }, null, '\t') + '\n'
);
console.log(
	`content.json: ${institutions.length} institutions, ${subjects.length} subjects, ${resources.length} resources`
);
