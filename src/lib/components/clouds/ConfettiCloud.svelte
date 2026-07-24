<script lang="ts">
	import { onMount } from 'svelte';
	import { trafficPulse } from '$lib/stores/traffic';
	import { confettiPresent } from '$lib/stores/rogueBalloon';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	// The big rogue balloon (Balloon.svelte) only spawns while this cloud is on screen.
	onMount(() => {
		confettiPresent.set(true);
		return () => confettiPresent.set(false);
	});

	let active = $state(false);
	let confetti = $state(false); // true while still spawning new confetti
	let confettiPieces = $state<{ id: number; x: number; c: number; d: number; rot: number }[]>([]);
	let streamers = $state<{ id: number; x: number }[]>([]);
	let balloons = $state<{ id: number; x: number; hue: number }[]>([]);
	// bursts from popped balloons — each with a random scatter of coloured bits
	let pops = $state<{ id: number; x: number; y: number; bits: { dx: number; dy: number; color: string; rot: number }[] }[]>([]);
	const POP_COLORS = ['#ff2a6d', '#ff8a00', '#ffe600', '#00f5a0', '#00d4ff', '#7b61ff', '#ff2ad4', '#ff5d8f', '#4ad3ff', '#7bff9a'];
	function makeBits() {
		return Array.from({ length: 14 }, () => ({
			dx: Math.random() * 108 - 54, // -54..54
			dy: -(Math.random() * 54 + 6), // -6..-60 (mostly upward, like the car poof)
			color: POP_COLORS[Math.floor(Math.random() * POP_COLORS.length)],
			rot: Math.floor(Math.random() * 360)
		}));
	}
	let confettiTimer: ReturnType<typeof setInterval> | undefined;
	let confTick = 0;
	let uid = 0;

	const CONF_SPAWN_MS = 5000; // how long new confetti keeps coming

	// Each piece falls ONCE and self-removes, so when spawning stops the airborne pieces
	// keep falling and clear the sky naturally instead of all vanishing at once.
	function spawnConfettiTick() {
		if (!confetti) return;
		for (let k = 0; k < 3; k++) {
			const p = {
				id: uid++,
				x: Math.random() * 100,
				c: Math.floor(Math.random() * 5),
				d: Math.random() * 1.8 + 2.6,
				rot: Math.random() * 720 - 360
			};
			confettiPieces = [...confettiPieces, p];
			setTimeout(() => (confettiPieces = confettiPieces.filter((q) => q.id !== p.id)), p.d * 1000 + 60);
		}
		confTick++;
		if (confTick % 6 === 0) {
			const s = { id: uid++, x: Math.random() * 90 + 5 };
			streamers = [...streamers, s];
			setTimeout(() => (streamers = streamers.filter((q) => q.id !== s.id)), 4600);
		}
	}

	function start() {
		if (active) return;
		active = true;
		confetti = true;
		confettiPieces = [];
		streamers = [];
		confTick = 0;
		balloons = Array.from({ length: 10 }, () => ({
			id: uid++,
			x: Math.random() * 84 + 8,
			hue: Math.floor(Math.random() * 360)
		}));
		trafficPulse.set({ kind: 'bounce' });
		setTimeout(() => trafficPulse.set({ kind: 'bounce' }), 1300);
		spawnConfettiTick();
		confettiTimer = setInterval(spawnConfettiTick, 120);
		// stop spawning, keep parked until the last airborne piece + streamer has landed
		setTimeout(() => {
			confetti = false;
			clearInterval(confettiTimer);
			// balloons keep rising to the top and self-remove on animationend (below)
			setTimeout(() => (active = false), 4800);
		}, CONF_SPAWN_MS);
	}

	// Pop → burst a confetti explosion where the balloon is + remove it. Fired both by a
	// click and automatically when the balloon reaches its max height (animationend).
	function popBalloon(id: number, e: Event) {
		const el = e.currentTarget as HTMLElement;
		const cont = el.closest('.houses-container');
		if (cont) {
			const r = el.getBoundingClientRect();
			const cr = cont.getBoundingClientRect();
			const pop = { id: uid++, x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top, bits: makeBits() };
			pops = [...pops, pop];
			setTimeout(() => (pops = pops.filter((p) => p.id !== pop.id)), 1000);
		}
		balloons = balloons.filter((b) => b.id !== id);
	}
</script>

<button
	type="button"
	class="cloud confetti {mode === 'static' ? 'debug' : direction}"
	class:active
	style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
	onclick={start}
	onanimationend={() => { if (!active && mode === 'drift') ondone?.(); }}
	aria-label="Konfettisky"
