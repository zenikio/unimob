import { definePageMetaTags } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	const pageMetaTags = definePageMetaTags({
		title: data.institution.name,
		description: `Find PYQs, notes, and study materials for students at ${data.institution.name}.`
	});

	return {
		...data,
		...pageMetaTags
	};
};
