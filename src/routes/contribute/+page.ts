import { definePageMetaTags } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const pageMetaTags = definePageMetaTags({
		title: 'Contribute',
		description: 'Help your juniors by sharing what you already have. Contribute PYQs and notes to Unimob.'
	});

	return { ...pageMetaTags };
};
