<script lang="ts">
	import Fuse from 'fuse.js';
	import { MagnifyingGlass, Wrench } from 'phosphor-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let query = $state('');

	// Typo-tolerant search over name, code and university.
	const fuse = $derived(
		new Fuse(data.subjects, {
			keys: ['name', 'code', 'institutionName'],
			threshold: 0.35,
			ignoreLocation: true
		})
	);
	const results = $derived(
		query.trim() ? fuse.search(query.trim()).map((r) => r.item) : data.subjects
	);

	// Flip to false once the migration is finished.
	const MAINTENANCE = false;
</script>

{#if MAINTENANCE}
	<div role="alert" class="alert alert-warning justify-center rounded-none text-sm">
		<Wrench weight="light" size={18} />
		<span>
			We're moving to a new home. Some PDFs may be temporarily unavailable - everything will be
			back within a few hours.
		</span>
	</div>
{/if}

<div class="mx-auto max-w-3xl px-4 pt-16 pb-16 sm:pt-24 sm:pb-24">
	<div class="text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-base-content sm:text-6xl">
			Find your study materials.
		</h1>

		<p class="mx-auto mt-4 max-w-2xl text-lg text-base-content/70">
			Free PYQs and notes, organized by your university. No login required.
		</p>
	</div>

	<label class="input input-lg mt-10 flex w-full items-center gap-3">
		<MagnifyingGlass weight="light" size={22} />
		<input
			type="search"
			bind:value={query}
			placeholder="Search a subject, code or university..."
			class="grow"
			aria-label="Search subjects"
		/>
	</label>

	<ul
		class="mt-6 max-h-[50vh] divide-y divide-base-300 overflow-y-auto rounded-box border border-base-300 bg-base-100"
	>
		{#each results as s (s.institutionSlug + s.codeSlug)}
			<li>
				<a
					href="/i/{s.institutionSlug}/{s.codeSlug}"
					class="flex items-center justify-between gap-4 px-4 py-2 transition hover:bg-base-200"
				>
					<span class="min-w-0">
						<span class="block truncate font-semibold text-base-content">{s.name}</span>
						<span class="text-xs text-base-content/60">{s.code}</span>
					</span>
					<span class="badge badge-outline badge-sm shrink-0">{s.institutionName}</span>
				</a>
			</li>
		{:else}
			<li class="px-4 py-8 text-center text-base-content/60">
				Nothing found for "{query}". Try a different word or the subject code.
			</li>
		{/each}
	</ul>
</div>
