<script lang="ts">
	import { onMount } from 'svelte';
	import { snowFreeze } from '$lib/stores/snow';

	// Self-contained "snow cloud → snowstorm → 20-car pile-up" easter egg.
	// A snow cloud drifts over the town now and then; click it to set off the storm.
	// Touches nothing else — its own cloud, snow, mound and car fleet.

	type Car = {
		id: number;
		src: string;
		stopVw: number;
		rot: number;
		delayMs: number;
		fxDelayMs: number;
		leaveDelay: number;
		leaveDurMs: number;
	};

	const CAR_SRCS = [
		'/svg/eastereggs/vehicles/car-1.svg',
		'/svg/eastereggs/vehicles/car-2.svg',
		'/svg/eastereggs/vehicles/car-3.svg',
		'/svg/eastereggs/vehicles/car-4.svg',
		'/svg/eastereggs/vehicles/car-5.svg',
		'/svg/eastereggs/vehicles/4x4.svg',
		'/svg/eastereggs/vehicles/random-short-car.svg'
	];
	const BLOCK_VW = 52; // road blockage x where the pile-up forms
	const FLEET = 20;

	let cloudVisible = $state(false);
	let cloudActive = $state(false);
	let eventActive = $state(false);
	let snowing = $state(false);
	let groundOut = $state(false); // fade the settled snow (and falling snow) away
	let leaving = $state(false); // pile-up drives off
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let driftDuration = $state(40);
	let cars = $state<Car[]>([]);
	let carId = 0;

	function startEvent() {
		if (eventActive || !cloudVisible) return;
		eventActive = true;
		cloudActive = true; // freezes the drift + darkens the cloud
		snowing = true;
		snowFreeze.set(true); // freeze normal traffic — snow on the road
		groundOut = false;
		leaving = false;

		const sign = direction === 'ltr' ? -1 : 1; // pile grows backward from the blockage
		const SPEED_VW_S = 12; // drive-off speed — matches normal traffic's on-screen pace
		cars = Array.from({ length: FLEET }, (_, i) => {
			const delayMs = 9000 + i * 280; // let a deep snow layer build (~9s) before cars slide in
			const stopVw = BLOCK_VW + sign * (i * 3.6);
			// distance each car covers driving off (to just past its exit edge),
			// so duration ∝ distance → constant speed instead of a fixed-time sprint
			const travelVw = direction === 'ltr' ? 110 - stopVw : stopVw + 10;
			const leaveDurMs = Math.min(8500, Math.max(3500, (travelVw / SPEED_VW_S) * 1000));
			return {
				id: carId++,
				src: CAR_SRCS[Math.floor(Math.random() * CAR_SRCS.length)],
				stopVw,
				rot: Math.random() * 10 - 5,
				delayMs,
				fxDelayMs: delayMs + 2350, // crash fx as it slides into the pile
				leaveDelay: i * 100, // front of the pile pulls away first
				leaveDurMs
			};
		});

		// lifecycle: deep snow builds → cars slide in & crash → snow stops & MELTS away → only then cars drive off
		setTimeout(() => {
			groundOut = true; // snow stops falling; settled snow starts melting (reverse-grow)
		}, 17500);
		setTimeout(() => {
			leaving = true; // melt finished — road clear, pile-up drives off
			snowFreeze.set(false); // ...and normal traffic moves again
		}, 21000);
		setTimeout(() => endEvent(), 32000); // cars now leave at normal speed → longer tail
	}

	function endEvent() {
		cars = [];
		eventActive = false;
		snowing = false;
		groundOut = false;
		leaving = false;
		cloudActive = false; // un-freeze: cloud resumes drifting from where it parked
		snowFreeze.set(false); // safety: never leave traffic frozen
	}

	let nextCloudTimer: ReturnType<typeof setTimeout> | undefined;

	function showCloud() {
		if (eventActive) return;
		direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
		driftDuration = Math.random() * 20 + 35; // 35-55s drift across
		cloudVisible = true;
	}

	function scheduleNextCloud(delay: number) {
		clearTimeout(nextCloudTimer);
		nextCloudTimer = setTimeout(showCloud, delay);
	}

	// Cloud finished drifting across (after a storm it resumes from where it parked,
	// then finishes here) → hide it and bring a fresh one along later.
	function onCloudDriftEnd() {
		if (eventActive) return; // still storming (drift paused) — ignore
		cloudVisible = false;
		scheduleNextCloud(Math.random() * 90000 + 60000); // next cloud in 60-150s
	}

	onMount(() => {
		scheduleNextCloud(Math.random() * 30000 + 20000); // first cloud after 20-50s
		return () => clearTimeout(nextCloudTimer);
	});
