<script lang="ts">
	import type { PageServerData } from './$types';
	import { authClient } from '#lib/auth-client.ts';

	let { data }: { data: PageServerData } = $props();

	async function handleSignOut() {
		await authClient.signOut();
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>Profile | Unimob</title>
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-16">
	<div class="card border border-base-300 bg-base-100 p-8 shadow-sm">
		<div class="flex items-center gap-4 mb-6">
			{#if data.user.image}
				<img
					src={data.user.image}
					alt={data.user.name}
					class="h-16 w-16 rounded-full border border-base-300 object-cover"
				/>
			{:else}
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content"
				>
					{data.user.name ? data.user.name.charAt(0).toUpperCase() : 'U'}
				</div>
			{/if}
			<div>
				<h1 class="text-2xl font-bold text-base-content">
					Welcome, {data.user.name}
				</h1>
				<p class="text-sm text-base-content/70">{data.user.email}</p>
			</div>
		</div>

		<div class="divider my-2"></div>

		<div class="space-y-3 text-sm">
			<div class="flex justify-between py-2 border-b border-base-200">
				<span class="text-base-content/60">Full Name</span>
				<span class="font-medium text-base-content">{data.user.name}</span>
			</div>
			<div class="flex justify-between py-2 border-b border-base-200">
				<span class="text-base-content/60">Email Address</span>
				<span class="font-medium text-base-content">{data.user.email}</span>
			</div>
			<div class="flex justify-between py-2 border-b border-base-200">
				<span class="text-base-content/60">Email Verified</span>
				<span class="font-medium text-base-content">
					{data.user.emailVerified ? 'Verified' : 'Pending'}
				</span>
			</div>
		</div>

		<div class="mt-8 flex items-center justify-between">
			<a href="/" class="btn btn-outline btn-sm">Back to Home</a>
			<button type="button" class="btn btn-primary btn-sm" onclick={handleSignOut}>
				Sign Out
			</button>
		</div>
	</div>
</section>
