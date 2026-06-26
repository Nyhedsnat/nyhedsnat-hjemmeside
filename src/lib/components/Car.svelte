<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';

	let visible = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let duration = $state(12);

	function handleClick() {
		triggerConvoy.set(direction);
	}

	onMount(() => {
		// Random initial delay between 5-20 seconds
		const initialDelay = Math.random() * 15000 + 5000;

		const startDrive = () => {
			// Set random values for this drive
			direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
			duration = Math.random() * 8 + 8; // 8-16 seconds

			visible = true;

			// Hide after animation completes
			setTimeout(() => {
				visible = false;
			}, duration * 1000 + 200);
		};

		// First drive after random delay
		setTimeout(() => {
			startDrive();

			// Schedule next drives every 30-90 seconds (random interval)
			const scheduleNext = () => {
				const nextInterval = Math.random() * 60000 + 30000;
				setTimeout(() => {
					startDrive();
					scheduleNext();
				}, nextInterval);
			};
			scheduleNext();
		}, initialDelay);
	});
</script>

{#if visible}
	<div
		class="car-container {direction}"
		style="--duration: {duration}s;"
	>
		<button class="car-button" onclick={handleClick} aria-label="Spawn convoy">
			<img
				src="/svg/car-1.svg"
				alt=""
				class="car"
			/>
		</button>
	</div>
{/if}

<style>
	.car-container {
		position: absolute;
		bottom: 10px;
		z-index: 2;
	}

	.car-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	/* Left to right drive */
	.car-container.ltr {
		left: 0;
		animation: drive-ltr var(--duration, 12s) linear forwards;
	}

	/* Right to left drive */
	.car-container.rtl {
		right: 0;
		left: auto;
		animation: drive-rtl var(--duration, 12s) linear forwards;
	}

	.car-container.ltr .car {
		transform: scaleX(-1);
	}

	.car {
		width: 120px;
		height: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
	}

	@keyframes drive-ltr {
		0% {
			transform: translateX(-140px);
		}
		100% {
			transform: translateX(calc(100vw + 140px));
		}
	}

	@keyframes drive-rtl {
		0% {
			transform: translateX(140px);
		}
		100% {
			transform: translateX(calc(-100vw - 140px));
		}
	}
</style>
