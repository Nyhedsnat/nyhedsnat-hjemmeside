<script lang="ts">
	import Vehicles from '$lib/components/Vehicles.svelte';
	import Convoy from '$lib/components/Convoy.svelte';
</script>

<svelte:head>
	<title>Animationstest – NyhedsNat</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-5xl space-y-8 px-4 py-10">
	<header class="space-y-2">
		<h1 class="text-2xl font-bold text-star-white sm:text-3xl">Animationstest</h1>
		<p class="text-star-white/70">
			Alle køretøjernes klik-animationer (easter eggs) i ét overblik. Klik på et felt for at
			afspille animationen – klik igen for at gentage.
		</p>
	</header>

	<Vehicles grid />

	<section class="space-y-3">
		<h2 class="text-lg font-semibold text-star-white">Konvoj</h2>
		<p class="text-sm text-star-white/70">
			Konvoj-bilerne har deres eget easter egg: klik på en bil for at få den til at danse.
		</p>
		<Convoy preview />
	</section>
</div>
