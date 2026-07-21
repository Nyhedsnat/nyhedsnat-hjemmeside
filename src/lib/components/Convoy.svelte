<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';
	import { snowFreeze } from '$lib/stores/snow';
	import { trafficMode, trafficPulse } from '$lib/stores/traffic';
	import VehicleSprite from '$lib/components/VehicleSprite.svelte';

	// `preview` renders a single stationary, clickable convoy car in a card
	// (for /animation-test) instead of the live driving convoy.
	let { preview = false }: { preview?: boolean } = $props();

	// Available car types for the convoy
	const carTypes = [
		'/svg/eastereggs/vehicles/car-1.svg',
		'/svg/eastereggs/vehicles/car-2.svg',
		'/svg/eastereggs/vehicles/car-3.svg',
		'/svg/eastereggs/vehicles/car-4.svg',
		'/svg/eastereggs/vehicles/car-5.svg'
	];

	const carCount = 10;
	const gap = 40;

	let visible = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let duration = $state(20);
	let convoyCars = $state<string[]>([]);
	let dancing = $state<Record<number, boolean>>({});
	let el = $state<HTMLDivElement>(); // the driving row — its own CSS drive-animation is what weather rate-controls
	let bouncing = $state(false); // confetti: same celebratory hop as the live traffic

	// ---- weather reactions (same stores the live traffic reacts to) ----
	let sustainedRate = 1; // last trafficMode rate (rain/fog/autumn crawl), 1 = normal
	let snowHalted = false; // full stop while the snowstorm owns the road
	let rateGen = 0;

	function convoyAnim(): Animation | undefined {
		return el?.getAnimations()[0];
	}

	// Ease the row's own drive-animation to the target rate (mirrors Vehicles' rampDriveRates,
	// just for the one animation instead of a fleet).
	function rampConvoyRate(target: number, ms: number) {
		const anim = convoyAnim();
		if (!anim) return;
		const gen = ++rateGen;
		const start = anim.playbackRate;
		const t0 = performance.now();
		const STEP_MS = 40;
		const tick = () => {
			if (gen !== rateGen) return;
			const p = Math.min(1, (performance.now() - t0) / ms);
			const e = (1 - Math.cos(p * Math.PI)) / 2; // easeInOut
			try {
				anim.playbackRate = start + (target - start) * e;
			} catch {
				return; // convoy gone
			}
			if (p < 1) setTimeout(tick, STEP_MS);
		};
		tick();
	}

	function applyConvoyRate(ms = 1200) {
		rampConvoyRate(snowHalted ? 0 : sustainedRate, ms);
	}

	// Click a convoy car → it dances to the beat (and its RGB underglow flares).
	function dance(i: number) {
		dancing = { ...dancing, [i]: true };
		setTimeout(() => {
			const next = { ...dancing };
			delete next[i];
			dancing = next;
		}, 900);
	}

	// Generate a random mix of cars
	function generateConvoyMix(): string[] {
		return Array(carCount).fill(null).map(() =>
			carTypes[Math.floor(Math.random() * carTypes.length)]
		);
	}

	const startConvoy = (dir: 'ltr' | 'rtl') => {
		if (visible) return; // Don't start if already running

		direction = dir; // always match the clicked nyhedsnat car's direction
		duration = Math.random() * 5 + 18; // 18-23 seconds
		convoyCars = generateConvoyMix();

		visible = true;

		// Hide after animation completes
		setTimeout(() => {
			visible = false;
		}, duration * 1000 + 200);
	};

	// Row just mounted (a convoy started) → pick up whatever weather is already active
	// instead of starting at full speed and snapping to the right rate a tick later.
	$effect(() => {
		if (el) applyConvoyRate(0);
	});

	onMount(() => {
		if (preview) return; // static demo card — no live driving convoy

		// Listen for manual trigger from car click (the value is the travel direction)
		const unsubscribe = triggerConvoy.subscribe((dir) => {
			if (dir) {
				startConvoy(dir);
				triggerConvoy.set(null);
			}
		});

		const unsubSnow = snowFreeze.subscribe((on) => {
			snowHalted = on;
			applyConvoyRate(on ? 1800 : 1100); // same grace/ease feel as the live traffic halt/thaw
		});

		const unsubMode = trafficMode.subscribe((m) => {
			sustainedRate = m ? m.rate : 1;
			applyConvoyRate(m ? 1200 : 1000);
		});

		const unsubPulse = trafficPulse.subscribe((p) => {
			if (!p) return;
			if (p.kind === 'bounce') {
				bouncing = true; // confetti: same celebratory hop as the live traffic
				setTimeout(() => (bouncing = false), 650);
			} else if (p.kind === 'flinch') {
				// thunder: startled beat — brake hard, then ease back to whatever rate was current
				rampConvoyRate(0, 120);
				setTimeout(() => applyConvoyRate(500), 300);
			}
			trafficPulse.set(null); // consume
		});

		return () => {
			unsubscribe();
			unsubSnow();
			unsubMode();
			unsubPulse();
		};
	});