>
	<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
	<span class="cloud-conf" aria-hidden="true">
		{#each Array(7) as _, i}
			<span class="cc cc{i % 5}" style="left: {8 + i * 12}px; --d: {0.9 + (i % 3) * 0.2}s; --delay: {-(i % 4) * 0.3}s;"></span>
		{/each}
	</span>
</button>

<!-- layer stays mounted while any piece is still falling, even after spawning stops -->
{#if confetti || confettiPieces.length || streamers.length}
	<div class="confetti-layer" aria-hidden="true">
		{#each confettiPieces as p (p.id)}
			<span class="conf c{p.c}" style="left: {p.x}vw; --d: {p.d}s; --rot: {p.rot}deg;"></span>
		{/each}
		{#each streamers as s (s.id)}
			<span class="streamer" style="left: {s.x}vw;"></span>
		{/each}
	</div>
{/if}
{#each balloons as b (b.id)}
	<button type="button" class="balloon" style="left: {b.x}vw; --hue: {b.hue};" onclick={(e) => popBalloon(b.id, e)} onanimationend={(e) => popBalloon(b.id, e)} aria-label="Ballon">
		<span class="knot"></span>
	</button>
{/each}
{#each pops as p (p.id)}
	<span class="balloon-pop" style="left: {p.x}px; top: {p.y}px;" aria-hidden="true">
		{#each p.bits as b, i (i)}
			<span class="bp" style="background: {b.color}; --dx: {b.dx}px; --dy: {b.dy}px; --rot: {b.rot}deg;"></span>
		{/each}
	</span>
{/each}

<style>
	/* subtle blur on the puffs → softer, more cloud-like */
	.cloud.confetti .puff { filter: blur(1.6px); }
	/* each puff a different confetti colour → cloud follows the confetti scheme */
	.cloud.confetti .puff.p1 { background: radial-gradient(circle at 40% 35%, #ffd7ef, #ff9ecf 68%, rgba(255, 158, 207, 0) 100%); } /* the original cloud pink */
	.cloud.confetti .puff.p2 { background: radial-gradient(circle at 40% 35%, #9fe6ff, #4ad3ff 68%, rgba(74, 211, 255, 0) 100%); }
	.cloud.confetti .puff.p3 { background: radial-gradient(circle at 40% 35%, #d7ffb0, #7bff9a 68%, rgba(123, 255, 154, 0) 100%); }

	/* a bit of confetti always drifting down under the cloud (part of its look) */
	.cloud-conf { position: absolute; left: 50%; top: 30px; width: 84px; height: 46px; transform: translateX(-50%); pointer-events: none; z-index: -1; }
	.cc { position: absolute; top: 0; width: 4px; height: 6px; animation: cloud-confetti var(--d, 1s) linear var(--delay, 0s) infinite; }
	.cc.cc0 { background: #ff5d8f; }
	.cc.cc1 { background: #ffd24a; }
	.cc.cc2 { background: #4ad3ff; }
	.cc.cc3 { background: #7bff9a; }
	.cc.cc4 { background: #c78bff; }
	@keyframes cloud-confetti {
		0% { transform: translateY(0) rotate(0); opacity: 0; }
		20% { opacity: 1; }
		100% { transform: translateY(42px) rotate(360deg); opacity: 0.15; }
	}

	.confetti-layer { position: absolute; inset: 0; pointer-events: none; z-index: 6; overflow: hidden; filter: brightness(0.88); /* night — still festive, just a touch darker */ }
	/* one-shot fall (forwards) → each piece falls once and is then removed in JS */
	.conf { position: absolute; top: 38%; width: 4px; height: 6px; animation: conf-fall var(--d) linear forwards; } /* 50% smaller; spawn under the cloud */
	.conf.c0 { background: #ff5d8f; }
	.conf.c1 { background: #ffd24a; }
	.conf.c2 { background: #4ad3ff; }
	.conf.c3 { background: #7bff9a; }
	.conf.c4 { background: #c78bff; }
	@keyframes conf-fall {
		0% { transform: translateY(0) rotate(var(--rot)); opacity: 0; }
		10% { opacity: 1; }
		85% { opacity: 1; }
		100% { transform: translateY(320px) rotate(calc(var(--rot) + 720deg)); opacity: 0; }
	}
	.streamer {
		position: absolute;
		top: 38%;
		width: 6px;
		height: 60px;
		border-radius: 3px;
		background: repeating-linear-gradient(45deg, #ff5d8f 0 8px, #ffd24a 8px 16px, #4ad3ff 16px 24px);
		opacity: 0.85;
		animation: streamer-fall 4.5s ease-in forwards;
	}
	@keyframes streamer-fall { 0% { transform: translateY(0) rotate(-6deg); opacity: 0; } 12% { opacity: 0.85; } 85% { opacity: 0.85; } 100% { transform: translateY(320px) rotate(6deg); opacity: 0; } }

	.balloon {
		position: absolute;
		bottom: 8px;
		width: 13px;
		height: 16px;
		border: none;
		padding: 0;
		cursor: pointer;
		transform: translateX(-50%);
		border-radius: 50% 50% 48% 48%;
		background: radial-gradient(circle at 35% 30%, hsl(var(--hue), 90%, 78%), hsl(var(--hue), 75%, 55%) 75%);
		z-index: 5;
		pointer-events: auto;
		filter: brightness(0.88); /* night — a touch darker */
		animation: balloon-rise 12s ease-in forwards;
	}
	.balloon .knot { position: absolute; left: 50%; bottom: -2px; width: 2px; height: 2px; transform: translateX(-50%); background: hsl(var(--hue), 75%, 50%); border-radius: 0 0 1px 1px; }
	/* rise to the top (≈ where confetti spawns) staying fully visible, then pop
	   (animationend → confetti burst). No fade — it pops, it doesn't vanish. */
	@keyframes balloon-rise {
		0% { transform: translateX(-50%) translateY(0); opacity: 0; }
		12% { opacity: 1; }
		100% { transform: translateX(-50%) translateY(-270px) translateX(16px); opacity: 1; }
	}
	/* confetti explosion where a balloon was popped */
	.balloon-pop { position: absolute; width: 0; height: 0; z-index: 6; pointer-events: none; }
	.balloon-pop .bp {
		position: absolute;
		left: 0;
		top: 0;
		width: 7px;
		height: 9px;
		opacity: 0;
		animation: balloon-burst 0.9s ease-out forwards;
	}
	/* random scatter, like the car poof: fly out to (--dx,--dy), spin, fade */
	@keyframes balloon-burst {
		0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); }
		10% { opacity: 1; }
		100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(var(--rot, 220deg)); }
	}
</style>
