<script lang="ts">
	import Vehicles from '$lib/components/Vehicles.svelte';
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
</div>