</script>

{#if preview}
	<div class="convoy-preview">
		<div class="convoy-preview-stage">
			<div class="convoy-car-wrap" style="--i: 0;">
				<button
					type="button"
					class="convoy-car-btn"
					class:dance={dancing[0]}
					onclick={() => dance(0)}
					aria-label="Konvoj-bil"
				>
					<VehicleSprite src="/svg/eastereggs/vehicles/car-4.svg" size="car" />
				</button>
			</div>
		</div>
		<span class="convoy-preview-label">
			<strong>konvoj-bil</strong>
			<span class="convoy-preview-effect">Danser til musikken</span>
		</span>
	</div>
{:else if visible}
	<div
		bind:this={el}
		class="convoy-container {direction}"
		style="--duration: {duration}s;"
	>
		{#each convoyCars as carSrc, i}
			<div class="convoy-car-wrap" style="--i: {i};">
				<button
					type="button"
					class="convoy-car-btn"
					class:dance={dancing[i]}
					class:bounce={bouncing}
					onclick={() => dance(i)}
					aria-label="Konvoj-bil"
				>
					<VehicleSprite src={carSrc} size="car" direction={direction} />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	/* Preview card for /animation-test — matches the Vehicles grid stage look. */
	.convoy-preview {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		max-width: 264px;
	}
	.convoy-preview-stage {
		position: relative;
		height: 190px;
		border-radius: 14px;
		overflow: hidden;
		background: radial-gradient(120% 90% at 50% 125%, #1a2747 0%, #0c1426 58%, #080d1a 100%);
		border: 1px solid rgba(212, 175, 55, 0.18);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	.convoy-preview-stage:hover {
		border-color: rgba(212, 175, 55, 0.45);
	}
	.convoy-preview-stage::after {
		content: '';
		position: absolute;
		left: 8%;
		right: 8%;
		bottom: 24px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
	}
	.convoy-preview .convoy-car-wrap {
		margin-bottom: 30px;
	}
	.convoy-preview-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		text-align: center;
		line-height: 1.3;
	}
	.convoy-preview-label strong {
		font-family: monospace;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.85);
	}
	.convoy-preview-effect {
		font-size: 12px;
		color: rgba(212, 175, 55, 0.85);
	}

	.convoy-container {
		position: absolute;
		bottom: 10px;
		z-index: 2;
		pointer-events: none;
		display: flex;
		align-items: flex-end;
		gap: 40px;
		/* Size to the full row, not the clamped viewport, so the drive keyframes'
		   translateX(-100%/100%) = the convoy's true width and it starts fully
		   off-screen (otherwise the trailing cars sit on-screen and "pop in"). */
		width: max-content;
	}

	/* Left to right drive */
	.convoy-container.ltr {
		left: 0;
		animation: drive-ltr var(--duration, 20s) linear forwards;
	}

	/* Right to left drive */
	.convoy-container.rtl {
		right: 0;
		left: auto;
		flex-direction: row-reverse;
		animation: drive-rtl var(--duration, 20s) linear forwards;
	}

	.convoy-car-wrap {
		position: relative;
		display: flex;
		align-items: flex-end;
		height: 45px;
		overflow: visible;
		/* The 10-car row is wider than the viewport; without this the flex items
		   shrink horizontally and the cars render narrower (smaller) than normal
		   traffic. Keep each car at its natural size and let the row overflow. */
		flex-shrink: 0;
	}

	/* RGB underglow — strictly under the car body, never the headlight beam.
	   The SVGs put the headlight/beam on the front (left when unflipped). Across
	   all convoy car types the solid body overlaps only within ~65–83% of the box,
	   so the strip lives there (centre 74%); ltr cars are flipped → mirror to 26%. */
	.convoy-car-btn::after {
		content: '';
		position: absolute;
		left: 74%;
		bottom: 2px;
		transform: translateX(-50%);
		width: 18%;
		height: 5px;
		border-radius: 999px;
		background: linear-gradient(90deg, #ff2a6d, #ff8a00, #ffe600, #00f5a0, #00d4ff, #7b61ff, #ff2ad4);
		background-size: 250% 100%;
		filter: blur(3px);
		opacity: 0.35;
		z-index: 1;
		animation: rgb-shift 1.2s linear infinite, underglow-flicker 0.35s steps(2, end) infinite;
		animation-delay: calc(var(--i) * -0.07s);
	}

	/* ltr cars are mirrored, so their body sits on the left → mirror 74% to 26% */
	.convoy-container.ltr .convoy-car-btn::after {
		left: 26%;
	}

	.convoy-car-btn {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		position: relative;
		display: block;
		pointer-events: auto;
		cursor: pointer;
		transform-origin: 50% 100%; /* rock on the wheels */
	}

	.convoy-car-btn.dance {
		animation: convoy-dance 0.85s ease-in-out;
	}

	/* The RGB underglow flares brighter & faster while the car dances. */
	.convoy-car-btn.dance::after {
		filter: blur(4px) brightness(1.7) saturate(1.2);
		animation: rgb-shift 0.4s linear infinite, underglow-flicker 0.18s steps(2, end) infinite;
	}

	/* confetti: every convoy car gets the same celebratory hop as the live traffic */
	.convoy-car-btn.bounce {
		animation: convoy-bounce 0.6s ease-out;
	}
	@keyframes convoy-bounce {
		0%, 100% { transform: translateY(0) scaleY(1); }
		20% { transform: translateY(0) scaleY(0.85); }
		45% { transform: translateY(-14px) scaleY(1.08); }
		70% { transform: translateY(0) scaleY(0.92); }
		85% { transform: translateY(-4px) scaleY(1); }
	}

	/* Click easter egg: the car dances — rocks side to side to the beat with a bob. */
	@keyframes convoy-dance {
		0%   { transform: rotate(0deg)   translateY(0); }
		14%  { transform: rotate(-10deg) translateY(-3px); }
		32%  { transform: rotate(9deg)   translateY(-1px); }
		50%  { transform: rotate(-8deg)  translateY(-3px); }
		68%  { transform: rotate(6deg)   translateY(-1px); }
		84%  { transform: rotate(-3deg)  translateY(0); }
		100% { transform: rotate(0deg)   translateY(0); }
	}

	@keyframes rgb-shift {
		0% { background-position: 0% 50%; }
		100% { background-position: 250% 50%; }
	}

	@keyframes underglow-flicker {
		0%, 100% { opacity: 0.55; }
		50% { opacity: 0.95; }
	}

	/* Start fully off-screen at a FIXED px offset — not -100%/100% of the row's own
	   width. A self-referential % needs the browser to have already computed this
	   element's layout (width: max-content) before the very first animation frame;
	   when that race is lost the row starts at 0 and the convoy pops in mid-screen,
	   half-cut. 2600px comfortably clears the widest possible 10-car row + gaps, so
	   it always starts off-frame and drives in like normal traffic. */
	@keyframes drive-ltr {
		0% {
			transform: translateX(-2600px);
		}
		100% {
			transform: translateX(calc(100vw + 2600px));
		}
	}

	@keyframes drive-rtl {
		0% {
			transform: translateX(2600px);
		}
		100% {
			transform: translateX(calc(-100vw - 2600px));
		}
	}
</style>
