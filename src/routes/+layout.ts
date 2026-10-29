import { defineBaseMetaTags } from 'svelte-meta-tags';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url, data }) => {
	const baseTags = defineBaseMetaTags({
		title: 'Unimob',
		titleTemplate: '%s | Unimob',
		description: 'A free, permanent library of PYQs and notes for Indian universities.',
		// Fixed origin: at prerender time `url.origin` is a placeholder host.
		canonical: new URL(url.pathname, 'https://unimob.in').href,
		openGraph: {
			type: 'website',
			siteName: 'Unimob',
			images: [
				{
					url: 'https://unimob.in/og.png',
					width: 1200,
					height: 630,
					alt: 'Unimob'
				}
			]
		}
	});

	return {
		...data,
		...baseTags
	};
};
