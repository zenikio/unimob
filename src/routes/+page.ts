import { definePageMetaTags } from 'svelte-meta-tags';
import { institutions, subjects } from '#lib/content.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const pageMetaTags = definePageMetaTags({
		title: 'Find your study materials',
		description: 'Free PYQs and notes for Indian universities.'
	});

	const shortName = Object.fromEntries(institutions.map((i) => [i.slug, i.shortName || i.name]));
	return {
		subjects: subjects.map((s) => ({
			name: s.name,
			code: s.code,
			codeSlug: s.codeSlug,
			institutionSlug: s.institution,
			institutionName: shortName[s.institution]
		})),
		...pageMetaTags
	};
};
