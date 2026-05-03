<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';

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

	// Generate a random mix of cars
	function generateConvoyMix(): string[] {
		return Array(carCount).fill(null).map(() =>
			carTypes[Math.floor(Math.random() * carTypes.length)]
		);
	}

	const startConvoy = () => {
		if (visible) return; // Don't start if already running

		direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
		duration = Math.random() * 5 + 18; // 18-23 seconds
		convoyCars = generateConvoyMix();

		visible = true;

		// Hide after animation completes
		setTimeout(() => {
			visible = false;
		}, duration * 1000 + 200);
	};

	onMount(() => {
		// Listen for manual trigger from car click
		const unsubscribe = triggerConvoy.subscribe((triggered) => {
			if (triggered) {
				startConvoy();
				triggerConvoy.set(false);
			}
		});

		// Convoy interval: 0-5 minutes (can happen from start)
		const scheduleNext = () => {
			const nextInterval = Math.random() * 300000; // 0-5 minutes
			setTimeout(() => {
				startConvoy();
				scheduleNext();
			}, nextInterval);
		};
		scheduleNext();

		return unsubscribe;
	});
</script>

{#if visible}
	<div
		class="convoy-container {direction}"
		style="--duration: {duration}s;"
	>
		{#each convoyCars as carSrc}
			<img
				src={carSrc}
				alt=""
				class="convoy-car"
				aria-hidden="true"
				draggable="false"
			/>
		{/each}
	</div>
{/if}

<style>
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

	.convoy-car {
		height: 45px;
		width: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	/* Offset needs to hide full convoy: 10 cars × ~100px + 9 gaps × 40px ≈ 1400px */
	@keyframes drive-ltr {
		0% {
			transform: translateX(-2000px);
		}
		100% {
			transform: translateX(calc(100vw + 200px));
		}
	}

	@keyframes drive-rtl {
		0% {
			transform: translateX(2000px);
		}
		100% {
			transform: translateX(calc(-100vw - 200px));
		}
	}
</style>
