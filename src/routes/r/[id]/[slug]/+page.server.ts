import { error } from '@sveltejs/kit';
import { getInstitution, getResource, getSubject, resources } from '#lib/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => resources.map((r) => ({ id: r.id, slug: r.slug }));

export const load: PageServerLoad = ({ params }) => {
	const res = getResource(params.id);
	if (!res || res.slug !== params.slug) throw error(404, 'Resource not found');

	return {
		resource: {
			id: res.id,
			title: res.title,
			slug: res.slug,
			category: res.category,
			updatedAt: res.updatedAt,
			subject: getSubject(res.institution, res.subject)!,
			institution: getInstitution(res.institution)!
		},
		pdfUrl: `/pdf/${res.id}`
	};
};
