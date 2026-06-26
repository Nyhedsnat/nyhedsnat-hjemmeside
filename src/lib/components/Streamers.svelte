<script lang="ts">
	import { onMount } from 'svelte';

	const streamerSvgs = [
		'/svg/eastereggs/streamers/breaking.svg',
		'/svg/eastereggs/streamers/nyhed.svg',
		'/svg/eastereggs/streamers/nyt.svg',
		'/svg/eastereggs/streamers/store.svg'
	];

	// SVG dimensions (approximate, based on viewBox)
	const SVG_WIDTH = 860;
	const SVG_HEIGHT = 136;
	const REPETITIONS = 8; // How many times to repeat each SVG segment

	interface Streamer {
		id: number;
		svg: string;
		angle: number; // Direction in degrees
		startX: number;
		startY: number;
		speed: number;
		height: number;
	}

	let activeStreamers = $state<Streamer[]>([]);
	let streamerIdCounter = 0;

	export function triggerStreamers() {
		// Spawn 40 streamers from various directions
		for (let i = 0; i < 40; i++) {
			setTimeout(() => {
				spawnStreamer();
			}, i * 100); // Stagger spawns
		}
	}

	function spawnStreamer() {
		const svg = streamerSvgs[Math.floor(Math.random() * streamerSvgs.length)];
		const height = 40 + Math.random() * 60; // Random height between 40-100px

		// Calculate total width of the streamer band
		const totalWidth = (SVG_WIDTH / SVG_HEIGHT) * height * REPETITIONS;

		// Pick a random direction (edge to come from)
		// 0 = left, 1 = right, 2 = top, 3 = bottom, 4-7 = corners
		const direction = Math.floor(Math.random() * 8);

		let startX: number, startY: number, angle: number;
		const screenW = window.innerWidth;
		const screenH = window.innerHeight;

		switch (direction) {
			case 0: // From left
				startX = -totalWidth;
				startY = Math.random() * screenH;
				angle = -10 + Math.random() * 20; // Slight angle variation
				break;
			case 1: // From right
				startX = screenW + totalWidth;
				startY = Math.random() * screenH;
				angle = 180 - 10 + Math.random() * 20;
				break;
			case 2: // From top
				startX = Math.random() * screenW;
				startY = -height;
				angle = 80 + Math.random() * 20; // Mostly downward
				break;
			case 3: // From bottom
				startX = Math.random() * screenW;
				startY = screenH + height;
				angle = -80 - Math.random() * 20; // Mostly upward
				break;
			case 4: // From top-left
				startX = -totalWidth;
				startY = -height;
				angle = 30 + Math.random() * 20;
				break;
			case 5: // From top-right
				startX = screenW + totalWidth;
				startY = -height;
				angle = 150 + Math.random() * 20;
				break;
			case 6: // From bottom-left
				startX = -totalWidth;
				startY = screenH + height;
				angle = -30 - Math.random() * 20;
				break;
			case 7: // From bottom-right
			default:
				startX = screenW + totalWidth;
				startY = screenH + height;
				angle = -150 - Math.random() * 20;
				break;
		}

		const streamer: Streamer = {
			id: streamerIdCounter++,
			svg,
			angle,
			startX,
			startY,
			speed: 400 + Math.random() * 300, // px per second
			height
		};

		activeStreamers = [...activeStreamers, streamer];

		// Animate the streamer
		animateStreamer(streamer);
	}

	function animateStreamer(streamer: Streamer) {
		const element = document.getElementById(`streamer-${streamer.id}`);
		if (!element) {
			// Try again after a short delay if element isn't ready
			setTimeout(() => animateStreamer(streamer), 10);
			return;
		}
		const el = element;

		const totalWidth = (SVG_WIDTH / SVG_HEIGHT) * streamer.height * REPETITIONS;
		const radians = (streamer.angle * Math.PI) / 180;
		const vx = Math.cos(radians) * streamer.speed;
		const vy = Math.sin(radians) * streamer.speed;

		// Calculate how long it takes to cross the screen (with some buffer)
		const maxDistance = Math.sqrt(
			Math.pow(window.innerWidth + totalWidth * 2, 2) +
			Math.pow(window.innerHeight + streamer.height * 2, 2)
		);
		const duration = (maxDistance / streamer.speed) * 1000;

		let startTime: number;
		let x = streamer.startX;
		let y = streamer.startY;

		function animate(timestamp: number) {
			if (!startTime) startTime = timestamp;
			const elapsed = timestamp - startTime;
			const progress = elapsed / 1000; // seconds

			x = streamer.startX + vx * progress;
			y = streamer.startY + vy * progress;

			el.style.transform = `translate(${x}px, ${y}px) rotate(${streamer.angle}deg)`;

			// Check if streamer is completely off screen
			if (elapsed < duration) {
				requestAnimationFrame(animate);
			} else {
				// Remove streamer
				activeStreamers = activeStreamers.filter(s => s.id !== streamer.id);
			}
		}

		requestAnimationFrame(animate);
	}

	onMount(() => {
		// Listen for custom event from logo double-click
		const handleStreamerTrigger = () => {
			triggerStreamers();
		};

		window.addEventListener('trigger-streamers', handleStreamerTrigger);

		return () => {
			window.removeEventListener('trigger-streamers', handleStreamerTrigger);
		};
	});
</script>

<div class="streamers-container">
	{#each activeStreamers as streamer (streamer.id)}
		{@const aspectRatio = SVG_WIDTH / SVG_HEIGHT}
		{@const segmentWidth = streamer.height * aspectRatio}
		<div
			id="streamer-{streamer.id}"
			class="streamer"
			style="
				height: {streamer.height}px;
				transform: translate({streamer.startX}px, {streamer.startY}px) rotate({streamer.angle}deg);
			"
		>
			{#each Array(REPETITIONS) as _, i}
				<img
					src={streamer.svg}
					alt=""
					class="streamer-segment"
					style="width: {segmentWidth}px; height: {streamer.height}px;"
				/>
			{/each}
		</div>
	{/each}
</div>

<style>
	.streamers-container {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 200;
		overflow: visible;
	}

	.streamer {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: row;
		transform-origin: left center;
		will-change: transform;
	}

	.streamer-segment {
		flex-shrink: 0;
		display: block;
	}
</style>