</script>

{#if cloudVisible}
	<button
		type="button"
		class="snow-cloud {direction}"
		class:active={cloudActive}
		style="--drift: {driftDuration}s;"
		onclick={startEvent}
		onanimationend={onCloudDriftEnd}
		aria-label="Snesky"
	>
		<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
	</button>
{/if}

{#if snowing}
	<div class="snowfall" class:out={groundOut} aria-hidden="true">
		{#each Array(80) as _, i}
			<span
				class="flake"
				style="--x: {(i * 37) % 100}vw; --d: {(i % 7) * 0.4 + 2.2}s; --delay: {-(i % 11) * 0.5}s; --drift: {((i % 5) - 2) * 14}px; --sz: {(i % 3) + 2}px;"
			></span>
		{/each}
	</div>
{/if}

{#if eventActive}
	<div class="snow-ground" class:out={groundOut} aria-hidden="true"></div>
{/if}

{#each cars as car (car.id)}
	<div
		class="snow-car-wrap {direction}"
		class:leaving
		style="--stop: {car.stopVw}vw; --rot: {car.rot}deg; --delay: {car.delayMs}ms; --fx-delay: {car.fxDelayMs}ms; --leave-delay: {car.leaveDelay}ms; --leave-dur: {car.leaveDurMs}ms;"
	>
		<img src={car.src} alt="" aria-hidden="true" draggable="false" class="snow-car" />
		<div class="crash-fx" aria-hidden="true">
			<span class="spark s1"></span><span class="spark s2"></span><span class="spark s3"></span><span class="spark s4"></span>
			<span class="csmoke cm1"></span><span class="csmoke cm2"></span>
			<span class="honk">!</span>
		</div>
	</div>
{/each}

<style>
	/* ---- cloud (trigger) ---- */
	/* absolute in the houses band → floats in the sky over the rooftops and
	   scrolls with the town, so it never drifts up behind the fixed nav.
	   z-index 4 keeps it above the houses-front layer (3) without tying with it. */
	.snow-cloud {
		position: absolute;
		top: 40%;
		left: 0;
		width: 92px;
		height: 38px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
		z-index: 4;
		opacity: 0.8;
	}
	.snow-cloud.ltr {
		animation: cloud-drift-ltr var(--drift, 40s) linear forwards;
	}
	.snow-cloud.rtl {
		right: 0;
		left: auto;
		animation: cloud-drift-rtl var(--drift, 40s) linear forwards;
	}
	.snow-cloud.active {
		opacity: 1;
		animation-play-state: paused; /* park overhead while it storms */
	}
	.snow-cloud .puff {
		position: absolute;
		bottom: 0;
		border-radius: 50%;
		/* dark, blue-tinted night cloud */
		background: radial-gradient(circle at 40% 35%, #6b7da6, #38456a 72%, rgba(56, 69, 106, 0) 100%);
		filter: blur(0.5px);
		transition: background 0.4s ease;
	}
	.snow-cloud.active .puff {
		/* heavier storm cloud — darker still */
		background: radial-gradient(circle at 40% 35%, #45527a, #232d49 72%, rgba(35, 45, 73, 0) 100%);
	}
	.puff.p1 { left: 4px; width: 38px; height: 30px; }
	.puff.p2 { left: 26px; width: 50px; height: 38px; }
	.puff.p3 { left: 56px; width: 34px; height: 28px; }

	/* ---- snowfall ---- */
	.snowfall {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 6;
		overflow: hidden;
		animation: snow-fade-in 1.8s ease forwards;
	}
	.snowfall.out { animation: snow-fade-out 2.2s ease forwards; }
	.flake {
		position: absolute;
		top: -10px;
		left: var(--x);
		width: var(--sz);
		height: var(--sz);
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		animation: flake-fall var(--d) linear var(--delay) infinite;
	}

	/* ---- snow settling evenly across the whole town (road strip) ---- */
	.snow-ground {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 26px;
		transform-origin: bottom;
		transform: scaleY(0);
		/* flat base layer + irregular drift mounds (varied size/position) → uneven snow surface */
		background:
			radial-gradient(24px 16px at 9% 100%, #eef4fb 60%, rgba(238, 244, 251, 0) 72%),
			radial-gradient(34px 22px at 24% 100%, #eef4fb 60%, rgba(238, 244, 251, 0) 73%),
			radial-gradient(19px 13px at 38% 100%, #eef4fb 60%, rgba(238, 244, 251, 0) 72%),
			radial-gradient(40px 24px at 55% 100%, #eef4fb 60%, rgba(238, 244, 251, 0) 73%),
			radial-gradient(22px 15px at 71% 100%, #eef4fb 60%, rgba(238, 244, 251, 0) 72%),
			radial-gradient(30px 19px at 88% 100%, #eef4fb 60%, rgba(238, 244, 251, 0) 73%),
			linear-gradient(to top, #eef4fb 0%, #dde8f4 40%, rgba(221, 232, 244, 0) 100%) bottom / 100% 12px no-repeat;
		filter: blur(0.6px);
		z-index: 2; /* between house layers, like traffic; never 3 (= houses-front → z-fight) */
		animation: ground-grow 14s linear forwards; /* slow, steady build — road only gets slippery once it's deep */
	}
	/* melt: reverse the build — snow shrinks back down to the road (bottom origin) */
	.snow-ground.out { animation: ground-melt 3.2s ease-in forwards; }

	/* ---- car fleet ---- */
	.snow-car-wrap {
		position: absolute;
		bottom: 8px;
		left: 0;
		z-index: 2; /* match traffic — between house layers; NOT 3 (= houses-front → z-fight flicker) */
		transform-origin: 50% 100%;
	}
	/* slower than now (≈2.8s) with a slide: overshoots the stop then skids back on the snow */
	.snow-car-wrap.ltr { animation: snowcar-ltr 2.8s cubic-bezier(0.2, 0.55, 0.1, 1) var(--delay) both; }
	.snow-car-wrap.rtl { animation: snowcar-rtl 2.8s cubic-bezier(0.2, 0.55, 0.1, 1) var(--delay) both; }
	/* once the snow clears, the pile drives off (front first) instead of fading */
	/* linear + per-car duration → drives off at a steady, normal-traffic speed */
	.snow-car-wrap.leaving.ltr { animation: snowcar-leave-ltr var(--leave-dur, 6s) linear var(--leave-delay) forwards; }
	.snow-car-wrap.leaving.rtl { animation: snowcar-leave-rtl var(--leave-dur, 6s) linear var(--leave-delay) forwards; }
	.snow-car {
		display: block;
		height: 45px;
		width: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	/* crash sparks + "!" honk, fired as the car hits the pile */
	.crash-fx {
		position: absolute;
		top: 2px;
		left: 50%;
		width: 0;
		height: 0;
		z-index: 5;
		pointer-events: none;
	}
	.crash-fx .spark {
		position: absolute;
		width: 5px;
		height: 5px;
		border-radius: 1px;
		background: #fff3b0;
		box-shadow: 0 0 4px #ffd24a;
		opacity: 0;
		animation: spark-pop 0.45s ease-out var(--fx-delay) forwards;
	}
	.crash-fx .s1 { --dx: -18px; --dy: -14px; }
	.crash-fx .s2 { --dx: 16px; --dy: -16px; }
	.crash-fx .s3 { --dx: -8px; --dy: -22px; }
	.crash-fx .s4 { --dx: 12px; --dy: -8px; }
	.crash-fx .csmoke {
		position: absolute;
		bottom: -6px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(120, 120, 120, 0.7), rgba(120, 120, 120, 0) 70%);
		opacity: 0;
		animation: crash-smoke 1s ease-out var(--fx-delay) forwards;
	}
	.crash-fx .cm1 { --sx: -12px; }
	.crash-fx .cm2 { --sx: 12px; animation-delay: calc(var(--fx-delay) + 120ms); }
	.crash-fx .honk {
		position: absolute;
		left: -3px;
		top: -22px;
		font: 700 14px/1 system-ui, sans-serif;
		color: #ffd24a;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		opacity: 0;
		animation: honk-pop 0.7s ease-out var(--fx-delay) forwards;
	}

	/* ---- keyframes ---- */
	@keyframes cloud-drift-ltr { 0% { transform: translateX(-120px); } 100% { transform: translateX(calc(100vw + 120px)); } }
	@keyframes cloud-drift-rtl { 0% { transform: translateX(120px); } 100% { transform: translateX(calc(-100vw - 120px)); } }

	@keyframes snow-fade-in { from { opacity: 0; } to { opacity: 1; } }
	@keyframes snow-fade-out { to { opacity: 0; } }

	@keyframes flake-fall {
		0% { transform: translate(0, 0); opacity: 0; }
		10% { opacity: 0.9; }
		100% { transform: translate(var(--drift), 320px); opacity: 0.15; }
	}

	@keyframes ground-grow {
		0% { transform: scaleY(0); opacity: 0; }
		8% { opacity: 1; }
		100% { transform: scaleY(1); opacity: 1; }
	}

	/* reverse of ground-grow: the pile sinks back to the road, fading only at the very end */
	@keyframes ground-melt {
		0% { transform: scaleY(1); opacity: 1; }
		80% { opacity: 1; }
		100% { transform: scaleY(0); opacity: 0; }
	}

	/* Arrive fast, then SLIDE on the snow: overshoot past the stop, skid back into
	   the car ahead, small settle. */
	@keyframes snowcar-ltr {
		0% { transform: translateX(-280px) scaleX(-1) rotate(0); }
		55% { transform: translateX(calc(var(--stop) + 30px)) scaleX(-1) rotate(calc(var(--rot) * -1)); }
		78% { transform: translateX(calc(var(--stop) - 12px)) scaleX(-1) rotate(var(--rot)); }
		90% { transform: translateX(calc(var(--stop) + 4px)) scaleX(-1) rotate(calc(var(--rot) * 0.5)); }
		100% { transform: translateX(var(--stop)) scaleX(-1) rotate(var(--rot)); }
	}
	@keyframes snowcar-rtl {
		0% { transform: translateX(calc(100vw + 280px)) scaleX(1) rotate(0); }
		55% { transform: translateX(calc(var(--stop) - 30px)) scaleX(1) rotate(calc(var(--rot) * -1)); }
		78% { transform: translateX(calc(var(--stop) + 12px)) scaleX(1) rotate(var(--rot)); }
		90% { transform: translateX(calc(var(--stop) - 4px)) scaleX(1) rotate(calc(var(--rot) * 0.5)); }
		100% { transform: translateX(var(--stop)) scaleX(1) rotate(var(--rot)); }
	}
	/* drive off the way they were heading, straightening out */
	@keyframes snowcar-leave-ltr {
		0% { transform: translateX(var(--stop)) scaleX(-1) rotate(var(--rot)); }
		100% { transform: translateX(110vw) scaleX(-1) rotate(0); }
	}
	@keyframes snowcar-leave-rtl {
		0% { transform: translateX(var(--stop)) scaleX(1) rotate(var(--rot)); }
		100% { transform: translateX(-10vw) scaleX(1) rotate(0); }
	}

	@keyframes crash-smoke {
		0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
		25% { opacity: 0.7; }
		100% { opacity: 0; transform: translate(var(--sx), -22px) scale(1.7); }
	}

	@keyframes spark-pop {
		0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
		20% { opacity: 1; }
		100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1); }
	}
	@keyframes honk-pop {
		0% { opacity: 0; transform: translateY(2px) scale(0.6); }
		25% { opacity: 1; transform: translateY(-2px) scale(1.1); }
		70% { opacity: 1; transform: translateY(-4px) scale(1); }
		100% { opacity: 0; transform: translateY(-8px) scale(0.9); }
	}
</style>
