<script lang="ts">
	import { onMount } from 'svelte';
	import { trafficPulse } from '$lib/stores/traffic';
	import { jaggedPath } from '$lib/lightning';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	// Thunder never parks — the cloud keeps drifting and each click fires another bolt.
	let charging = $state(false);
	let flashing = $state(false);
	let el = $state<HTMLButtonElement>();

	// A little fractal bolt (SAME kind that strikes cars) crackles under the belly, so
	// the thunder cloud is unmistakable vs the snow cloud. Regenerated on a beat.
	let boltPath = $state('');
	let boltKey = $state(0);
	function crackle() {
		boltPath = jaggedPath(28, 2, 28 + (Math.random() * 10 - 5), 56, 13, 4);
		boltKey++;
	}
	onMount(() => {
		crackle();
		const iv = setInterval(crackle, 1500);
		return () => clearInterval(iv);
	});

	// Click → cloud CHARGES briefly, then discharges a bolt into the car below it
	// (Vehicles draws the bolt from the emit-point + blackens/stalls the car).
	function bolt() {
		if (charging) return;
		charging = true;
		setTimeout(() => {
			charging = false;
			const r = el?.getBoundingClientRect();
			const ox = r ? r.left + r.width / 2 : window.innerWidth / 2;
			const oy = r ? r.bottom - 4 : 100; // emit from the cloud's belly
			const xPct = (ox / window.innerWidth) * 100;
			trafficPulse.set({ kind: 'strike', xPct, ox, oy });
			flashing = true;
			setTimeout(() => (flashing = false), 220);
			shake();
			setTimeout(() => trafficPulse.set({ kind: 'flinch' }), 120);
		}, 340);
	}
	function shake() {
		const scene = el?.closest('.houses-container') as HTMLElement | null;
		if (!scene) return; // jolt the town, not the whole page (keeps the fixed nav safe)
		scene.classList.remove('wx-shake');
		void scene.offsetWidth; // reflow so the animation restarts on repeat bolts
		scene.classList.add('wx-shake');
		setTimeout(() => scene.classList.remove('wx-shake'), 450);
	}
</script>

<button
	bind:this={el}
	type="button"
	class="cloud thunder {mode === 'static' ? 'debug' : direction}"
	class:charging
	style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
	onclick={bolt}
	onanimationend={(e) => { if (mode === 'drift' && e.target === el) ondone?.(); }}
	aria-label="Tordensky"
>
	<span class="under-glow"></span>
	<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
	{#key boltKey}
		<svg class="cloud-bolt" viewBox="0 0 56 60" aria-hidden="true">
			<path class="cb-glow" d={boltPath} />
			<path class="cb-core" d={boltPath} />
		</svg>
	{/key}
</button>

{#if flashing}
	<div class="flash" aria-hidden="true"></div>
{/if}

<style>
	.flash {
		position: fixed;
		inset: 0;
		z-index: 25;
		pointer-events: none;
		/* dim + slightly blue so the bright white bolt (z-index 100) stays readable */
		background: rgba(214, 228, 255, 0.5);
		animation: flash-out 0.32s ease-out forwards;
	}
	@keyframes flash-out { 0% { opacity: 0; } 20% { opacity: 0.5; } 55% { opacity: 0.12; } 78% { opacity: 0.32; } 100% { opacity: 0; } }

	/* fractal bolt crackling under the belly — makes the thunder cloud unmistakable */
	.cloud-bolt {
		position: absolute;
		left: 50%;
		top: 24px;
		width: 46px;
		height: auto;
		transform: translateX(-50%);
		pointer-events: none;
		z-index: -1; /* behind the cloud puffs */
		overflow: visible;
		filter: drop-shadow(0 0 3px #cfe4ff) drop-shadow(0 0 8px #7db4ff);
		animation: cb-flicker 1.5s ease-out;
	}
	.cb-glow { fill: none; stroke: #8fc0ff; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; opacity: 0.5; }
	.cb-core { fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
	@keyframes cb-flicker {
		0% { opacity: 0; }
		6% { opacity: 1; }
		16% { opacity: 0.3; }
		26% { opacity: 1; }
		60% { opacity: 0.85; }
		100% { opacity: 0; }
	}
</style>
