<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let duration = $state(16);
	let busEventActive = $state(false);
	let jumping = $state(false);

	// Click easter egg: the big heavy bus crouches and pulls off a surprise jump.
	function handleBusClick() {
		if (busEventActive) return;
		busEventActive = true;
		jumping = true;

		setTimeout(() => {
			jumping = false;
			busEventActive = false;
		}, 1400);
	}

	onMount(() => {
		const initialDelay = Math.random() * 20000 + 20000;

		const startDrive = () => {
			direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
			duration = Math.random() * 6 + 14;
			visible = true;
			setTimeout(() => {
				visible = false;
				busEventActive = false;
				jumping = false;
			}, duration * 1000 + 200);
		};

		setTimeout(() => {
			startDrive();
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
	<div class="bus-container {direction}" style="--duration: {duration}s;">
		<button class="bus-button" onclick={handleBusClick} aria-label="Bus action">
			<img
				src="/svg/eastereggs/vehicles/bus.svg"
				alt=""
				class="bus"
				class:jumping
				aria-hidden="true"
				draggable="false"
			/>
			{#if jumping}
				<div class="bus-dust" aria-hidden="true">
					<span></span><span></span><span></span><span></span>
				</div>
			{/if}
		</button>
	</div>
{/if}

<style>
	.bus-container {
		position: absolute;
		bottom: 6px;
		z-index: 2;
		pointer-events: none;
	}
	.bus-button {
		position: relative;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
	}
	.bus-container.ltr {
		left: 0;
		animation: drive-ltr var(--duration, 16s) linear forwards;
	}
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
		display: block;
		transform-origin: 50% 100%;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}
	.bus.jumping {
		animation: bus-jump-rtl 1.4s linear;
	}
	.bus-container.ltr .bus.jumping {
		animation: bus-jump-ltr 1.4s linear;
	}

	/* Dust kicked up when the bus lands. */
	.bus-dust {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		z-index: 1;
		pointer-events: none;
	}
	.bus-dust span {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(170, 158, 138, 0.75), transparent 70%);
		filter: blur(1px);
		opacity: 0;
		animation: bus-dust-puff 0.55s ease-out 0.96s forwards;
	}
	.bus-dust span:nth-child(1) { --dx: -46px; }
	.bus-dust span:nth-child(2) { --dx: -18px; }
	.bus-dust span:nth-child(3) { --dx: 18px; }
	.bus-dust span:nth-child(4) { --dx: 46px; }

	@keyframes drive-ltr { 0% { transform: translateX(-200px);} 100% { transform: translateX(calc(100vw + 200px));} }
	@keyframes drive-rtl { 0% { transform: translateX(200px);} 100% { transform: translateX(calc(-100vw - 200px));} }

	/* Crouch → launch (decelerate to apex) → fall (accelerate) → land squash → settle. */
	@keyframes bus-jump-rtl {
		0%   { transform: translateY(0)      scaleY(1)    scaleX(1);    animation-timing-function: ease-in; }
		9%   { transform: translateY(0)      scaleY(0.80) scaleX(1.12); animation-timing-function: ease-out; }
		46%  { transform: translateY(-125px) scaleY(1.05) scaleX(0.96); animation-timing-function: ease-in; }
		74%  { transform: translateY(0)      scaleY(1)    scaleX(1);    animation-timing-function: ease-out; }
		82%  { transform: translateY(0)      scaleY(0.82) scaleX(1.12); animation-timing-function: ease-in-out; }
		100% { transform: translateY(0)      scaleY(1)    scaleX(1); }
	}
	@keyframes bus-jump-ltr {
		0%   { transform: translateY(0)      scaleY(1)    scaleX(-1);    animation-timing-function: ease-in; }
		9%   { transform: translateY(0)      scaleY(0.80) scaleX(-1.12); animation-timing-function: ease-out; }
		46%  { transform: translateY(-125px) scaleY(1.05) scaleX(-0.96); animation-timing-function: ease-in; }
		74%  { transform: translateY(0)      scaleY(1)    scaleX(-1);    animation-timing-function: ease-out; }
		82%  { transform: translateY(0)      scaleY(0.82) scaleX(-1.12); animation-timing-function: ease-in-out; }
		100% { transform: translateY(0)      scaleY(1)    scaleX(-1); }
	}
	@keyframes bus-dust-puff {
		0%   { opacity: 0;    transform: translate(0, 0) scale(0.3); }
		25%  { opacity: 0.85; }
		100% { opacity: 0;    transform: translate(var(--dx), -8px) scale(1.4); }
	}
</style>
