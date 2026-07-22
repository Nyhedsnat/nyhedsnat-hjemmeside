<script lang="ts">
	import { onMount } from 'svelte';
	import { abductBeam, abductCaught, abductRelease } from '$lib/stores/traffic';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	let active = $state(false);
	let beam = $state(false);
	let el = $state<HTMLButtonElement>();

	function cloudXPct() {
		if (!el) return 50;
		const r = el.getBoundingClientRect();
		return ((r.left + r.width / 2) / window.innerWidth) * 100;
	}

	// Click → drop a green tractor beam and ARM it (cloud parks). Beam stays until a car
	// drives into it (Vehicles lifts it → abductCaught → beam off) or a re-click disarms.
	function onClick() {
		if (beam) {
			abductRelease.update((n) => n + 1); // user turned it off → drop any car still rising
			disarm();
			return;
		}
		active = true;
		beam = true;
		abductBeam.set({ xPct: cloudXPct() });
	}
	function disarm() {
		beam = false;
		abductBeam.set(null);
		active = false; // un-park → drift resumes → ondone
	}

	onMount(() => {
		// A car drove into the beam → keep it lit through the lift, then shut it off.
		const unsub = abductCaught.subscribe(() => {
			if (!beam) return; // ignore the initial value / stray bumps
			setTimeout(disarm, 1700); // keep the beam lit until the car reaches the top
		});
		return () => {
			unsub();
			abductBeam.set(null);
		};
	});
</script>

<button
	bind:this={el}
	type="button"
	class="cloud ufo {mode === 'static' ? 'debug' : direction}"
	class:active
	style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
	onclick={onClick}
	onanimationend={() => { if (!active && mode === 'drift') ondone?.(); }}
	aria-label="UFO-sky"
>
	<span class="ufo-glow"></span>
	<svg class="ufo-mini" viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<ellipse class="uf-dome" cx="100" cy="34" rx="34" ry="18" />
		<ellipse class="uf-hi" cx="90" cy="29" rx="10" ry="6" />
		<ellipse class="uf-body" cx="100" cy="50" rx="78" ry="20" />
		<ellipse class="uf-mid" cx="100" cy="53" rx="64" ry="16" />
		<ellipse class="uf-dark" cx="100" cy="57" rx="46" ry="11" />
	</svg>
	{#if beam}
		<div class="beam-wrap" aria-hidden="true">
			<div class="beam"></div>
		</div>
	{/if}
</button>

<style>
	/* the UFO cloud sits high so its green cone is ALWAYS on top of the vehicles
	   (abducted car rises to z-index 4 — above the houses, below this beam). Within
	   the saucer itself, the cone draws IN FRONT OF the UFO body. */
	.cloud.ufo { z-index: 6; }
	.cloud.ufo .beam-wrap { z-index: 2; }
</style>
