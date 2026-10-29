<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon } from 'phosphor-svelte';

	let currentTheme = $state('light');

	onMount(() => {
		const theme = document.documentElement.getAttribute('data-theme') || 'light';
		currentTheme = theme;
	});

	function toggleTheme() {
		const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
		currentTheme = nextTheme;
		document.documentElement.setAttribute('data-theme', nextTheme);
		try {
			localStorage.setItem('theme', nextTheme);
		} catch (_) {}
	}
</script>

<nav class="sticky top-0 z-50 flex w-full items-center justify-between border-b border-base-300 bg-base-100/80 px-4 py-3 backdrop-blur-md">
	<a href="/" class="flex items-center">
		<span class="text-2xl font-extrabold tracking-tighter text-base-content">uni</span><span class="text-2xl font-extrabold tracking-tighter text-primary">mob</span>
	</a>

	<div class="flex items-center gap-3">
		<button
			type="button"
			class="btn btn-ghost btn-circle btn-sm"
			onclick={toggleTheme}
			aria-label="Toggle light or dark theme"
			title="Toggle theme"
		>
			{#if currentTheme === 'light'}
				<Sun weight="light" size={20} />
			{:else}
				<Moon weight="light" size={20} />
			{/if}
		</button>
	</div>
</nav>
