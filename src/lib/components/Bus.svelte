<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let duration = $state(16);

	onMount(() => {
		// Random initial delay between 20-40 seconds (less frequent than cars)
		const initialDelay = Math.random() * 20000 + 20000;

		const startDrive = () => {
			// Set random values for this drive
			direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
			duration = Math.random() * 6 + 14; // 14-20 seconds (slower than cars)

			visible = true;

			// Hide after animation completes
			setTimeout(() => {
				visible = false;
			}, duration * 1000 + 200);
		};

		// First drive after random delay
		setTimeout(() => {
			startDrive();

			// Schedule next drives every 60-180 seconds (less frequent than cars)
			const scheduleNext = () => {
				const nextInterval = Math.random() * 120000 + 60000;
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
		class="bus-container {direction}"
		style="--duration: {duration}s;"
	>
		<img
			src="/svg/eastereggs/vehicles/bus.svg"
			alt=""
			class="bus"
			aria-hidden="true"
			draggable="false"
		/>
	</div>
{/if}

<style>
	.bus-container {
		position: absolute;
		bottom: 6px;
		z-index: 2;
		pointer-events: none;
	}

	/* Left to right drive */
	.bus-container.ltr {
		left: 0;
		animation: drive-ltr var(--duration, 16s) linear forwards;
	}

	/* Right to left drive */
	.bus-container.rtl {
		right: 0;
		left: auto;
		animation: drive-rtl var(--duration, 16s) linear forwards;
	}

	.bus-container.ltr .bus {
		transform: scaleX(-1);
	}

	.bus {
		width: 180px;
		height: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	@keyframes drive-ltr {
		0% {
			transform: translateX(-200px);
		}
		100% {
			transform: translateX(calc(100vw + 200px));
		}
	}

	@keyframes drive-rtl {
		0% {
			transform: translateX(200px);
		}
		100% {
			transform: translateX(calc(-100vw - 200px));
		}
	}
</style>
