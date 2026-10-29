import { error } from '@sveltejs/kit';
import { getInstitution, institutions, subjectsOf } from '#lib/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => institutions.map((i) => ({ slug: i.slug }));

export const load: PageServerLoad = ({ params }) => {
	const institution = getInstitution(params.slug);
	if (!institution) throw error(404, 'Institution not found');
	return { institution, subjects: subjectsOf(params.slug) };
};
