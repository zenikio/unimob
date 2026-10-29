import { definePageMetaTags } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	const hasResources = Object.values(data.categories).some((list) => list && list.length > 0);

	const pageMetaTags = definePageMetaTags({
		// An empty subject page is thin content; keep it out of the index.
		robots: hasResources ? 'index,follow' : 'noindex,follow',
		title: `${data.subject.name} (${data.subject.code}) - ${data.institution.shortName || data.institution.name}`,
		description: `Download PYQs and notes for ${data.subject.name} at ${data.institution.name}.`
	});

	return {
		...data,
		...pageMetaTags
	};
};
