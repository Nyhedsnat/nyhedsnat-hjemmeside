<script lang="ts">
	import './layout.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Drone from '$lib/components/Drone.svelte';
	import Ufo from '$lib/components/Ufo.svelte';
	import Vehicles from '$lib/components/Vehicles.svelte';
	import Convoy from '$lib/components/Convoy.svelte';
	import MoonLaser from '$lib/components/MoonLaser.svelte';
	import Streamers from '$lib/components/Streamers.svelte';
	import SnowCrash from '$lib/components/SnowCrash.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/svg/logo.svg" type="image/svg+xml" />
	<meta name="theme-color" content="#030712" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Animated starfield background -->
<div class="starfield">
	<div class="shooting-star"></div>
</div>

<!-- Streamers easter egg (triggered by double-clicking logo) -->
<Streamers />

<!-- Flying drone -->
<Drone />

<!-- UFO with search pattern -->
<Ufo />

<!-- Main app structure -->
<div class="main-content flex min-h-screen flex-col">
	<!-- Moon in top right corner (double-click for laser!) -->
	<MoonLaser />

	<Navigation />

	<!-- Main content with padding for fixed header -->
	<main class="page-content flex-1 pt-24 sm:pt-28 md:pt-36 lg:pt-40">
		{@render children()}
	</main>

	<!-- Houses silhouette at the bottom (stacked layers) -->
	<div class="houses-container">
		<!-- Back layer: houses without lights (behind vehicles) -->
		<img src="/svg/background/huse-no-lights.svg" alt="" class="houses-silhouette houses-back" aria-hidden="true" />
		<!-- Vehicles drive between the layers -->
		<Vehicles />
		<Convoy />
		<!-- Snowstorm pile-up easter egg (click the drifting snow cloud) -->
		<SnowCrash />
		<!-- Front layer: house lights (above vehicles) -->
		<img src="/svg/background/huse-lights.svg" alt="" class="houses-silhouette houses-front" aria-hidden="true" />
	</div>

	<Footer />
</div>

<style>
	.main-content {
		position: relative;
		z-index: 2;
	}

	.houses-container {
		width: 100%;
		overflow: hidden;
		margin-top: auto;
		position: relative;
		z-index: 1;
	}

	.houses-silhouette {
		width: 100%;
		height: auto;
		display: block;
		min-width: 1200px;
		margin-left: 50%;
		transform: translateX(-50%);
		pointer-events: none;
	}

	/* Back layer sets the container height */
	.houses-back {
		position: relative;
		z-index: 1;
	}

	/* Front layer overlays on top */
	.houses-front {
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: 3;
	}
</style>
