<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let startX = $state(50);
	let duration = $state(15);

	let swarmActive = $state(false);
	let swarmLeaving = $state(false);
	let swarm = $state<Array<{ id: number; x: number; y: number; vx: number; vy: number; ox: number; oy: number }>>([]);
	let mouseX = 0;
	let mouseY = 0;
	let rafId: number | null = null;
	let swarmTimeout: ReturnType<typeof setTimeout> | null = null;
	let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

	function startSwarm() {
		if (swarmActive) return;
		swarmActive = true;
		swarmLeaving = false;
		swarm = Array.from({ length: 15 }, (_, i) => ({
			id: i,
			x: Math.random() * window.innerWidth,
			y: -40 - Math.random() * 220,
			vx: (Math.random() - 0.5) * 1.2,
			vy: 1.5 + Math.random() * 1.4,
			ox: (Math.random() - 0.5) * 170,
			oy: (Math.random() - 0.5) * 120
		}));

		swarmTimeout = setTimeout(() => {
			swarmLeaving = true;
			leaveTimeout = setTimeout(() => {
				swarmActive = false;
				swarmLeaving = false;
				swarm = [];
			}, 1200);
		}, 15000);
	}

	function updateSwarm(t: number) {
		if (!swarmActive) return;

		const minSpacing = 48; // 2x mini UFO width (24px)
		const updated = [...swarm];

		for (let i = 0; i < updated.length; i++) {
			const u = updated[i];

			if (swarmLeaving) {
				const a = (i / 15) * Math.PI * 2;
				u.vx += Math.cos(a) * 1.9;
				u.vy += Math.sin(a) * 1.9 - 0.8;
				u.x += u.vx;
				u.y += u.vy;
				continue;
			}

			// Autonomous pursuit (chase target, don't stick to cursor)
			const tx = mouseX + Math.cos(t / 160 + i) * 16;
			const ty = mouseY + Math.sin(t / 130 + i * 0.7) * 12;
			const dx = tx - u.x;
			const dy = ty - u.y;
			const dist = Math.max(1, Math.hypot(dx, dy));
			const nx = dx / dist;
			const ny = dy / dist;

			const accel = dist > 220 ? 0.55 : 0.34;
			u.vx += nx * accel + Math.cos(t / 90 + i * 1.6) * 0.08;
			u.vy += ny * accel + Math.sin(t / 85 + i * 1.3) * 0.08;

			// Separation: keep at least minSpacing from other UFOs
			let sepX = 0;
			let sepY = 0;
			for (let j = 0; j < updated.length; j++) {
				if (i === j) continue;
				const o = updated[j];
				const ddx = u.x - o.x;
				const ddy = u.y - o.y;
				const d = Math.hypot(ddx, ddy);
				if (d > 0 && d < minSpacing) {
					const push = (minSpacing - d) / minSpacing;
					sepX += (ddx / d) * push;
					sepY += (ddy / d) * push;
				}
			}
			u.vx += sepX * 0.9;
			u.vy += sepY * 0.9;

			u.vx *= 0.9;
			u.vy *= 0.9;

			const speed = Math.hypot(u.vx, u.vy);
			const maxSpeed = 7.5;
			if (speed > maxSpeed) {
				u.vx = (u.vx / speed) * maxSpeed;
				u.vy = (u.vy / speed) * maxSpeed;
			}

			u.x += u.vx;
			u.y += u.vy;
		}

		swarm = updated;
	}

	onMount(() => {
		mouseX = window.innerWidth / 2;
		mouseY = window.innerHeight / 2;
		const onPointerMove = (e: PointerEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		// Random initial delay between 20-60 seconds
		const initialDelay = Math.random() * 40000 + 20000;

		const startFlight = () => {
			// Random start position (20-80% from left)
			startX = Math.random() * 60 + 20;
			// Random duration 12-20 seconds
			duration = Math.random() * 8 + 12;

			visible = true;

			// Hide after animation completes
			setTimeout(() => {
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

		const loop = (time: number) => {
			updateSwarm(time);
			rafId = requestAnimationFrame(loop);
		};
		rafId = requestAnimationFrame(loop);

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			if (rafId) cancelAnimationFrame(rafId);
			if (swarmTimeout) clearTimeout(swarmTimeout);
			if (leaveTimeout) clearTimeout(leaveTimeout);
		};
	});
</script>

{#if visible}
	<div
		class="ufo-container"
		style="--start-x: {startX}%; --duration: {duration}s;"
		onclick={startSwarm}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && startSwarm()}
	>
		<!-- Rainbow glow behind UFO -->
		<div class="rainbow-glow"></div>

		<svg
			class="ufo"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			viewBox="0 0 205.61 147.3"
		>
			<defs>
				<style>
					.ufo-cls-1 { fill: #2f3648; }
					.ufo-cls-2 { opacity: .7; stroke: #ccecff; fill: none; }
					.ufo-cls-3 { fill: #7b8cff; opacity: .15; }
					.ufo-cls-4 { fill: #9fdcff; opacity: .85; }
					.ufo-cls-5 { fill: none; stroke: #5b6786; stroke-width: .8px; opacity: .35; }
					.ufo-cls-6 { fill: url(#ufo-beam-gradient); opacity: .35; }
					.ufo-cls-7 { fill: #fff; opacity: .08; }
					.ufo-cls-8 { fill: #fff; opacity: .15; }
					.ufo-cls-9 { fill: #fff; opacity: .25; }
					.ufo-cls-10 { fill: #3c465c; }
					.ufo-cls-11 { fill: #1c2230; }
				</style>
				<linearGradient id="ufo-beam-gradient" x1="-1034" y1="583.62" x2="-1034" y2="582.62" gradientTransform="translate(103496.9 37998.04) scale(100 -65)" gradientUnits="userSpaceOnUse">
					<stop offset="0" stop-color="#fff" stop-opacity=".6"/>
					<stop offset="1" stop-color="#fff" stop-opacity="0"/>
				</linearGradient>
			</defs>
			<!-- Search light beam -->
			<path class="ufo-cls-6 search-light" d="M97.26,62.9l-50,65h100l-50-65Z"/>
			<g id="ufo-body">
				<ellipse class="ufo-cls-3" cx="97.26" cy="55.9" rx="78" ry="26"/>
				<ellipse class="ufo-cls-4" cx="97.26" cy="32.9" rx="34" ry="18"/>
				<ellipse class="ufo-cls-2" cx="97.26" cy="32.9" rx="34" ry="18"/>
				<ellipse class="ufo-cls-9" cx="89.26" cy="27.9" rx="10" ry="6"/>
				<ellipse class="ufo-cls-8" cx="105.26" cy="35.9" rx="6" ry="4"/>
				<ellipse class="ufo-cls-1" cx="97.26" cy="49.9" rx="78" ry="22"/>
				<ellipse class="ufo-cls-10" cx="97.26" cy="52.9" rx="66" ry="18"/>
				<ellipse class="ufo-cls-11" cx="97.26" cy="57.9" rx="48" ry="12"/>
				<ellipse class="ufo-cls-5" cx="97.26" cy="51.9" rx="64" ry="16"/>
				<ellipse class="ufo-cls-5" cx="97.26" cy="55.9" rx="52" ry="13"/>
				<ellipse class="ufo-cls-7" cx="97.26" cy="63.9" rx="40" ry="10"/>
			</g>
		</svg>
	</div>
{/if}

{#if swarmActive}
	<div class="swarm-layer" aria-hidden="true">
		{#each swarm as s (s.id)}
			<div class="swarm-ufo {swarmLeaving ? 'leaving' : ''}" style="left:{s.x}px; top:{s.y}px;">
				<div class="mini-ufo"></div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.ufo-container {
		position: fixed;
		left: var(--start-x, 50%);
		top: -80px;
		z-index: 30;
		pointer-events: auto;
		transform: translateX(-50%);
		animation: ufo-flight var(--duration, 15s) ease-in-out forwards;
		cursor: pointer;
	}

	.ufo {
		width: 60px;
		height: auto;
		filter: drop-shadow(0 0 8px rgba(123, 140, 255, 0.4));
	}

	/* Rainbow glow behind UFO */
	.rainbow-glow {
		position: absolute;
		top: 15px;
		left: 50%;
		transform: translateX(-50%);
		width: 40px;
		height: 20px;
		border-radius: 50%;
		background: conic-gradient(
			from 0deg,
			#ff0000,
			#ff8800,
			#ffff00,
			#00ff00,
			#00ffff,
			#0088ff,
			#8800ff,
			#ff00ff,
			#ff0000
		);
		filter: blur(8px);
		opacity: 0.6;
		animation: rainbow-rotate 2s linear infinite;
	}

	@keyframes rainbow-rotate {
		0% {
			filter: blur(8px) hue-rotate(0deg);
		}
		100% {
			filter: blur(8px) hue-rotate(360deg);
		}
	}

	/* UFO search pattern flight */
	@keyframes ufo-flight {
		0% {
			top: -80px;
			left: var(--start-x, 50%);
			opacity: 0;
		}
		5% {
			opacity: 1;
		}
		/* Descend and search left */
		15% {
			top: 25%;
			left: calc(var(--start-x, 50%) - 15%);
		}
		/* Move right while descending */
		25% {
			top: 35%;
			left: calc(var(--start-x, 50%) + 10%);
		}
		/* Search pattern - go left */
		35% {
			top: 30%;
			left: calc(var(--start-x, 50%) - 20%);
		}
		/* Search pattern - go right and down */
		45% {
			top: 45%;
			left: calc(var(--start-x, 50%) + 15%);
		}
		/* Hover and search */
		55% {
			top: 40%;
			left: calc(var(--start-x, 50%) - 10%);
		}
		/* Start ascending */
		65% {
			top: 30%;
			left: calc(var(--start-x, 50%) + 5%);
		}
		/* Continue up */
		75% {
			top: 15%;
			left: calc(var(--start-x, 50%) - 5%);
		}
		/* Exit */
		90% {
			top: -50px;
			left: var(--start-x, 50%);
			opacity: 1;
		}
		100% {
			top: -100px;
			left: var(--start-x, 50%);
			opacity: 0;
		}
	}

	/* Blinking search light */
	.search-light {
		animation: searchlight-blink 0.8s ease-in-out infinite;
	}

	@keyframes searchlight-blink {
		0%, 100% {
			opacity: 0.5;
		}
		30% {
			opacity: 0.2;
		}
		50% {
			opacity: 0.6;
		}
		70% {
			opacity: 0.1;
		}
	}

	/* Slight wobble for UFO body */
	.ufo {
		animation: ufo-wobble 3s ease-in-out infinite;
	}

	.swarm-layer {
		position: fixed;
		inset: 0;
		z-index: 60;
		pointer-events: none;
	}

	.swarm-ufo {
		position: fixed;
		transform: translate(-50%, -50%);
	}

	.mini-ufo {
		width: 24px;
		height: 12px;
		border-radius: 999px;
		background: linear-gradient(180deg, #9fdcff 0%, #3c465c 45%, #1c2230 100%);
		box-shadow: 0 0 10px rgba(123, 140, 255, 0.8);
		position: relative;
		animation: mini-wobble 0.45s ease-in-out infinite;
	}

	.mini-ufo::before {
		content: '';
		position: absolute;
		top: -5px;
		left: 7px;
		width: 10px;
		height: 7px;
		border-radius: 999px;
		background: rgba(159, 220, 255, 0.9);
	}

	@keyframes mini-wobble {
		0%, 100% { transform: rotate(-6deg) scale(1); }
		50% { transform: rotate(6deg) scale(1.08); }
	}

	@keyframes ufo-wobble {
		0%, 100% {
			transform: rotate(-4deg) scale(1);
		}
		25% {
			transform: rotate(4deg) scale(1.04);
		}
		50% {
			transform: rotate(-2deg) scale(0.96);
		}
		75% {
			transform: rotate(2deg) scale(1.02);
		}
	}
</style>
