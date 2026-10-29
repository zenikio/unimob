<script lang="ts">
	import '../app.css';
	import Navbar from '#lib/components/Navbar.svelte';
	import { GithubLogo, EnvelopeSimple } from 'phosphor-svelte';
	import { MetaTags, deepMerge, JsonLd } from 'svelte-meta-tags';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const mergedMetaTags = $derived(
		deepMerge(data.baseMetaTags, page.data.pageMetaTags || {})
	);
</script>

<MetaTags {...mergedMetaTags} />

<JsonLd
	schema={{
		'@graph': [
			{
				'@type': 'WebSite',
				name: 'Unimob',
				url: 'https://unimob.in'
			}
		]
	}}
/>

<div class="flex min-h-screen flex-col bg-base-100 text-base-content">
	<!-- The PDF viewer page sizes itself to the full viewport height, so it gets no bar. -->
	{#if !page.url.pathname.startsWith('/r/')}
		<div class="bg-primary px-4 py-2 text-center text-sm text-primary-content">
			Any feedback? Email me at
			<a
				href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=hello@unimob.in&amp;su=Unimob%20feedback" target="_blank" rel="noopener noreferrer"
				class="font-semibold underline underline-offset-2">hello@unimob.in</a
			>
		</div>
	{/if}

	<Navbar />

	<main class="flex-grow">
		{@render children()}
	</main>

	<footer class="footer border-t border-base-300 px-6 py-4 text-xs text-base-content/70">
		<div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
			<p>
				© 2026 Unimob · Built by
				<a
					href="https://github.com/zenikio"
					target="_blank"
					rel="noreferrer"
					class="underline transition hover:text-base-content">Zenik</a
				>
			</p>
			<nav class="flex flex-wrap items-center gap-5">
				<a href="/contribute" class="transition hover:text-base-content">Contribute</a>
				<a href="/support" class="transition hover:text-base-content">Support</a>
				<a href="/privacy" class="transition hover:text-base-content">Privacy</a>
				<a href="/terms" class="transition hover:text-base-content">Terms</a>
				<a href="/cookies" class="transition hover:text-base-content">Cookies</a>
				<a
					href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=hello@unimob.in" target="_blank" rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 transition hover:text-base-content"
				>
					<EnvelopeSimple weight="light" size={15} />
					<span>Contact</span>
				</a>
				<a
					href="https://github.com/zenikio/unimob"
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 transition hover:text-base-content"
					aria-label="GitHub repository"
				>
					<GithubLogo weight="light" size={15} />
					<span>GitHub</span>
				</a>
			</nav>
		</div>
	</footer>
</div>
