<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { confettiPresent } from '$lib/stores/rogueBalloon';

	// Big rogue balloons — rise roughly a screen's height, anchored to the PAGE (document
	// coordinates), not the viewport — so they scroll with the content like everything
	// else instead of floating fixed on screen. Spawn is entirely driven by the confetti
	// cloud: one every 2-15s for as long as it's on screen (confettiPresent), never on
	// any other timer. Several can be airborne at once since the spawn gap is shorter
	// than a single balloon's rise.
	// ponytail: pure CSS rise + a random-pop roll per balloon. No DOM collision — that
	// was the fragile 80%; this is the look without the rabbit hole.

	type B = { id: number; x: number; startTop: number; hue: number; duration: number };
	type Bit = { dx: number; dy: number; color: string; rot: number };

	let balloons = $state<B[]>([]);
	let bursts = $state<{ id: number; x: number; y: number; bits: Bit[] }[]>([]);
	let uid = 0;

	const POP_COLORS = ['#ff2a6d', '#ff8a00', '#ffe600', '#00f5a0', '#00d4ff', '#7b61ff', '#ff2ad4', '#ff5d8f', '#4ad3ff', '#7bff9a'];
	function makeBits(): Bit[] {
		return Array.from({ length: 14 }, () => ({
			dx: Math.random() * 108 - 54,
			dy: -(Math.random() * 54 + 6),
			color: POP_COLORS[Math.floor(Math.random() * POP_COLORS.length)],
			rot: Math.floor(Math.random() * 360)
		}));
	}

	// fraction of each balloon's own rise after which it becomes eligible for a random pop
	const POP_ELIGIBLE_AT = 0.45;
	const POP_ROLL_MS = 2000;
	const POP_CHANCE = 0.005;

	const els: Record<number, HTMLButtonElement> = {};
	const eligibleTimers: Record<number, ReturnType<typeof setTimeout>> = {};
	const rollTimers: Record<number, ReturnType<typeof setInterval>> = {};

	function clearBalloonTimers(id: number) {
		clearTimeout(eligibleTimers[id]);
		clearInterval(rollTimers[id]);
		delete eligibleTimers[id];
		delete rollTimers[id];
	}

	function spawn() {
		const duration = Math.random() * 6 + 14; // 14-20s
		// Rise from the confetti cloud's own spot, in PAGE (document) coordinates — only
		// anchor to it when it's actually on screen, otherwise a scrolled-away cloud gives
		// a wild off-screen start point.
		const cloudEl = document.querySelector('.cloud.confetti') as HTMLElement | null;
		const r = cloudEl?.getBoundingClientRect();
		const onScreen = !!r && r.bottom > 0 && r.top < window.innerHeight;
		const x = onScreen ? ((r!.left + r!.width / 2) / window.innerWidth) * 100 : Math.random() * 80 + 10;
		const startTop = onScreen
			? window.scrollY + r!.top + r!.height / 2
			: window.scrollY + window.innerHeight - 40;
		const b: B = { id: uid++, x, startTop, hue: Math.floor(Math.random() * 360), duration };
		balloons = [...balloons, b];
		eligibleTimers[b.id] = setTimeout(() => {
			rollTimers[b.id] = setInterval(() => {
				if (Math.random() < POP_CHANCE) pop(b.id);
			}, POP_ROLL_MS);
		}, duration * 1000 * POP_ELIGIBLE_AT);
	}

	function pop(id: number) {
		if (!balloons.some((b) => b.id === id)) return;
		clearBalloonTimers(id);
		const el = els[id];
		if (el) {
			const r = el.getBoundingClientRect();
			const burst = { id: uid++, x: r.left + r.width / 2, y: window.scrollY + r.top + r.height / 2, bits: makeBits() };
			bursts = [...bursts, burst];
			setTimeout(() => (bursts = bursts.filter((p) => p.id !== burst.id)), 1000);
		}
		delete els[id];
		balloons = balloons.filter((b) => b.id !== id);
	}

	// reached the very top without a random pop → pop it there anyway (no silent exit)
	function onRiseEnd(id: number) {
		pop(id);
	}

	let loopTimer: ReturnType<typeof setTimeout> | undefined;
	function scheduleSpawn() {
		loopTimer = setTimeout(() => {
			spawn();
			scheduleSpawn();
		}, Math.random() * 13000 + 2000); // 2-15s
	}
	function startLoop() {
		if (loopTimer) return; // already running
		scheduleSpawn();
	}
	function stopLoop() {
		clearTimeout(loopTimer);
		loopTimer = undefined;
		// let any already-airborne balloons finish their own rise/pop naturally
	}

	onMount(() => {
		const unsub = confettiPresent.subscribe((present) => {
			if (present) startLoop();
			else stopLoop();
		});
		return unsub;
	});

	onDestroy(() => {
		stopLoop();
		for (const id of Object.keys(eligibleTimers).map(Number)) clearBalloonTimers(id);
	});
