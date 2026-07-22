<script lang="ts">
	import { trafficMode } from '$lib/stores/traffic';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	let active = $state(false); // parked overhead while the rain runs
	let raining = $state(false);
	let evaporating = $state(false);
	let puddles = $state<{ id: number; x: number; w: number; br: string; rot: number }[]>([]);
	let splashing = $state<Record<number, boolean>>({});
	let uid = 0;
	let effectTimer: ReturnType<typeof setTimeout> | undefined;

	// Irregular blob outline so a puddle reads as a real puddle, not a clean ellipse.
	function blobRadius() {
		const r = () => 35 + Math.floor(Math.random() * 35); // 35–70%
		return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
	}

	function start() {
		if (active) return;
		active = true;
		raining = true;
		evaporating = false;
		puddles = [8, 22, 36, 50, 64, 78, 92].map((x) => ({
			id: uid++,
			x: x + Math.random() * 8 - 4,
			w: 40 + Math.random() * 26,
			br: blobRadius(),
			rot: Math.random() * 24 - 12
		}));
		// hand the puddle x-centres (vw) to the traffic so cars splash when they pass over
		trafficMode.set({ rate: 0.6, spray: true, puddles: puddles.map((p) => p.x) });
		effectTimer = setTimeout(() => {
			raining = false;
			// Rain itself is over (back to normal speed, no spray) but the puddles are
			// still there evaporating — cars should keep splashing through them until
			// they're actually gone, not the instant the rain stops.
			trafficMode.set({ rate: 1, spray: false, puddles: puddles.map((p) => p.x) });
			evaporating = true; // rain's over → puddles slowly shrink away (evaporate)
			setTimeout(() => {
				puddles = [];
				evaporating = false;
				active = false; // un-park → drift resumes → onanimationend → ondone
				trafficMode.set(null); // puddles are gone now — nothing left to splash on
			}, 7000);
		}, 22000); // 14s rain + the 8s the puddles now take to grow
	}

	function splashPuddle(id: number) {
		splashing = { ...splashing, [id]: true };
		setTimeout(() => {
			const n = { ...splashing };
			delete n[id];
			splashing = n;
		}, 650);
	}
</script>

<button
	type="button"
	class="cloud rain {mode === 'static' ? 'debug' : direction}"
	class:active
	style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
	onclick={start}
	onanimationend={() => { if (!active && mode === 'drift') ondone?.(); }}
	aria-label="Regnsky"
