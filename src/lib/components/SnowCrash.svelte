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
		arriveDurMs: number;
		leaveDelay: number;
		leaveDurMs: number;
		angryDurMs: number;
		angryDelayMs: number;
		angrySymbol: string;
	};

	// Mix of anger/frustration marks — each stuck car flashes its own, so the pile
	// shows a variety rather than the same symbol everywhere.
	const ANGRY_SYMBOLS = ['💢', '😡', '❗', '💥', '😤', '🤬', '‼️', '🤬', '💢'];

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
	const FLEET = 12; // keep the whole pile-up on screen (12 * ~3.6vw ≈ 43vw spread)

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
	let bumped = $state<Record<number, { level: number; sym: string }>>({}); // id → click-bump (2=hit, 1=shoved neighbour)

	// Click a stuck car → it angrily lurches into the car ahead/behind; those
	// neighbours get shoved a little too. Honk + 💢 + smoke on the one clicked.
	function setBump(id: number, level: number, sym: string) {
		bumped = { ...bumped, [id]: { level, sym } };
		setTimeout(() => {
			const next = { ...bumped };
			delete next[id];
			bumped = next;
		}, 650);
	}
	function bumpCar(i: number) {
		if (leaving) return; // already driving off
		setBump(cars[i].id, 2, ANGRY_SYMBOLS[Math.floor(Math.random() * ANGRY_SYMBOLS.length)]);
		if (cars[i - 1]) setBump(cars[i - 1].id, 1, '');
		if (cars[i + 1]) setBump(cars[i + 1].id, 1, '');
	}

	function startEvent() {
		if (eventActive || !cloudVisible) return;
		eventActive = true;
		cloudActive = true; // freezes the drift + darkens the cloud
		snowing = true;
		snowFreeze.set(true); // stop new cars spawning right away (existing cars halt 5s later — see Vehicles)
		groundOut = false;
		leaving = false;

		const sign = direction === 'ltr' ? -1 : 1; // pile grows backward from the blockage
		const SPEED_VW_S = 12; // drive-off speed — matches normal traffic's on-screen pace
		const ARRIVE_SPEED_VW_S = 11; // arrival a touch slower — cars roll in and brake gently
		const iw = typeof window !== 'undefined' ? window.innerWidth : 1200;
		const entryVw = direction === 'ltr' ? -(280 / iw) * 100 : 100 + (280 / iw) * 100; // off-screen start (keyframe 0%)
		cars = Array.from({ length: FLEET }, (_, i) => {
			const delayMs = 9000 + i * 250; // let a deep snow layer build (~9s) before cars slide in
			const stopVw = BLOCK_VW + sign * (i * 3.6);
			// Arrival uses the same per-car-duration approach as drive-off: duration ∝
			// distance → every car rolls in at the SAME gentle speed (no fixed-time sprint
			// where the far cars zoom). Eased so they decelerate smoothly into the pile.
			const arriveDistVw = Math.abs(stopVw - entryVw);
			const arriveDurMs = Math.min(7500, Math.max(3000, (arriveDistVw / ARRIVE_SPEED_VW_S) * 1000));
			// distance each car covers driving off (to just past its exit edge)
			const travelVw = direction === 'ltr' ? 110 - stopVw : stopVw + 10;
			const leaveDurMs = Math.min(8500, Math.max(3500, (travelVw / SPEED_VW_S) * 1000));
			return {
				id: carId++,
				src: CAR_SRCS[Math.floor(Math.random() * CAR_SRCS.length)],
				stopVw,
				rot: Math.random() * 10 - 5,
				delayMs,
				arriveDurMs,
				fxDelayMs: delayMs + arriveDurMs * 0.8, // crash fx as it skids into the pile (~80% in)
				// Jam clears front-first: each car only pulls away once the one ahead has
				// opened a gap (~0.55s), plus a little reaction jitter — not all at once.
				leaveDelay: i * 550 + Math.random() * 180,
				leaveDurMs,
				// Stuck-in-the-jam fidget: each car bumps the one ahead + flashes a 💢 on
				// its OWN cycle (varied period) starting once it has settled, so the anger
				// ripples one-by-one through the pile instead of everyone twitching at once.
				angryDurMs: 1500 + Math.random() * 1500, // 1.5–3.0s per bump cycle (varied → desynced)
				angryDelayMs: delayMs + arriveDurMs + 150 + Math.random() * 700, // begin right after it parks
				angrySymbol: ANGRY_SYMBOLS[Math.floor(Math.random() * ANGRY_SYMBOLS.length)]
			};
		});

		// lifecycle: deep snow builds → cars slide in & crash → snow stops & MELTS away → only then cars drive off
		setTimeout(() => {
			groundOut = true; // snow stops falling; settled snow starts melting (reverse-grow)
		}, 18000);
		setTimeout(() => {
			leaving = true; // melt finished — road clear, pile-up drives off
			snowFreeze.set(false); // ...and normal traffic moves again
		}, 21500);
		setTimeout(() => endEvent(), 36500); // sequential drive-off (~0.55s apart) → longer tail
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

{#each cars as car, i (car.id)}
	<div
		class="snow-car-wrap {direction}"
		class:leaving
		class:bumped-hard={bumped[car.id]?.level === 2}
		class:bumped-soft={bumped[car.id]?.level === 1}
		style="--stop: {car.stopVw}vw; --rot: {car.rot}deg; --delay: {car.delayMs}ms; --arrive-dur: {car.arriveDurMs}ms; --fx-delay: {car.fxDelayMs}ms; --leave-delay: {car.leaveDelay}ms; --leave-dur: {car.leaveDurMs}ms; --angry-dur: {car.angryDurMs}ms; --angry-delay: {car.angryDelayMs}ms;"
	>
		<button class="snow-car-btn" onclick={() => bumpCar(i)} aria-label="Bil i snekø">
			<img src={car.src} alt="" aria-hidden="true" draggable="false" class="snow-car" />
		</button>
		<span class="anger-mark" aria-hidden="true">{car.angrySymbol}</span>
		{#if bumped[car.id]}
			<div class="bump-fx" aria-hidden="true">
				{#if bumped[car.id].level === 2}
					<span class="bump-sym">{bumped[car.id].sym}</span>
					<span class="bump-honk">!</span>
				{/if}
				<span class="bump-smoke b1"></span><span class="bump-smoke b2"></span>
			</div>
		{/if}
		<span class="jam-dust d1" aria-hidden="true"></span>
		<span class="jam-dust d2" aria-hidden="true"></span>
		<span class="jam-dust d3" aria-hidden="true"></span>
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
	/* Per-car duration (∝ distance, like the drive-off) so every car rolls in at the
	   same gentle speed, with a strong ease-out → decelerates smoothly into the pile
	   (overshoot + skid on the snow), instead of a fast, flat 2.8s slide. */
	.snow-car-wrap.ltr { animation: snowcar-ltr var(--arrive-dur, 4s) cubic-bezier(0.16, 1, 0.3, 1) var(--delay) both; }
	.snow-car-wrap.rtl { animation: snowcar-rtl var(--arrive-dur, 4s) cubic-bezier(0.16, 1, 0.3, 1) var(--delay) both; }
	/* once the snow clears, the pile drives off (front first) instead of fading */
	/* linear + per-car duration → drives off at a steady, normal-traffic speed.
	   `both` so each car holds its pile spot through its stagger delay (the 0%
	   keyframe = translateX(--stop)) instead of snapping to the left edge first. */
	.snow-car-wrap.leaving.ltr { animation: snowcar-leave-ltr var(--leave-dur, 6s) linear var(--leave-delay) both; }
	.snow-car-wrap.leaving.rtl { animation: snowcar-leave-rtl var(--leave-dur, 6s) linear var(--leave-delay) both; }
	.snow-car {
		display: block;
		height: 45px;
		width: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
		/* impatient fidget while stuck: a quick lurch into the car ahead once per
		   (varied) cycle, beginning after the car has parked. Each car runs its own
		   period/phase so the bumps ripple one-by-one, not as a synchronized swarm. */
		animation: jam-angry var(--angry-dur, 2.4s) ease-in-out var(--angry-delay, 0s) infinite;
	}
	/* once it pulls away, stop fidgeting */
	.snow-car-wrap.leaving .snow-car { animation: none; }

	.snow-car-btn {
		display: block;
		background: none;
		border: 0;
		padding: 0;
		margin: 0;
		cursor: pointer;
		pointer-events: auto;
	}
	/* click bump: clicked car slams into its neighbour; shoved neighbours move less.
	   More specific than the jam-angry rule so it takes over for the one-shot. */
	.snow-car-wrap.bumped-hard .snow-car { animation: snow-bump-hard 0.55s ease-out; }
	.snow-car-wrap.bumped-soft .snow-car { animation: snow-bump-soft 0.55s ease-out; }

	.bump-fx { position: absolute; left: 50%; bottom: 0; width: 0; height: 0; z-index: 3; pointer-events: none; }
	.bump-sym { position: absolute; left: -9px; top: -28px; font-size: 17px; line-height: 1; animation: honk-pop 0.6s ease-out forwards; }
	.bump-honk {
		position: absolute;
		left: 7px;
		top: -24px;
		font: 800 18px/1 system-ui, sans-serif;
		color: #ffd24a;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		animation: honk-pop 0.6s ease-out forwards;
	}
	.bump-smoke {
		position: absolute;
		bottom: -4px;
		width: 17px;
		height: 17px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(120, 120, 120, 0.7), rgba(120, 120, 120, 0) 70%);
		opacity: 0;
		animation: crash-smoke 0.8s ease-out forwards;
	}
	.bump-smoke.b1 { --sx: -13px; left: -11px; }
	.bump-smoke.b2 { --sx: 13px; left: 4px; animation-delay: 80ms; }

	/* 💢 anger mark — pops above the car in sync with its bump */
	.anger-mark {
		position: absolute;
		top: -8px;
		left: 50%;
		font-size: 13px;
		line-height: 1;
		opacity: 0;
		pointer-events: none;
		z-index: 3;
		transform: translateX(-50%) scale(0.4);
		animation: anger-pop var(--angry-dur, 2.4s) ease-out var(--angry-delay, 0s) infinite;
	}
	.snow-car-wrap.leaving .anger-mark { animation: none; opacity: 0; }

	/* Snow/dust kicked up at the wheels each time the car lurches into the one ahead. */
	.jam-dust {
		position: absolute;
		bottom: 1px;
		left: 50%;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(228, 235, 245, 0.75), rgba(228, 235, 245, 0) 70%);
		opacity: 0;
		pointer-events: none;
		z-index: 1; /* under the car body */
		transform: translate(-50%, 0) scale(0.2);
		animation: jam-dust-puff var(--angry-dur, 2.4s) ease-out var(--angry-delay, 0s) infinite;
	}
	.jam-dust.d1 { --ddx: -11px; }
	.jam-dust.d2 { --ddx: 9px; }
	.jam-dust.d3 { --ddx: -2px; width: 7px; height: 7px; }
	.snow-car-wrap.leaving .jam-dust { animation: none; opacity: 0; }

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

	/* click bump: a bigger slam forward + recoil (clicked car), and a lighter shove
	   for the neighbours it rams into. */
	@keyframes snow-bump-hard {
		0% { transform: translate(0, 0) rotate(0deg); }
		28% { transform: translate(9px, 0) rotate(5deg); }
		54% { transform: translate(-4px, 0) rotate(-3deg); }
		78% { transform: translate(2px, 0) rotate(1deg); }
		100% { transform: translate(0, 0) rotate(0deg); }
	}
	@keyframes snow-bump-soft {
		0% { transform: translate(0, 0) rotate(0deg); }
		35% { transform: translate(5px, 0) rotate(3deg); }
		68% { transform: translate(-2px, 0) rotate(-1.5deg); }
		100% { transform: translate(0, 0) rotate(0deg); }
	}

	/* Stuck-jam fidget: mostly idle, then a quick lurch into the car ahead and a
	   bump-back recoil. Small (cars are 45px) but reads as impatient/angry. */
	@keyframes jam-angry {
		0%, 76%, 100% { transform: translate(0, 0) rotate(0deg); }
		82% { transform: translate(3px, 0) rotate(2deg); }      /* lurch into the car ahead */
		87% { transform: translate(-2px, 0) rotate(-1.5deg); }  /* recoil */
		93% { transform: translate(1px, 0) rotate(0.5deg); }    /* settle */
	}
	/* 💢 flashes up in sync with the lurch, then fades as it rises */
	@keyframes anger-pop {
		0%, 76%, 100% { opacity: 0; transform: translateX(-50%) scale(0.4); }
		82% { opacity: 1; transform: translateX(-50%) translateY(-3px) scale(1.15); }
		93% { opacity: 0.85; transform: translateX(-50%) translateY(-7px) scale(1); }
	}
	/* dust puff fires with the lurch, then drifts out (per-puff via --ddx) and fades */
	@keyframes jam-dust-puff {
		0%, 80% { opacity: 0; transform: translate(-50%, 0) scale(0.2); }
		86% { opacity: 0.6; transform: translate(calc(-50% + var(--ddx, 0px) * 0.35), -2px) scale(0.85); }
		98% { opacity: 0; transform: translate(calc(-50% + var(--ddx, 0px)), -5px) scale(1.3); }
		100% { opacity: 0; transform: translate(-50%, 0) scale(0.2); }
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