</script>

{#each balloons as b (b.id)}
	<button
		bind:this={els[b.id]}
		type="button"
		class="balloon"
		style="left: {b.x}vw; --hue: {b.hue}; --dur: {b.duration}s; --start-top: {b.startTop}px;"
		onclick={() => pop(b.id)}
		onanimationend={() => onRiseEnd(b.id)}
		aria-label="Ballon"
	>
		<span class="balloon-shape">
			<span class="knot"></span>
			<span class="string"></span>
		</span>
	</button>
{/each}

{#each bursts as burst (burst.id)}
	<span class="balloon-pop" style="left: {burst.x}px; top: {burst.y}px;" aria-hidden="true">
		{#each burst.bits as b, i (i)}
			<span class="bp" style="background: {b.color}; --dx: {b.dx}px; --dy: {b.dy}px; --rot: {b.rot}deg;"></span>
		{/each}
	</span>
{/each}

<style>
	.balloon {
		position: absolute; /* document-relative — scrolls with the page, not viewport-fixed */
		top: var(--start-top, 0px); /* starts at the confetti cloud's own spot */
		width: 29px; /* bigger invisible hit target than the drawn balloon (13px) — easier to pop */
		height: 32px;
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
		transform: translateX(-50%);
		/* Constant, not animated — the balloon is document-anchored (a root-level sibling
		   of .main-content), so its z-index is compared against .main-content's OWN
		   z-index (2) at the page's root stacking context, not against anything inside
		   it. A step part-way through the rise meant it spent the first 40% behind the
		   ENTIRE page (not just the confetti cloud sprite it was meant to hide behind),
		   then popped abruptly in front — exactly the clipping/flicker near the bottom
		   houses/footer that was reported. Always in front reads fine: a rising balloon
		   in front of the town scene is the natural look anyway. */
		z-index: 46;
		pointer-events: auto;
		/* rise animates `top`; sway animates `transform` — different properties so they
		   don't fight (same trick the drone uses for fly vs wobble). */
		animation:
			balloon-rise var(--dur, 16s) linear forwards,
			balloon-sway 3.2s ease-in-out infinite;
	}
	/* the actual drawn balloon — centred inside the larger invisible hit target above */
	.balloon-shape {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 13px;
		height: 16px;
		transform: translate(-50%, -50%);
		border-radius: 50% 50% 48% 48%;
		background: radial-gradient(circle at 35% 28%, hsl(var(--hue), 90%, 80%), hsl(var(--hue), 75%, 52%) 76%);
		box-shadow: inset -3px -4px 6px hsla(var(--hue), 70%, 30%, 0.35);
		filter: brightness(0.88); /* night — a touch darker */
	}
	/* little pinched knot + string under the balloon */
	.balloon-shape .knot {
		position: absolute;
		left: 50%;
		bottom: -1.5px;
		width: 2.5px;
		height: 2.5px;
		transform: translateX(-50%);
		background: hsl(var(--hue), 75%, 46%);
		border-radius: 0 0 1.5px 1.5px;
	}
	.balloon-shape .string {
		position: absolute;
		left: 50%;
		top: 100%;
		width: 1px;
		height: 11px;
		transform: translateX(-50%);
		background: hsla(var(--hue), 40%, 40%, 0.6);
	}

	/* rise roughly one screen's height above its spawn point */
	@keyframes balloon-rise {
		0% { top: var(--start-top, 0px); opacity: 0; }
		6% { opacity: 1; }
		100% { top: calc(var(--start-top, 0px) - 100vh); opacity: 1; }
	}
	/* gentle horizontal drift; keeps the -50% centering in every keyframe */
	@keyframes balloon-sway {
		0%, 100% { transform: translateX(calc(-50% - 10px)); }
		50% { transform: translateX(calc(-50% + 10px)); }
	}

	/* confetti explosion where the balloon popped (same look as the confetti cloud) */
	.balloon-pop { position: absolute; width: 0; height: 0; z-index: 47; pointer-events: none; }
	.balloon-pop .bp {
		position: absolute;
		left: 0;
		top: 0;
		width: 7px;
		height: 9px;
		opacity: 0;
		animation: balloon-burst 0.9s ease-out forwards;
	}
	@keyframes balloon-burst {
		0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); }
		10% { opacity: 1; }
		100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(var(--rot, 220deg)); }
	}

	@media (prefers-reduced-motion: reduce) {
		.balloon { animation: balloon-rise var(--dur, 16s) linear forwards; }
	}
</style>
