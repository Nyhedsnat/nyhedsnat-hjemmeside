<script lang="ts">
	import { trafficMode } from '$lib/stores/traffic';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	let active = $state(false);
	let fog = $state(false);
	let fogLeaving = $state(false); // fading out (fog-roll played in reverse), not gone yet
	let fogParting = $state(false);
	const LEAVE_MS = 3000; // matches fog-roll's own 3s

	function onClick() {
		if (active) return partFog(); // re-click while foggy → part the fog briefly
		active = true;
		fog = true;
		fogLeaving = false;
		trafficMode.set({ rate: 0.25, glow: true });
		setTimeout(() => {
			trafficMode.set(null);
			fogLeaving = true; // drift off slowly — same roll, played in reverse
			setTimeout(() => {
				fog = false;
				fogLeaving = false;
				active = false; // un-park → drift resumes → ondone
			}, LEAVE_MS);
		}, 16000);
	}
	function partFog() {
		fogParting = true;
		setTimeout(() => (fogParting = false), 1300);
	}
</script>

<button
	type="button"
	class="cloud fog {mode === 'static' ? 'debug' : direction}"
	class:active
	style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
	onclick={onClick}
	onanimationend={() => { if (!active && mode === 'drift') ondone?.(); }}
	aria-label="Tågesky"
>
	<!-- diffuse overlapping wisps (not 3 hard circles) → reads as a fog bank -->
	<span class="fog-wisp w1"></span><span class="fog-wisp w2"></span><span class="fog-wisp w3"></span>
	<span class="fog-wisp w4"></span><span class="fog-wisp w5"></span>
</button>

{#if fog}
	<div class="fog-overlay" class:parting={fogParting} class:leaving={fogLeaving} aria-hidden="true"></div>
{/if}

<style>
	/* Fog sits over the CITY only (absolute inside houses-container → clipped to the
	   town). Fills the full town band, dense + blurry at the road and fading out VERY
	   gradually going up — one long soft edge rather than a short cut-off. */
	.fog-overlay {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 4; /* above houses-front (3) + cars (2) so it blurs the whole town */
		pointer-events: none;
		background: linear-gradient(
			to top,
			rgba(160, 168, 180, 0.6) 0%,
			rgba(158, 166, 178, 0.4) 30%,
			rgba(156, 164, 176, 0.18) 60%,
			rgba(156, 164, 176, 0) 92%
		);
		backdrop-filter: blur(3px);
		-webkit-backdrop-filter: blur(3px);
		/* long, gradual fade of the tint + blur from ~12% up to ~92% up */
		-webkit-mask-image: linear-gradient(to top, #000 0%, #000 12%, transparent 92%);
		mask-image: linear-gradient(to top, #000 0%, #000 12%, transparent 92%);
		animation: fog-roll 3s ease forwards;
		transition: opacity 0.8s ease;
	}
	.fog-overlay.parting { opacity: 0.25; }
	/* drifts off slowly instead of just vanishing — the entrance roll, played in reverse */
	.fog-overlay.leaving { animation: fog-roll-out 3s ease forwards; }
	@keyframes fog-roll { from { opacity: 0; } to { opacity: 1; } }
	@keyframes fog-roll-out { from { opacity: 1; } to { opacity: 0; } }
</style>
