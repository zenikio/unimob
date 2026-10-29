import { definePageMetaTags } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	const pageMetaTags = definePageMetaTags({
		title: `${data.resource.title} - ${data.resource.subject.name}`,
		description: `View and download ${data.resource.title} for ${data.resource.subject.name} at ${data.resource.institution.shortName || data.resource.institution.name}.`
	});

	return {
		...data,
		...pageMetaTags
	};
};
