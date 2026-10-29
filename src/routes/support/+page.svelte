<script lang="ts">
	import { resolve } from '$app/paths';
	import { MegaphoneSimple, Heart } from 'phosphor-svelte';
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
				name: 'Support',
				item: 'https://unimob.in/support'
			}
		]
	}}
/>

<div class="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
	<div class="breadcrumbs mb-6 text-sm">
		<ul>
			<li><a href={resolve('/')}>Home</a></li>
			<li>Support</li>
		</ul>
	</div>

	<div class="mb-10 text-center sm:text-left">
		<h1 class="mb-3 font-sans text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
			Support Unimob
		</h1>
		<p class="text-lg text-base-content/70">
			Keep the library free and permanent for every batch.
		</p>
	</div>

	<!-- Section 1: Why Support Us? -->
	<section class="card mb-10 border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm">
		<h2 class="mb-3 text-xl font-bold text-base-content sm:text-2xl">
			Why Support Us?
		</h2>
		<p class="text-sm leading-relaxed text-base-content/80 sm:text-base">
			Unimob is free forever. No paywalls, no aggressive tracking, and no Google AdSense ruining the reading experience. To keep it running, we rely on two things: donations from students, and native sponsorships from companies that genuinely help students.
		</p>
	</section>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Section 2: Native Sponsorships (For Companies) -->
		<div class="card flex flex-col justify-between border border-base-300 bg-base-100 p-8 shadow-sm">
			<div>
				<span class="badge-outline mb-4 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
					For Companies
				</span>
				<h2 class="mb-3 text-xl font-bold text-base-content">
					Native Sponsorships
				</h2>
				<p class="mb-8 text-sm leading-relaxed text-base-content/70 sm:text-base">
					We only show ads that look like part of the site. If you run an edtech tool, a scholarship program, or a campus service, you can sponsor a specific institution or subject.
				</p>
			</div>
			<div>
				<a
					href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=hello@unimob.in&amp;su=Sponsorship%20Inquiry" target="_blank" rel="noopener noreferrer"
					class="btn btn-primary inline-flex w-full items-center justify-center gap-2 py-3 text-base font-semibold shadow-sm focus-ring"
				>
					<MegaphoneSimple weight="light" size={20} />
					<span>Sponsor Unimob</span>
				</a>
			</div>
		</div>

		<!-- Section 3: Donations (For Students) -->
		<div class="card flex flex-col justify-between border border-base-300 bg-base-100 p-8 shadow-sm">
			<div>
				<span class="badge-outline mb-4 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
					For Students
				</span>
				<h2 class="mb-3 text-xl font-bold text-base-content">
					Student Donations
				</h2>
				<p class="mb-8 text-sm leading-relaxed text-base-content/70 sm:text-base">
					If these materials helped you pass an exam, consider chipping in to keep them free for the next batch.
				</p>
			</div>
			<div>
				<a
					href="https://razorpay.me/@zenik"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-outline inline-flex w-full items-center justify-center gap-2 py-3 text-base font-semibold shadow-sm focus-ring"
				>
					<Heart weight="light" size={20} />
					<span>Donate</span>
				</a>
			</div>
		</div>
	</div>
</div>
