import { error } from '@sveltejs/kit';
import {
	categoryLabels,
	getInstitution,
	getSubject,
	resourcesOf,
	subjects,
	type CategoryKey,
	type Resource
} from '#lib/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	subjects.map((s) => ({ slug: s.institution, codeSlug: s.codeSlug }));

export const load: PageServerLoad = ({ params }) => {
	const institution = getInstitution(params.slug);
	if (!institution) throw error(404, 'Institution not found');
	const subject = getSubject(params.slug, params.codeSlug);
	if (!subject) throw error(404, 'Subject not found');

	const categories: Partial<Record<CategoryKey, Resource[]>> = {};
	for (const res of resourcesOf(params.slug, params.codeSlug)) {
		const cat = (res.category in categoryLabels ? res.category : 'other') as CategoryKey;
		(categories[cat] ??= []).push(res);
	}

	return { institution, subject, categories, labels: categoryLabels };
};
