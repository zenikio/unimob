<script lang="ts">
	import { resolve } from '$app/paths';
	import { EnvelopeSimple, GithubLogo } from 'phosphor-svelte';
	import { JsonLd } from 'svelte-meta-tags';
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
				name: 'Contribute',
				item: 'https://unimob.in/contribute'
			}
		]
	}}
/>

<div class="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
	<div class="breadcrumbs mb-6 text-sm">
		<ul>
			<li><a href={resolve('/')}>Home</a></li>
			<li>Contribute</li>
		</ul>
	</div>

	<div class="mb-10 text-center sm:text-left">
		<h1 class="mb-3 font-sans text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
			Contribute to Unimob
		</h1>
		<p class="text-lg text-base-content/70">
			Help your juniors by sharing what you already have.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- For Students Section -->
		<div class="card flex flex-col justify-between border border-base-300 bg-base-100 p-8 shadow-sm">
			<div>
				<span class="badge-outline mb-4 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
					For Students
				</span>
				<h2 class="mb-3 text-xl font-bold text-base-content">
					Share Exam Papers & Notes
				</h2>
				<p class="mb-8 text-sm leading-relaxed text-base-content/70 sm:text-base">
					If you have previous year question papers, handwritten class notes, or assignment solutions, email them directly to us. We will organize, label, and host them permanently so upcoming batches don't have to start from scratch.
				</p>
			</div>
			<div>
				<a
					href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=hello@unimob.in&amp;su=Study%20Material%20Contribution" target="_blank" rel="noopener noreferrer"
					class="btn btn-primary inline-flex w-full items-center justify-center gap-2 py-3 text-base font-semibold shadow-sm focus-ring"
				>
					<EnvelopeSimple weight="light" size={20} />
					<span>Email Materials</span>
				</a>
			</div>
		</div>

		<!-- For Developers Section -->
		<div class="card flex flex-col justify-between border border-base-300 bg-base-100 p-8 shadow-sm">
			<div>
				<span class="badge-outline mb-4 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
					For Developers
				</span>
				<h2 class="mb-3 text-xl font-bold text-base-content">
					Contribute Code & Infrastructure
				</h2>
				<p class="mb-8 text-sm leading-relaxed text-base-content/70 sm:text-base">
					Unimob is completely open-source, built modern with SvelteKit and Cloudflare D1/R2. Help us improve performance, design new features, refine UI, or squash bugs by opening a PR on GitHub.
				</p>
			</div>
			<div>
				<a
					href="https://github.com/zenikio/unimob"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-outline inline-flex w-full items-center justify-center gap-2 py-3 text-base font-semibold shadow-sm focus-ring"
				>
					<GithubLogo weight="light" size={20} />
					<span>View on GitHub</span>
				</a>
			</div>
		</div>
	</div>
</div>
