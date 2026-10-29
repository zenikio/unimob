<script lang="ts">
	import { resolve } from '$app/paths';
	import { Eye, DownloadSimple, ArrowSquareOut } from 'phosphor-svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categoryEntries = $derived(
		Object.entries(data.categories) as [
			keyof typeof data.labels,
			NonNullable<(typeof data.categories)[keyof typeof data.categories]>
		][]
	);

	const totalResources = $derived(
		categoryEntries.reduce((total, [, list]) => total + (list?.length || 0), 0)
	);
</script>

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
				name: data.institution.shortName || data.institution.name,
				item: `https://unimob.in/i/${data.institution.slug}`
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: `${data.subject.name} (${data.subject.code})`,
				item: `https://unimob.in/i/${data.institution.slug}/${data.subject.codeSlug}`
			}
		]
	}}
/>

<div class="mx-auto w-full max-w-4xl px-4 py-8">
	<!-- Breadcrumb -->
	<div class="breadcrumbs mb-6 text-sm">
		<ul>
			<li><a href={resolve('/')}>Home</a></li>
			<li>
				<a href={resolve(`i/${data.institution.slug}`)}>
					{data.institution.shortName || data.institution.name}
				</a>
			</li>
			<li>{data.subject.code}</li>
		</ul>
	</div>

	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-1 font-sans text-3xl font-bold text-base-content">{data.subject.name}</h1>
		<p class="text-sm text-base-content/60">{data.subject.code}</p>
	</div>

	<!-- Grouped Categories -->
	{#if totalResources > 0}
		<div class="space-y-8">
			{#each categoryEntries as [categoryKey, items]}
				{#if items && items.length > 0}
					<section>
						<h2 class="mb-3 font-sans text-xl font-bold text-base-content">
							{data.labels[categoryKey] || categoryKey}
						</h2>
						<div class="space-y-3">
							{#each items as res (res.id)}
								<div
									class="card flex flex-col gap-4 border border-base-300 bg-base-100 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="flex-1">
										<h3 class="text-base font-semibold text-base-content">{res.title}</h3>
										{#if res.examYear}
											<span class="text-xs text-base-content/60">Year: {res.examYear}</span>
										{/if}
									</div>
									<div class="flex flex-wrap items-center gap-2">
										<a
											href={resolve('/r/[id]/[slug]', { id: res.id, slug: res.slug })}
											class="btn btn-primary btn-sm inline-flex items-center gap-1.5"
										>
											<Eye weight="light" size={16} />
											<span>View</span>
										</a>
										<a
											href="/pdf/{res.id}?download=1"
											download
											class="btn btn-outline btn-sm inline-flex items-center gap-1.5"
										>
											<DownloadSimple weight="light" size={16} />
											<span>Download</span>
										</a>
										<a
											href="/pdf/{res.id}"
											target="_blank"
											rel="noopener noreferrer"
											class="btn btn-outline btn-sm inline-flex items-center gap-1.5"
										>
											<ArrowSquareOut weight="light" size={16} />
											<span>Open in New Tab</span>
										</a>
									</div>
								</div>
							{/each}
						</div>
					</section>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="card border border-dashed border-base-300 bg-base-100 p-10 text-center">
			<p class="text-base-content/60">No materials uploaded for this subject yet.</p>
		</div>
	{/if}

	<!-- Back button -->
	<div class="mt-8">
		<a href={resolve(`i/${data.institution.slug}`)} class="btn btn-outline btn-sm">
			← Back to Subjects
		</a>
	</div>
</div>
