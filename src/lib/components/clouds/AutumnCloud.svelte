<script lang="ts">
	import { onDestroy } from 'svelte';
	import { trafficMode } from '$lib/stores/traffic';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	let active = $state(false);
	let autumn = $state(false);
	let el = $state<HTMLButtonElement>();
	let autumnLeaves = $state<
		{ id: number; lx: number; by: number; d: number; delay: number; sx: number; sy: number; gust: number; spin: number; rest: number; c: number }[]
	>([]);
	let leavingLeaves = $state<Record<number, boolean>>({}); // leaves blowing off screen one by one
	let kicks = $state<{ id: number; x: number }[]>([]);
	let clearTimer: ReturnType<typeof setTimeout> | undefined;
	let clearInt: ReturnType<typeof setInterval> | undefined;
	let kickTimer: ReturnType<typeof setTimeout> | undefined;
	let uid = 0;

	// All leaves EMIT from the cloud (single point), then get blown out on the wind to
	// their spread-out resting spots across the road, where they settle + pile.
	function start() {
		if (active) return;
		active = true;
		autumn = true;
		leavingLeaves = {};
		const N = 480;
		const iw = typeof window !== 'undefined' ? window.innerWidth : 1200;
		const r = el?.getBoundingClientRect();
		const houses = el?.closest('.houses-container') as HTMLElement | null;
		const hRect = houses?.getBoundingClientRect();
		const containerH = hRect ? hRect.height : 400;
		const cloudX = r ? r.left + r.width / 2 : iw / 2; // emit point (screen px)
		// emit point's y measured from the CONTAINER TOP (leaf-layer is inset:0 of it), so
		// the fall distance always matches the cloud's real position — same fix as the UFO
		// rise: don't guess a fixed px gap, measure the actual one for this screen.
		const cloudY = r && hRect ? r.top + r.height * 0.7 - hRect.top : 40;
		autumnLeaves = Array.from({ length: N }, (_, i) => {
			const lx = Math.random() * 98; // resting left (vw), spread across the road
			const by = Math.random() * 12;
			const restY = containerH - by; // resting spot's y from the container top
			return {
				id: uid++,
				lx,
				by,
				d: Math.random() * 2.8 + 5.2, // slow fall (~5–8s)
				delay: (i / N) * 12 + Math.random() * 0.5, // spread over ~12s
				sx: cloudX - (lx / 100) * iw, // px from resting spot back to the cloud emit point
				sy: cloudY - restY, // px from resting spot up to the cloud emit point (negative)
				gust: (Math.random() * 2 - 1) * 70, // wind sway on the way down
				spin: Math.random() * 360,
				rest: Math.random() * 80 - 40,
				c: Math.floor(Math.random() * 4)
			};
		});
		// slow the cars right away, but only let them KICK UP leaves once leaves have
		// actually landed on the road (~7s) — otherwise they kick nothing.
		trafficMode.set({ rate: 0.55 });
		kickTimer = setTimeout(() => trafficMode.set({ rate: 0.55, leaves: true }), 7000);
		const SETTLE = 22000; // by now every leaf has landed
		const CLEAR = 30000; // then blow them off screen one by one over 30s
		clearTimer = setTimeout(() => blowLeavesAway(CLEAR), SETTLE);
		setTimeout(() => {
			autumn = false;
			autumnLeaves = [];
			leavingLeaves = {};
			trafficMode.set(null);
			active = false; // un-park → drift resumes → ondone
		}, SETTLE + CLEAR + 2500);
	}

	function blowLeavesAway(durationMs: number) {
		const ids = autumnLeaves.map((l) => l.id);
		const interval = Math.max(20, durationMs / Math.max(1, ids.length));
		let i = 0;
		clearInterval(clearInt);
		clearInt = setInterval(() => {
			if (i >= ids.length) {
				clearInterval(clearInt);
				return;
			}
			const lid = ids[i++];
			leavingLeaves = { ...leavingLeaves, [lid]: true }; // starts its blow-away animation
			setTimeout(() => (autumnLeaves = autumnLeaves.filter((l) => l.id !== lid)), 1800);
		}, interval);
	}

	function kickLeaves() {
		const k = { id: uid++, x: Math.random() * 60 + 20 };
		kicks = [...kicks, k];
		setTimeout(() => (kicks = kicks.filter((x) => x.id !== k.id)), 900);
	}

	onDestroy(() => {
		clearTimeout(clearTimer);
		clearTimeout(kickTimer);
		clearInterval(clearInt);
	});
</script>

<button
	bind:this={el}
	type="button"
	class="cloud autumn {mode === 'static' ? 'debug' : direction}"
	class:active
	style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
	onclick={start}
	onanimationend={(e) => { if (!active && mode === 'drift' && e.target === el) ondone?.(); }}
	aria-label="Efterårssky"
