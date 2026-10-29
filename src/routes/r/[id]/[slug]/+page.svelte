<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { DownloadSimple, ArrowSquareOut } from 'phosphor-svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The viewer fetches from a worker, so it needs an absolute URL.
	const absolutePdfUrl = $derived(new URL(data.pdfUrl, page.url.origin).href);

	let PDFViewer = $state<typeof import('@embedpdf/svelte-pdf-viewer').PDFViewer>();

	onMount(async () => {
		const module = await import('@embedpdf/svelte-pdf-viewer');
		PDFViewer = module.PDFViewer;
	});
</script>

<JsonLd
	schema={{
		'@type': 'LearningResource',
		name: data.resource.title,
		url: `https://unimob.in/r/${data.resource.id}/${data.resource.slug}`,
		learningResourceType: data.resource.category,
		isAccessibleForFree: true,
		inLanguage: 'en',
		dateModified: new Date(data.resource.updatedAt).toISOString(),
		about: `${data.resource.subject.name} (${data.resource.subject.code})`,
		provider: { '@type': 'Organization', name: 'Unimob', url: 'https://unimob.in' }
	}}
/>

<JsonLd
	schema={{
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://unimob.in/'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: data.resource.institution.shortName || data.resource.institution.name,
				item: `https://unimob.in/i/${data.resource.institution.slug}`
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: `${data.resource.subject.name} (${data.resource.subject.code})`,
				item: `https://unimob.in/i/${data.resource.institution.slug}/${data.resource.subject.codeSlug}`
			},
			{
				'@type': 'ListItem',
				position: 4,
				name: data.resource.title,
				item: `https://unimob.in/r/${data.resource.id}/${data.resource.slug}`
			}
		]
	}}
/>

<main class="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-base-100">
	<!-- Top Bar -->
	<header
		class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-base-300 bg-base-100 px-4 py-2.5"
	>
		<div class="flex flex-wrap items-center gap-4">
			<div class="breadcrumbs m-0 p-0 text-xs">
				<ul>
					<li><a href={resolve('/')}>Home</a></li>
					<li>
						<a href={resolve(`i/${data.resource.institution.slug}`)}>
							{data.resource.institution.shortName || data.resource.institution.name}
						</a>
					</li>
					<li>
						<a
							href={resolve(
								`i/${data.resource.institution.slug}/${data.resource.subject.codeSlug}`
							)}
						>
							{data.resource.subject.code}
						</a>
					</li>
				</ul>
			</div>

			<h1 class="text-lg font-bold text-base-content">{data.resource.title}</h1>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="{data.pdfUrl}?download=1"
				download
				class="btn btn-outline btn-sm inline-flex items-center gap-1.5"
			>
				<DownloadSimple weight="light" size={16} />
				<span>Download</span>
			</a>
			<a
				href={data.pdfUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-outline btn-sm inline-flex items-center gap-1.5"
			>
				<ArrowSquareOut weight="light" size={16} />
				<span>Open in New Tab</span>
			</a>
		</div>
	</header>

	<!-- Viewer container -->
	<div class="relative h-full w-full flex-1 min-h-0 bg-base-200">
		{#if PDFViewer}
			<PDFViewer
				config={{ src: absolutePdfUrl, theme: { preference: 'system' } }}
				style="width: 100%; height: 100%;"
			/>
		{:else}
			<!-- Show a DaisyUI loading spinner while the WebAssembly module boots -->
			<div class="flex h-full w-full items-center justify-center">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{/if}
	</div>
</main>
