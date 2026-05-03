<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let startY = $state(20);
	let duration = $state(8);
	let scared = $state(false);
	let scaredX = $state(0);
	let scaredY = $state(0);
	let hideTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		// Random initial delay between 3-15 seconds
		const initialDelay = Math.random() * 12000 + 3000;

		const startFlight = () => {
			// Set random values for this flight
			startY = Math.random() * 35 + 10; // 10-45% from top
			direction = Math.random() > 0.5 ? 'ltr' : 'rtl'; // 50/50 chance
			duration = Math.random() * 7 + 2; // 2-9 seconds (25% to 100% of max speed)
			scared = false;

			visible = true;

			// Hide after animation completes
			if (hideTimeout) clearTimeout(hideTimeout);
			hideTimeout = setTimeout(() => {
				visible = false;
			}, duration * 1000 + 200);
		};

		// First flight after random delay
		setTimeout(() => {
			startFlight();

			// Schedule next flights every 2 minutes
			setInterval(() => {
				startFlight();
			}, 120000);
		}, initialDelay);
	});

	function handleDroneClick(e: MouseEvent) {
		if (!visible || scared) return;
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
		scaredX = e.clientX;
		scaredY = e.clientY;
		scared = true;

		setTimeout(() => {
			visible = false;
			scared = false;
		}, 3400);
	}
</script>

