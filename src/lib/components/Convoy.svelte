<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';

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

	const carHeight = 45; // Match the SIZE.car from Vehicles
	const carCount = 10;
	const gap = 40;

	let visible = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let duration = $state(20);
	let convoyCars = $state<string[]>([]);
	let dancing = $state<Record<number, boolean>>({});

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

	onMount(() => {
		if (preview) return; // static demo card — no live driving convoy

		// Listen for manual trigger from car click (the value is the travel direction)
		const unsubscribe = triggerConvoy.subscribe((dir) => {
			if (dir) {
				startConvoy(dir);
				triggerConvoy.set(null);
			}
		});

		return unsubscribe;
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
					<img src="/svg/eastereggs/vehicles/car-4.svg" alt="" class="convoy-car" draggable="false" />
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
		class="convoy-container {direction}"
		style="--duration: {duration}s;"
	>
		{#each convoyCars as carSrc, i}
			<div class="convoy-car-wrap" style="--i: {i};">
				<button
					type="button"
					class="convoy-car-btn"
					class:dance={dancing[i]}
					onclick={() => dance(i)}
					aria-label="Konvoj-bil"
				>
					<img src={carSrc} alt="" class="convoy-car" draggable="false" />
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

	.convoy-container.ltr .convoy-car {
		transform: scaleX(-1);
	}

	.convoy-car-wrap {
		position: relative;
		display: flex;
		align-items: flex-end;
		height: 45px;
		overflow: visible;
	}

	.convoy-car-wrap::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 1px;
		transform: translateX(-50%);
		width: 38%;
		height: 5px;
		border-radius: 999px;
		background: linear-gradient(90deg, #ff2a6d, #ff8a00, #ffe600, #00f5a0, #00d4ff, #7b61ff, #ff2ad4);
		background-size: 250% 100%;
		filter: blur(3px);
		opacity: 0.3;
		z-index: 1;
		animation: rgb-shift 1.2s linear infinite, underglow-flicker 0.35s steps(2, end) infinite;
		animation-delay: calc(var(--i) * -0.07s);
	}

	.convoy-container.ltr .convoy-car-wrap::after {
		transform: translateX(-120%);
	}

	.convoy-container.rtl .convoy-car-wrap::after {
		transform: translateX(20%);
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
	.convoy-car-wrap:has(.convoy-car-btn.dance)::after {
		filter: blur(4px) brightness(1.7) saturate(1.2);
		animation: rgb-shift 0.4s linear infinite, underglow-flicker 0.18s steps(2, end) infinite;
	}

	.convoy-car {
		height: 45px;
		width: auto;
		display: block;
		position: relative;
		z-index: 2;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
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

	/* Start with the convoy's leading edge exactly at the viewport edge (-100% =
	   the convoy's own width) so the first car enters the frame immediately on
	   click instead of after a 1-2s off-screen run-up. */
	@keyframes drive-ltr {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(calc(100vw + 100%));
		}
	}

	@keyframes drive-rtl {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(calc(-100vw - 100%));
		}
	}
</style>