>
	<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
	<span class="cloud-rain" aria-hidden="true">
		{#each Array(7) as _, i}
			<span class="cd" style="left: {8 + i * 12}px; --d: {0.7 + (i % 3) * 0.15}s; --delay: {-(i % 4) * 0.3}s;"></span>
		{/each}
	</span>
</button>

{#if raining}
	<div class="rainfall" aria-hidden="true">
		{#each Array(44) as _, i}
			<span class="drop" style="--x: {(i * 41) % 100}vw; --d: {(i % 5) * 0.15 + 0.55}s; --delay: {-(i % 9) * 0.2}s;"></span>
		{/each}
	</div>
{/if}
{#each puddles as p (p.id)}
	<button
		type="button"
		class="puddle"
		class:splash={splashing[p.id]}
		class:evaporate={evaporating}
		style="left: {p.x}vw; --w: {p.w}px; --br: {p.br}; --rot: {p.rot}deg;"
		onclick={() => splashPuddle(p.id)}
		aria-label="Vandpyt"
	>
		<span class="ripple"></span><span class="ripple r2"></span>
		{#if splashing[p.id]}<span class="drip">💧</span>{/if}
	</button>
{/each}

<style>
	/* a bit of rain always falling under the cloud (part of its look) */
	.cloud-rain { position: absolute; left: 50%; top: 30px; width: 84px; height: 46px; transform: translateX(-50%); pointer-events: none; z-index: -1; }
	.cd {
		position: absolute;
		top: 0;
		width: 2px;
		height: 8px;
		border-radius: 1px;
		background: linear-gradient(to bottom, rgba(180, 205, 235, 0), rgba(180, 205, 235, 0.85));
		animation: cloud-drip var(--d, 0.8s) linear var(--delay, 0s) infinite;
	}
	@keyframes cloud-drip {
		0% { transform: translateY(0); opacity: 0; }
		20% { opacity: 1; }
		100% { transform: translateY(42px); opacity: 0.15; }
	}

	.rainfall { position: absolute; inset: 0; pointer-events: none; z-index: 6; overflow: hidden; animation: wx-fade-in 0.6s ease forwards; }
	.drop {
		position: absolute;
		top: 38%; /* spawn under the cloud, not screen top */
		left: var(--x);
		width: 2px;
		height: 14px;
		border-radius: 1px;
		background: linear-gradient(to bottom, rgba(180, 205, 235, 0), rgba(180, 205, 235, 0.8));
		animation: drop-fall var(--d) linear var(--delay) infinite;
	}
	@keyframes drop-fall { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(320px); opacity: 0.2; } }

	/* real-puddle look: irregular blob outline (--br), varied size (--w) + tilt (--rot).
	   z-index 1 → sits on the road, BELOW the cars (z-index 2). */
	.puddle {
		position: absolute;
		bottom: 5px;
		width: var(--w, 46px);
		height: 13px;
		border: none;
		padding: 0;
		cursor: pointer;
		transform: translateX(-50%) rotate(var(--rot, 0deg));
		border-radius: var(--br, 50%);
		background:
			radial-gradient(60% 90% at 38% 45%, rgba(170, 198, 230, 0.6), rgba(150, 180, 215, 0) 75%),
			radial-gradient(45% 80% at 72% 60%, rgba(190, 214, 240, 0.5), rgba(150, 180, 215, 0) 78%),
			radial-gradient(120% 120% at 50% 40%, rgba(120, 150, 190, 0.45), rgba(95, 120, 160, 0.28) 85%);
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25);
		z-index: 1;
		pointer-events: auto;
		/* grow slowly into place — the mirror image of the evaporate shrink */
		animation: puddle-grow 8s ease-out forwards;
	}
	@keyframes puddle-grow {
		0% { transform: translateX(-50%) rotate(var(--rot, 0deg)) scale(0.06); opacity: 0; }
		15% { opacity: 1; }
		100% { transform: translateX(-50%) rotate(var(--rot, 0deg)) scale(1); opacity: 1; }
	}
	.puddle .ripple {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 8px;
		height: 3px;
		border-radius: 50%;
		border: 1px solid rgba(200, 220, 245, 0.6);
		transform: translate(-50%, -50%);
		animation: ripple 2.6s ease-out infinite;
	}
	.puddle .ripple.r2 { animation-delay: 1.3s; }
	@keyframes ripple {
		0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.3); }
		100% { opacity: 0; transform: translate(-50%, -50%) scale(3.2); }
	}
	.puddle.splash { animation: puddle-splash 0.4s ease-out; }
	@keyframes puddle-splash {
		0%, 100% { transform: translateX(-50%) rotate(var(--rot, 0deg)) scaleY(1); }
		50% { transform: translateX(-50%) rotate(var(--rot, 0deg)) scaleY(0.5); }
	}
	/* rain over → puddle slowly shrinks toward nothing (evaporates), fading only at the end */
	.puddle.evaporate { animation: puddle-evaporate 7s ease-in forwards; }
	@keyframes puddle-evaporate {
		0% { transform: translateX(-50%) rotate(var(--rot, 0deg)) scale(1); opacity: 1; }
		85% { opacity: 0.85; }
		100% { transform: translateX(-50%) rotate(var(--rot, 0deg)) scale(0.06); opacity: 0; }
	}
	.puddle .drip { position: absolute; left: 50%; top: -10px; font-size: 14px; transform: translateX(-50%); animation: drip-up 0.65s ease-out forwards; }
	@keyframes drip-up {
		0% { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.4); }
		30% { opacity: 1; transform: translateX(-50%) translateY(-8px) scale(1.1); }
		100% { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(0.8); }
	}
</style>
