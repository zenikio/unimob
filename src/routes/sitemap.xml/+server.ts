import { resources, subjects, institutions } from '#lib/content.ts';
import * as sitemap from 'super-sitemap/sveltekit';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	// Only subjects that have files are listed, so Google never crawls an empty page.
	const subjectKeys = new Set(resources.map((r) => `${r.institution}/${r.subject}`));

	return await sitemap.response({
		origin: 'https://unimob.in',
		excludeRoutePatterns: [/^\/demo/, /^\/profile/, /^\/pdf/],
		paramValues: {
			'/i/[slug]': institutions.map((i) => i.slug),
			'/i/[slug]/[codeSlug]': subjects
				.filter((s) => subjectKeys.has(`${s.institution}/${s.codeSlug}`))
				.map((s) => [s.institution, s.codeSlug] as [string, string]),
			'/r/[id]/[slug]': resources.map((r) => [r.id, r.slug] as [string, string])
		}
	});
};
