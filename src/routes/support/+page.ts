import { definePageMetaTags } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const pageMetaTags = definePageMetaTags({
		title: 'Support Unimob',
		description: 'Keep the library free and permanent for every batch. Support Unimob through native sponsorships or donations.'
	});

	return { ...pageMetaTags };
};
