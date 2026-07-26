<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { trafficPulse, trafficMode } from '$lib/stores/traffic';
	import { confettiPresent } from '$lib/stores/rogueBalloon';
	import type { CloudProps } from '$lib/clouds';

	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	// The big rogue balloon (Balloon.svelte) only spawns while this cloud is on screen.
	onMount(() => {
		confettiPresent.set(true);
		return () => confettiPresent.set(false);
	});
	onDestroy(() => {
		stopCarWatch();
		trafficMode.set(null); // never leave party mode stuck on if the cloud unmounts mid-storm
	});

	let active = $state(false);
	let confetti = $state(false); // true while still spawning new confetti
	let confettiPieces = $state<{ id: number; x: number; c: number; d: number; rot: number; mdx: number }[]>([]);
	let streamers = $state<{ id: number; x: number }[]>([]);
	let balloons = $state<{ id: number; x: number; hue: number }[]>([]);
	// bursts from popped balloons — each with a random scatter of coloured bits
	let pops = $state<{ id: number; x: number; y: number; bits: { dx: number; dy: number; color: string; rot: number }[] }[]>([]);
	// deflated balloon left on the road after a pop — squashed once a car drives over it
	let debris = $state<{ id: number; x: number; squashed: boolean }[]>([]);
	let squeaks = $state<{ id: number; x: number }[]>([]);

	const balloonEls: Record<number, HTMLButtonElement> = {};
	const bounced = new Set<number>(); // balloons already nudged by a car — only once per rise
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

	// Confetti magnet: nyhedsnat/convoy cars (the only ones with the underglow decoration)
	// pull nearby falling confetti toward them a little — read the DOM directly (same
	// trick the UFO beam and thunder bolt use to find cars from a cloud component)
	// rather than plumbing car positions through a new store for one cosmetic nudge.
	const MAGNET_RADIUS_PX = 160;
	const MAGNET_MAX_PX = 60;
	function magnetDx(pieceXVw: number): number {
		if (typeof window === 'undefined') return 0;
		const iw = window.innerWidth;
		const pieceX = (pieceXVw / 100) * iw;
		const cars = document.querySelectorAll<HTMLElement>('.underglow');
		let best = 0;
		let bestDist = MAGNET_RADIUS_PX;
		for (const glow of cars) {
			const car = glow.closest('.vehicle-container') as HTMLElement | null;
			if (!car) continue;
			const r = car.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			const dist = Math.abs(cx - pieceX);
			if (dist < bestDist) {
				bestDist = dist;
				best = cx - pieceX;
			}
		}
		if (best === 0) return 0;
		return Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, best * 0.5));
	}

	// Each piece falls ONCE and self-removes, so when spawning stops the airborne pieces
	// keep falling and clear the sky naturally instead of all vanishing at once.
	function spawnConfettiTick() {
		if (!confetti) return;
		for (let k = 0; k < 3; k++) {
			const x = Math.random() * 100;
			const p = {
				id: uid++,
				x,
				c: Math.floor(Math.random() * 5),
				d: Math.random() * 1.8 + 2.6,
				rot: Math.random() * 720 - 360,
				mdx: magnetDx(x)
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
		trafficMode.set({ rate: 1, confetti: true }); // party mode: trail/conga/costume/cheer/click-puff
		startCarWatch();
		spawnConfettiTick();
		confettiTimer = setInterval(spawnConfettiTick, 120);
		// stop spawning, keep parked until the last airborne piece + streamer has landed
		setTimeout(() => {
			confetti = false;
			clearInterval(confettiTimer);
			// balloons keep rising to the top and self-remove on animationend (below)
			setTimeout(() => {
				active = false;
				trafficMode.set(null);
			}, 4800);
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
		const b = balloons.find((bb) => bb.id === id);
		if (b) {
			const d = { id: uid++, x: b.x, squashed: false };
			debris = [...debris, d];
			startCarWatch();
			// never run over → clears itself so the road doesn't collect debris forever
			setTimeout(() => (debris = debris.filter((q) => q.id !== d.id)), 6000);
		}
		balloons = balloons.filter((bb) => bb.id !== id);
		bounced.delete(id);
	}

	// Shared watch: balloons still rising get nudged sideways by a car passing directly
	// under them; debris on the road gets squashed by the next car through. Same DOM-read
	// technique as the magnet check above — no store plumbing for a proximity check this
	// local. Runs only while there's something on screen for it to check.
	let carWatchRAF: number | null = null;
	function startCarWatch() {
		if (carWatchRAF != null) return;
		const tick = () => {
			const cars = document.querySelectorAll<HTMLElement>('.vehicle-container');
			for (const b of balloons) {
				if (bounced.has(b.id)) continue;
				const el = balloonEls[b.id];
				if (!el) continue;
				const br = el.getBoundingClientRect();
				for (const carEl of cars) {
					const cr = carEl.getBoundingClientRect();
					if (cr.bottom < br.top || cr.top > br.bottom) continue;
					const carCx = cr.left + cr.width / 2;
					const balloonCx = br.left + br.width / 2;
					if (Math.abs(carCx - balloonCx) < 24) {
						bounced.add(b.id);
						nudgeBalloon(b.id, carCx < balloonCx ? 1 : -1);
						break;
					}
				}
			}
			for (const d of debris) {
				if (d.squashed) continue;
				const iw = window.innerWidth;
				const dx = (d.x / 100) * iw;
				for (const carEl of cars) {
					const cr = carEl.getBoundingClientRect();
					if (Math.abs(cr.left + cr.width / 2 - dx) < 22) {
						squashDebris(d.id);
						break;
					}
				}
			}
			if (balloons.length || debris.length) carWatchRAF = requestAnimationFrame(tick);
			else carWatchRAF = null;
		};
		carWatchRAF = requestAnimationFrame(tick);
	}
	function stopCarWatch() {
		if (carWatchRAF != null) cancelAnimationFrame(carWatchRAF);
		carWatchRAF = null;
	}

	// A rising balloon gets bumped sideways by a car passing directly under it — a
	// one-shot WAAPI nudge LAYERED on top of the running CSS rise (composite:'add'),
	// same trick SnowCrash's pushForward uses for the pile-up bump, so it doesn't
	// fight or reset the balloon's own keyframe animation.
	function nudgeBalloon(id: number, dir: 1 | -1) {
		const el = balloonEls[id];
		if (!el) return;
		el.animate(
			[
				{ transform: 'translateX(0px)' },
				{ transform: `translateX(${dir * 22}px)`, offset: 0.4 },
				{ transform: 'translateX(0px)' }
			],
			{ duration: 500, easing: 'ease-out', composite: 'add' }
		);
	}

	// Debris squashed by a passing car: quick squish + a little squeak, then gone.
	function squashDebris(id: number) {
		debris = debris.map((d) => (d.id === id ? { ...d, squashed: true } : d));
		const d = debris.find((q) => q.id === id);
		if (d) {
			const sq = { id: uid++, x: d.x };
			squeaks = [...squeaks, sq];
			setTimeout(() => (squeaks = squeaks.filter((q) => q.id !== sq.id)), 700);
		}
		setTimeout(() => (debris = debris.filter((q) => q.id !== id)), 400);
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
			<span class="conf c{p.c}" class:magnetized={p.mdx !== 0} style="left: {p.x}vw; --d: {p.d}s; --rot: {p.rot}deg; --mdx: {p.mdx}px;"></span>
		{/each}
		{#each streamers as s (s.id)}
			<span class="streamer" style="left: {s.x}vw;"></span>
		{/each}
	</div>
{/if}
{#each balloons as b (b.id)}
	<button bind:this={balloonEls[b.id]} type="button" class="balloon" style="left: {b.x}vw; --hue: {b.hue};" onclick={(e) => popBalloon(b.id, e)} onanimationend={(e) => popBalloon(b.id, e)} aria-label="Ballon">
		<span class="balloon-shape">
			<span class="knot"></span>
		</span>
	</button>
{/each}
{#each pops as p (p.id)}
	<span class="balloon-pop" style="left: {p.x}px; top: {p.y}px;" aria-hidden="true">
		{#each p.bits as b, i (i)}
			<span class="bp" style="background: {b.color}; --dx: {b.dx}px; --dy: {b.dy}px; --rot: {b.rot}deg;"></span>
		{/each}
	</span>
{/each}
{#each debris as d (d.id)}
	<span class="balloon-debris" class:squashed={d.squashed} style="left: {d.x}vw;" aria-hidden="true"></span>
{/each}
{#each squeaks as s (s.id)}
	<span class="debris-squeak" style="left: {s.x}vw;" aria-hidden="true">💨</span>
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
	/* confetti magnet: a piece spawned near a nyhedsnat/convoy car drifts toward it
	   on the way down instead of falling straight — same fall, biased horizontal end */
	.conf.magnetized { animation-name: conf-fall-magnet; }
	@keyframes conf-fall-magnet {
		0% { transform: translate(0, 0) rotate(var(--rot)); opacity: 0; }
		10% { opacity: 1; }
		85% { opacity: 1; }
		100% { transform: translate(var(--mdx), 320px) rotate(calc(var(--rot) + 720deg)); opacity: 0; }
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
		width: 29px; /* bigger invisible hit target than the drawn balloon (13px) — matches Balloon.svelte's rogue balloons */
		height: 32px;
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
		transform: translateX(-50%);
		z-index: 5;
		pointer-events: auto;
		animation: balloon-rise 12s ease-in forwards;
	}
	.balloon-shape {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 13px;
		height: 16px;
		transform: translate(-50%, -50%);
		border-radius: 50% 50% 48% 48%;
		background: radial-gradient(circle at 35% 30%, hsl(var(--hue), 90%, 78%), hsl(var(--hue), 75%, 55%) 75%);
		filter: brightness(0.88); /* night — a touch darker */
	}
	.balloon-shape .knot { position: absolute; left: 50%; bottom: -2px; width: 2px; height: 2px; transform: translateX(-50%); background: hsl(var(--hue), 75%, 50%); border-radius: 0 0 1px 1px; }
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

	/* deflated balloon left on the road after a pop — squashed by the next car through */
	.balloon-debris {
		position: absolute;
		bottom: 9px;
		width: 11px;
		height: 7px;
		transform: translateX(-50%);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.35), rgba(0, 0, 0, 0.15) 80%);
		opacity: 0.85;
		z-index: 1;
		transition: transform 0.2s ease-out, opacity 0.2s ease-out;
	}
	.balloon-debris.squashed {
		transform: translateX(-50%) scaleY(0.15) scaleX(1.5);
		opacity: 0;
	}
	.debris-squeak {
		position: absolute;
		bottom: 16px;
		transform: translateX(-50%);
		font-size: 13px;
		line-height: 1;
		z-index: 4;
		pointer-events: none;
		animation: squeak-pop 0.7s ease-out forwards;
	}
	@keyframes squeak-pop {
		0% { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.5); }
		25% { opacity: 1; transform: translateX(-50%) translateY(-2px) scale(1.1); }
		100% { opacity: 0; transform: translateX(-50%) translateY(-14px) scale(0.9); }
	}
</style>