{#if visible}
	<div
		class="drone-container {direction}"
		class:scared={scared}
		style="--start-y: {startY}%; --duration: {duration}s; --scared-x: {scaredX}px; --scared-y: {scaredY}px;"
	>
		<button
			class="drone-hit"
			onclick={handleDroneClick}
			onpointerdown={(e) => handleDroneClick(e as unknown as MouseEvent)}
			aria-label="Scare drone"
		>
		<svg
			class="drone"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			viewBox="0 0 244.67 72.8"
		>
			<defs>
				<style>
					.drone-cls-1 { fill: #2a364a; opacity: 0.75; }
					.drone-cls-2 { fill: #0b0f17; opacity: 0.95; }
					.drone-cls-3 { fill: #0b0f17; opacity: 0.65; }
					.drone-cls-4 { fill: #0b0f17; opacity: 0.55; }
					.drone-cls-5 { fill: #2bff6a; opacity: 0.25; }
					.drone-cls-6 { fill: #121a26; opacity: 0.85; }
					.drone-cls-7 { fill: #2bff6a; opacity: 0.22; }
					.drone-cls-8 { fill: #cfd6df; opacity: 0.85; }
					.drone-cls-9 { fill: #b7c0cc; opacity: 0.75; }
					.drone-cls-10 { fill: none; opacity: 0.28; stroke: #0b0f17; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.2px; }
					.drone-cls-11 { fill: #ff2a2a; opacity: 0.22; }
					.drone-cls-12 { fill: #ff2a2a; opacity: 0.25; }
					.drone-cls-13 { fill: #1a2230; opacity: 0.95; }
					.drone-cls-14 { fill: #0b0f17; }
					.drone-cls-15 { fill: url(#drone-gradient); }
					.drone-cls-16 { fill: #2bff6a; }
					.drone-cls-17 { fill: #b7c0cc; }
					.drone-cls-18 { fill: #0a0f17; }
					.drone-cls-19 { fill: #ff2a2a; }
					.drone-cls-20 { fill: #1b2536; }
				</style>
				<linearGradient id="drone-gradient" x1="-1345.2" y1="31.37" x2="-1344.2" y2="30.37" gradientTransform="translate(158808.71 1297.3) scale(118 -41)" gradientUnits="userSpaceOnUse">
					<stop offset="0" stop-color="#f6f8fb" />
					<stop offset=".55" stop-color="#e1e7ef" />
					<stop offset="1" stop-color="#cfd6df" />
				</linearGradient>
			</defs>
			<g id="drone">
				<g id="propRear">
					<ellipse class="drone-cls-13" cx="44.73" cy="24.77" rx="38" ry="5" />
					<ellipse class="drone-cls-1" cx="54.73" cy="25.77" rx="26" ry="3.6" />
					<rect class="drone-cls-14" x="38.73" y="18.77" width="12" height="12" rx="4" ry="4" />
				</g>
				<g id="propFront">
					<ellipse class="drone-cls-13" cx="188.73" cy="22.77" rx="38" ry="5" />
					<ellipse class="drone-cls-1" cx="178.73" cy="23.77" rx="26" ry="3.6" />
					<rect class="drone-cls-14" x="182.73" y="16.77" width="12" height="12" rx="4" ry="4" />
				</g>
				<path class="drone-cls-17" d="M66.73,30.77c26-4,48-5,66-4s42-1,66-4l2,6c-24,3-48,5-68,5s-42,1-64,5l-2-8Z" />
				<path class="drone-cls-10" d="M68.73,35.77c26-5,46-6,64-5,19,1,43-1,66-4" />
				<path class="drone-cls-15" d="M80.73,22.77c10-8,29-12,54-12,22,0,42,4,52,11,5,4,8,9,8,13,0,6-5,10-12,12-11,3-27,5-46,5-21,0-38-2-48-6-8-3-12-7-12-12,0-4,1-7,4-11Z" />
				<path class="drone-cls-8" d="M108.73,17.77c8-3,18-4,28-4,12,0,22,2,30,6,3,2,4,5,4,8,0,2-1,4-3,5-7,4-18,6-31,6-12,0-22-2-29-5-2-1-3-3-3-6,0-4,1-8,4-10Z" />
				<g id="gimbal">
					<path class="drone-cls-2" d="M142.73,40.77c2-6,9-10,18-10,8,0,15,4,17,10,1,3,0,6-2,8-4,4-9,6-15,6-8,0-14-3-17-7-1-2-2-5-1-7Z" />
					<rect class="drone-cls-2" x="156.73" y="34.77" width="14" height="14" rx="3" ry="3" />
					<circle class="drone-cls-20" cx="163.73" cy="41.77" r="4.2" />
					<circle class="drone-cls-18" cx="163.73" cy="41.77" r="2.2" />
					<circle class="drone-cls-9" cx="165.23" cy="40.17" r=".8" />
				</g>
				<g id="legs">
					<path class="drone-cls-17" d="M74.73,34.77l-12,26c-1,2,0,4,3,4h3c2,0,3-1,4-3l11-23-9-4Z" />
					<path class="drone-cls-17" d="M192.73,30.77l12,28c1,2,0,4-3,4h-3c-2,0-3-1-4-3l-10-23,8-6Z" />
					<path class="drone-cls-10" d="M71.73,44.77l-6,14" />
					<path class="drone-cls-10" d="M190.73,41.77l7,15" />
				</g>
				<!-- Green lights with blink animation -->
				<g id="nav-green-1" class="green-light">
					<circle class="drone-cls-16" cx="52.73" cy="50.77" r="5.2" />
					<circle class="drone-cls-5" cx="52.73" cy="50.77" r="9.8" />
					<circle class="drone-cls-6" cx="52.73" cy="49.57" r="3.4" />
				</g>
				<g id="nav-green-2" class="green-light">
					<circle class="drone-cls-16" cx="82.73" cy="46.77" r="4.6" />
					<circle class="drone-cls-7" cx="82.73" cy="46.77" r="9.2" />
					<circle class="drone-cls-6" cx="82.73" cy="45.77" r="3" />
				</g>
				<!-- Red lights (constant) -->
				<g id="nav-red-1">
					<circle class="drone-cls-19" cx="198.73" cy="44.77" r="5.2" />
					<circle class="drone-cls-12" cx="198.73" cy="44.77" r="10" />
					<circle class="drone-cls-6" cx="198.73" cy="43.57" r="3.4" />
				</g>
				<g id="nav-red-2">
					<circle class="drone-cls-19" cx="178.73" cy="48.77" r="4.6" />
					<circle class="drone-cls-11" cx="178.73" cy="48.77" r="9.2" />
					<circle class="drone-cls-6" cx="178.73" cy="47.77" r="3" />
				</g>
				<path class="drone-cls-10" d="M92.73,28.77c16-6,36-8,54-7s32,5,40,10" />
				<path class="drone-cls-10" d="M120.73,40.77c8,2,20,2,30,0" />
				<rect class="drone-cls-3" x="168.73" y="23.77" width="9" height="5" rx="2" ry="2" />
				<circle class="drone-cls-4" cx="157.73" cy="26.77" r="2.1" />
			</g>
		</svg>
		</button>
	</div>
{/if}

<style>
	.drone-container {
		position: fixed;
		top: var(--start-y, 20%);
		z-index: 45;
		pointer-events: auto;
	}

	.drone-hit {
		background: none;
		border: none;
		padding: 12px;
		margin: -12px;
		cursor: pointer;
		pointer-events: auto;
	}

	/* Left to right flight */
	.drone-container.ltr {
		animation:
			fly-ltr var(--duration, 8s) linear forwards,
			wobble-y var(--duration, 8s) ease-in-out forwards;
	}

	/* Right to left flight */
	.drone-container.rtl {
		animation:
			fly-rtl var(--duration, 8s) linear forwards,
			wobble-y var(--duration, 8s) ease-in-out forwards;
	}

	.drone-container.rtl .drone {
		transform: scaleX(-1);
	}

	.drone {
		width: 40px;
		height: auto;
		filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
		animation: tilt 1.5s ease-in-out infinite;
	}

	@keyframes fly-ltr {
		0% {
			left: -60px;
			opacity: 0;
		}
		3% {
			opacity: 1;
		}
		97% {
			opacity: 1;
		}
		100% {
			left: calc(100vw + 60px);
			opacity: 0;
		}
	}

	@keyframes fly-rtl {
		0% {
			right: -60px;
			left: auto;
			opacity: 0;
		}
		3% {
			opacity: 1;
		}
		97% {
			opacity: 1;
		}
		100% {
			right: calc(100vw + 60px);
			left: auto;
			opacity: 0;
		}
	}

	/* Wobbly vertical movement */
	@keyframes wobble-y {
		0% { transform: translateY(0); }
		10% { transform: translateY(-8px); }
		20% { transform: translateY(12px); }
		30% { transform: translateY(-5px); }
		40% { transform: translateY(15px); }
		50% { transform: translateY(-10px); }
		60% { transform: translateY(8px); }
		70% { transform: translateY(-12px); }
		80% { transform: translateY(6px); }
		90% { transform: translateY(-4px); }
		100% { transform: translateY(10px); }
	}

	/* Slight tilt while flying */
	@keyframes tilt {
		0%, 100% { transform: rotate(-1deg); }
		25% { transform: rotate(2deg); }
		50% { transform: rotate(-2deg); }
		75% { transform: rotate(1deg); }
	}

	.drone-container.rtl .drone {
		animation: tilt-rtl 1.5s ease-in-out infinite;
	}

	.drone-container.scared {
		left: var(--scared-x);
		top: var(--scared-y);
		animation: scared-fly-away 3.4s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
	}

	.drone-container.scared .drone {
		animation: scared-turn 0.35s ease-out, scared-shake 0.22s ease-out 2;
	}

	@keyframes scared-turn {
		from { transform: rotate(0deg); }
		to { transform: rotate(180deg); }
	}

	@keyframes scared-shake {
		0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 60, 60, 0.6)); }
		50% { filter: drop-shadow(0 0 10px rgba(255, 40, 40, 0.95)); }
	}

	@keyframes scared-fly-away {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		85% {
			transform: translate(-50%, calc(100vh - var(--scared-y) - 28px)) scale(0.82);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, calc(100vh - var(--scared-y) - 20px)) scale(0.78);
			opacity: 0;
		}
	}

	@keyframes tilt-rtl {
		0%, 100% { transform: scaleX(-1) rotate(-1deg); }
		25% { transform: scaleX(-1) rotate(2deg); }
		50% { transform: scaleX(-1) rotate(-2deg); }
		75% { transform: scaleX(-1) rotate(1deg); }
	}

	/* Blinking green lights */
	.green-light {
		animation: blink-green 0.6s ease-in-out infinite;
	}

	@keyframes blink-green {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.2;
		}
	}
</style>