>
	<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
	<span class="cloud-leaves" aria-hidden="true">
		{#each Array(6) as _, i}
			<span class="clf gl{i % 4}" style="left: {8 + i * 13}px; --d: {1.8 + (i % 3) * 0.4}s; --delay: {-(i % 4) * 0.4}s; --sway: {((i % 3) - 1) * 8}px; --r: {i * 47}deg;"></span>
		{/each}
	</span>
</button>

{#if autumn}
	<div class="leaf-layer" aria-hidden="true">
		{#each autumnLeaves as l (l.id)}
			<span
				class="ground-leaf gl{l.c} settling"
				class:leaving={leavingLeaves[l.id]}
				style="--x: {l.lx}vw; --b: {l.by}px; --d: {l.d}s; --delay: {l.delay}s; --sx: {l.sx}px; --sy: {l.sy}px; --gust: {l.gust}px; --spin: {l.spin}deg; --rest: {l.rest}deg;"
			></span>
		{/each}
	</div>
	<button type="button" class="leaf-kick-zone" onclick={kickLeaves} aria-label="Blade på vejen"></button>
{/if}
{#each kicks as k (k.id)}
	<span class="kick" style="left: {k.x}vw;" aria-hidden="true">🍂</span>
{/each}

<style>
	/* a bit of leaves always drifting down under the cloud (part of its look) */
	.cloud-leaves { position: absolute; left: 50%; top: 30px; width: 84px; height: 46px; transform: translateX(-50%); pointer-events: none; z-index: -1; }
	.clf { position: absolute; top: 0; width: 8px; height: 6px; border-radius: 0 100% 0 100%; animation: cloud-leaffall var(--d, 2s) ease-in-out var(--delay, 0s) infinite; }
	.clf::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 8%;
		width: 1px;
		height: 84%;
		background: rgba(80, 40, 15, 0.45);
		transform: translateX(-50%);
	}
	.clf.gl0 { background: #d9822b; }
	.clf.gl1 { background: #c14f2b; }
	.clf.gl2 { background: #e6b23a; }
	.clf.gl3 { background: #a83e1f; }
	@keyframes cloud-leaffall {
		0% { transform: translate(0, 0) rotate(var(--r, 0)); opacity: 0; }
		20% { opacity: 1; }
		50% { transform: translate(var(--sway, 6px), 22px) rotate(calc(var(--r, 0) + 120deg)); }
		100% { transform: translate(calc(var(--sway, 6px) * -1), 42px) rotate(calc(var(--r, 0) + 240deg)); opacity: 0.15; }
	}

	/* this autumn cloud sits at z-index 5 (above the default 4) so the leaves can be at
	   z-index 4: in FRONT of the house-fronts (z-index 3) but BEHIND the cloud. */
	.cloud { z-index: 5; }
	.leaf-layer { position: absolute; inset: 0; pointer-events: none; z-index: 4; overflow: hidden; filter: brightness(0.85); /* night — leaves a touch darker */ }
	/* leaf shape: a lobed maple-ish blob with a midrib. Each `settling` leaf falls from
	   above into its resting spot (--x/--b) and STAYS there (fill: both). */
	.ground-leaf {
		position: absolute;
		left: var(--x);
		bottom: var(--b, 0);
		width: 6px; /* small final size — leaves exist only at this size, no shrink */
		height: 5px;
		border-radius: 0 100% 0 100%;
	}
	.ground-leaf.settling {
		opacity: 0;
		animation: leaf-settle var(--d, 3s) cubic-bezier(0.32, 0.5, 0.45, 1) var(--delay, 0s) both;
	}
	/* emit from the cloud (--sx/--sy = measured offset back to the cloud, in px — scales to
	   any screen size), then blow out on the wind (--gust) toward the resting spot as it
	   falls. Always the small size — no scale. */
	@keyframes leaf-settle {
		0% { transform: translate(var(--sx), var(--sy)) rotate(-40deg); opacity: 0; }
		8% { opacity: 1; }
		45% { transform: translate(calc(var(--sx) * 0.55 + var(--gust)), calc(var(--sy) * 0.56)) rotate(var(--spin, 180deg)); opacity: 1; }
		75% { transform: translate(calc(var(--sx) * 0.2 + var(--gust) * 0.4), calc(var(--sy) * 0.13)) rotate(calc(var(--spin, 180deg) * 0.6)); opacity: 1; }
		100% { transform: translate(0, 0) rotate(var(--rest, 0deg)); opacity: 1; }
	}
	/* clearing: each settled leaf lifts, tumbles, blows off the bottom (rule after
	   .settling so it wins the `animation` property). */
	.ground-leaf.leaving {
		animation: leaf-blowaway 1.7s ease-in forwards;
	}
	@keyframes leaf-blowaway {
		0% { transform: translate(0, 0) rotate(var(--rest, 0deg)); opacity: 1; }
		25% { transform: translate(calc(var(--gust) * 0.3), -18px) rotate(calc(var(--rest, 0deg) + 70deg)); opacity: 1; }
		100% { transform: translate(calc(var(--gust) * 0.9), 80px) rotate(calc(var(--rest, 0deg) + 240deg)); opacity: 0; }
	}
	.ground-leaf::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 8%;
		width: 1px;
		height: 84%;
		background: rgba(80, 40, 15, 0.45); /* midrib vein */
		transform: translateX(-50%);
	}
	.ground-leaf.gl0 { background: #d9822b; }
	.ground-leaf.gl1 { background: #c14f2b; }
	.ground-leaf.gl2 { background: #e6b23a; }
	.ground-leaf.gl3 { background: #a83e1f; }
	/* invisible strip over the settled leaves → click still kicks them up */
	.leaf-kick-zone {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 22px;
		border: none;
		padding: 0;
		margin: 0;
		background: none;
		cursor: pointer;
		z-index: 6;
		pointer-events: auto;
	}
	.kick { position: absolute; bottom: 10px; font-size: 18px; transform: translateX(-50%); z-index: 3; pointer-events: none; animation: leaf-kick 0.9s ease-out forwards; }
	@keyframes leaf-kick {
		0% { opacity: 0; transform: translateX(-50%) translateY(0) rotate(0) scale(0.5); }
		30% { opacity: 1; }
		100% { opacity: 0; transform: translateX(-50%) translateY(-40px) rotate(220deg) scale(1.1); }
	}
</style>
