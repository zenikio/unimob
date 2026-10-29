<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');

	const displayName = $derived(data.institution.shortName || data.institution.name);

	const filteredSubjects = $derived(
		data.subjects.filter((sub) => {
			const query = search.trim().toLowerCase();
			if (!query) return true;
			return (
				sub.name.toLowerCase().includes(query) ||
				sub.code.toLowerCase().includes(query)
			);
		})
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
				name: displayName,
				item: `https://unimob.in/i/${data.institution.slug}`
			}
		]
	}}
/>

<div class="mx-auto w-full max-w-4xl px-4 py-8">
	<div class="breadcrumbs mb-6 text-sm">
		<ul>
			<li><a href={resolve('/')}>Home</a></li>
			<li>{displayName}</li>
		</ul>
	</div>

	<div class="mb-6">
		<h1 class="mb-2 font-sans text-3xl font-bold text-base-content">
			{data.institution.name}
		</h1>
	</div>

	<div class="mb-6">
		<input
			type="text"
			bind:value={search}
			placeholder="Search subjects by name or code (e.g. CS-201, Data Structures)..."
			class="input focus-ring w-full border border-base-300 bg-base-200 px-4 py-2 placeholder:text-base-content/50"
		/>
	</div>

	{#if filteredSubjects.length > 0}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each filteredSubjects as sub (sub.codeSlug)}
				<a
					href={resolve(`i/${data.institution.slug}/${sub.codeSlug}`)}
					class="card border border-base-300 bg-base-200 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
				>
					<h2 class="text-lg font-bold text-base-content">{sub.name}</h2>
					<p class="text-sm text-base-content/80">{sub.code}</p>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class="card border border-dashed border-base-300 bg-base-200 p-8 text-center text-base-content/70"
		>
			{#if search.trim()}
				<p>
					No subjects matching "<span class="font-medium text-base-content">{search}</span>"
				</p>
			{:else}
				<p>No subjects found for this institution.</p>
			{/if}
		</div>
	{/if}
</div>
