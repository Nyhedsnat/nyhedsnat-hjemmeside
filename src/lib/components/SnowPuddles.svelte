<script lang="ts">
	import { snowPuddles } from '$lib/stores/snow';

	// Permanent meltwater marks left by melted snowmen. Mounted for the whole page
	// session inside .houses-container (so it shares the town's coordinate space), it
	// outlives both the snowman and the SnowCrash component. Each entry grows in once
	// (matching the melt) and then stays forever — the store only ever appends.
	//
	// Puddles restored from localStorage (earlier sessions) are already part of the
	// landscape by the time this mounts — they appear with the houses, no grow-in.
	// Only ones added THIS session (a snowman actually melting right now) animate.
	const initialCount = $snowPuddles.length;
</script>

{#each $snowPuddles as p, i (i)}
	<span class="perma-puddle" class:instant={i < initialCount} style="left: {p.x}vw;" aria-hidden="true"></span>
{/each}

<style>
	.perma-puddle {
		position: absolute;
		bottom: 7px;
		width: 32px;
		height: 6px;
		border-radius: 50%;
		transform: translateX(-50%) scaleX(0.2);
		background: radial-gradient(ellipse at center, rgba(150, 195, 230, 0.5), rgba(150, 195, 230, 0) 72%);
		opacity: 0;
		z-index: 1; /* same layer as the snowman: above back houses, below the vehicles */
		pointer-events: none;
		animation: puddle-grow 2.4s ease-out 0.6s forwards; /* grow in with the melt, then hold */
	}
	/* restored from localStorage — already there, no grow-in */
	.perma-puddle.instant {
		animation: none;
		opacity: 0.75;
		transform: translateX(-50%) scaleX(1);
	}
	@keyframes puddle-grow {
		0% { opacity: 0; transform: translateX(-50%) scaleX(0.2); }
		40% { opacity: 0.85; }
		100% { opacity: 0.75; transform: translateX(-50%) scaleX(1); }
	}
</style>
