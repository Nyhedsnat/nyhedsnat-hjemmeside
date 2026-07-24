<script lang="ts">
	import { onMount } from 'svelte';
	import { snowFreeze, snowPuddles } from '$lib/stores/snow';
	import { fleetRef } from '$lib/stores/vehicleFleet';
	import { vehicleTypes, OFFSCREEN_MARGIN_PX } from '$lib/vehicles';
	import type { CloudProps } from '$lib/clouds';
	import './clouds/cloudBase.css';

	// Self-contained "snow cloud → snowstorm → 12-car pile-up" easter egg, a member of
	// the cloud family: the scheduler (WeatherClouds) mounts it when it's snow's turn
	// and passes the same CloudProps as every other cloud. Click it to set off the storm.
	//
	// The pile-up cars are REAL fleet vehicles (spawned via fleetRef into Vehicles.svelte),
	// not a parallel car system — arrive/park/leave is a motionOverride, parked-click-to-
	// bump is a clickOverride, the ambient jam fidget is an extraClass, crash-fx/bump-fx/
	// anger-mark are a carFx snippet, jam-dust is a roadFx snippet. Once a car leaves the
	// jam (clickOverride cleared), it's a completely normal vehicle again — same click-egg
	// pipeline as regular traffic, for free.
	let { mode = 'drift', direction = 'ltr', drift = 45, left = '0%', ondone }: CloudProps = $props();

	// Mix of anger/frustration marks — each stuck car flashes its own, so the pile
	// shows a variety rather than the same symbol everywhere.
	// 🤬 is reserved exclusively for the car that was actually clicked (see bumpCar) —
	// never used here, so shoved neighbours always read as visibly different/lesser.
	const CLICK_SYMBOL = '🤬';
	const ANGRY_SYMBOLS = ['💢', '😡', '💥', '😤', '‼️', '😠', '🗯️', '⁉️'];

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
	const FLEET = 12; // keep the whole pile-up on screen
	// Fixed PIXELS, not vw — cars render at a fixed pixel height/width regardless of
	// viewport, but vw scales with it. A vw-based gap meant cars barely touched on a
	// narrow screen and had a visible gap on a wide one. ~58px ≈ one car's own length
	// (bumper just touching the one ahead), converted to vw per-storm via `iw` below.
	const CAR_GAP_PX = 58;
	// preset fidget timings (varied but not per-car-random) so the jam doesn't twitch in
	// lockstep. `dur` doubled vs the wobble's natural feel → half as many anger-mark pops.
	const VARIANTS = [
		{ dur: 3.6, delay: 0 },
		{ dur: 4.2, delay: 0.4 },
		{ dur: 4.8, delay: 0.9 },
		{ dur: 3.2, delay: 1.3 },
		{ dur: 5.4, delay: 1.7 }
	];

	let cloudVisible = $state(false);
	let cloudActive = $state(false);
	let eventActive = $state(false);
	let snowing = $state(false);
	let groundOut = $state(false); // fade the settled snow (and falling snow) away
	let leaving = $state(false); // pile-up drives off (used for the crash-fx/jam-dust snippets)
	let snowmanUp = $state(false); // snowman only starts building once the pile has halted
	let snowmanX = $state(78); // random spot per storm, on the clear side of the pile (vw)
	let snowmanMelted = $state(false); // clicked snowman → melts early to a puddle
	let puddleDropped = false; // guard: drop exactly one permanent puddle per snowman

	// The instant the snowman starts melting (click OR the ground melt), leave a permanent
	// puddle in the persistent store — it outlives this component so the mark stays forever.
	$effect(() => {
		if (snowmanUp && (snowmanMelted || groundOut) && !puddleDropped) {
			puddleDropped = true;
			snowPuddles.update((p) => [...p, { x: snowmanX }]);
		}
	});

	type PileCar = { id: number; stopVw: number; rot: number };
	let pileCars: PileCar[] = []; // plain array — only read by closures, not rendered directly
	let carConfigs = $state<Record<number, { fxDelayMs: number; angrySymbol: string; variant: number }>>({});
	let bumped = $state<Record<number, { level: number; sym: string }>>({}); // id → click-bump (2=hit, 1=shoved neighbour)

	// Click a stuck car → it VIOLENTLY lurches into the car ahead/behind; those
	// neighbours get shoved hard too. Honk + 🤬 + smoke on the one clicked.
	function setBump(id: number, level: number, sym: string) {
		bumped = { ...bumped, [id]: { level, sym } };
		// swap the fidget class for the one-shot bump-shake, then resume fidgeting
		const api = fleetRef.current;
		const variant = carConfigs[id]?.variant ?? 0;
		api?.setExtraClass(id, level === 2 ? 'bumped-hard' : 'bumped-soft');
		setTimeout(() => {
			const next = { ...bumped };
			delete next[id];
			bumped = next;
			fleetRef.current?.setExtraClass(id, `jam-angry-${variant}`);
		}, 2600); // 4x — long enough for bump-sym's own longer linger to actually finish
	}
	// Shared forward-nudge: a temporary shove layered on top of a car's own resting
	// animation (fill: 'none' hands control straight back once it's done, so it never
	// permanently moves the car's parked spot). Used by both the arrival chain-reaction
	// and the click-bump, so the two "something hit me" reactions stay one mechanism.
	function pushForward(target: PileCar, pxAmount: number) {
		fleetRef.current?.setMotionOverride(target.id, (el) => {
			const stopTx = `${target.stopVw}vw`;
			const push = direction === 'ltr' ? pxAmount : -pxAmount;
			const wobble = direction === 'ltr' ? 2 : -2;
			const restRot = direction === 'ltr' ? -target.rot * 0.75 : target.rot * 0.75;
			el.animate(
				[
					{ transform: `translateX(${stopTx}) rotate(${restRot}deg)` },
					{ transform: `translateX(calc(${stopTx} + ${push}px)) rotate(${wobble}deg)`, offset: 0.55 },
					{ transform: `translateX(${stopTx}) rotate(${restRot}deg)` }
				],
				{ duration: 700, easing: 'ease-out', fill: 'none' }
			);
		});
	}

	// Chain reaction, not a synced group shove: the clicked car lurches forward+back
	// on its own first, THEN (once that push has actually reached the car ahead/behind)
	// the neighbours get shaken — a beat apart, not all three moving as one blob.
	const BUMP_REACTION_MS = 220;

	function bumpCar(id: number) {
		if (leaving) return; // already driving off — a normal car again, no more bumping
		const i = pileCars.findIndex((c) => c.id === id);
		if (i < 0) return;
		// The clicked car ALWAYS shows 🤬 — reserved for this, never shown any other way.
		// Shoved neighbours get a fresh random pick from the rest of the pool each time,
		// a real forward nudge (not just an in-place shake), and a bit of dust.
		setBump(id, 2, CLICK_SYMBOL);
		const ahead = pileCars[i - 1];
		const behind = pileCars[i + 1];
		if (ahead) {
			setTimeout(() => {
				setBump(ahead.id, 1, ANGRY_SYMBOLS[Math.floor(Math.random() * ANGRY_SYMBOLS.length)]);
				pushForward(ahead, 34);
			}, BUMP_REACTION_MS);
		}
		if (behind) {
			setTimeout(() => {
				setBump(behind.id, 1, ANGRY_SYMBOLS[Math.floor(Math.random() * ANGRY_SYMBOLS.length)]);
				pushForward(behind, 34);
			}, BUMP_REACTION_MS * 2); // behind reacts after the hit has passed through ahead first
		}
	}

	// Bumped on every storm start. The cloud's re-click guard is `cloudActive` (matches
	// the CSS pause — clickable the instant it's actually moving again, same rule as
	// every other cloud), but snow's async tail (pile driving off, then endEvent) runs
	// well past that point. A re-click there starts a NEW storm while the old one's
	// timers are still pending — each one checks `storm === myStorm` before touching
	// shared state, so a superseded storm's leftover timers no-op instead of resetting
	// the new storm's flags or removing its cars.
	let storm = 0;

	function startEvent() {
		const api = fleetRef.current;
		if (cloudActive || !cloudVisible || !api) return;
		const myStorm = ++storm;
		eventActive = true;
		cloudActive = true; // freezes the drift + darkens the cloud
		snowing = true;
		snowFreeze.set(true); // stop new cars spawning right away (existing cars halt 5s later — see Vehicles)
		groundOut = false;
		leaving = false;
		snowmanUp = false;
		snowmanMelted = false;
		puddleDropped = false;
		// random spot on the clear side (opposite the pile: ltr jam ~12-52vw, rtl ~52-92vw)
		snowmanX = (direction === 'ltr' ? 58 : 10) + Math.random() * 32;

		const sign = direction === 'ltr' ? -1 : 1; // pile grows backward from the blockage
		const SPEED_VW_S = 12; // drive-off speed — matches normal traffic's on-screen pace
		const ARRIVE_SPEED_VW_S = 6.875; // half speed, +25% on top — cars roll in and brake gently
		const iw = typeof window !== 'undefined' ? window.innerWidth : 1200;
		const entryVw = direction === 'ltr' ? -(OFFSCREEN_MARGIN_PX / iw) * 100 : 100 + (OFFSCREEN_MARGIN_PX / iw) * 100; // off-screen start — matches startTx below

		pileCars = [];
		carConfigs = {};

		for (let i = 0; i < FLEET; i++) {
			// let a deep snow layer build before cars slide in, but finish arriving with a
			// buffer before groundOut (19000ms) — base was 9000ms when groundOut was 23000ms.
			const delayMs = 5000 + i * 250;
			const stopVw = BLOCK_VW + sign * (i * (CAR_GAP_PX / iw) * 100);
			const rot = Math.random() * 28 - 14; // wide violent tilt on impact
			// Arrival duration ∝ distance → every car rolls in at the same gentle speed
			// (no fixed-time sprint where the far cars zoom), eased into an overshoot+skid.
			const arriveDistVw = Math.abs(stopVw - entryVw);
			const arriveDurMs = Math.min(12000, Math.max(4800, (arriveDistVw / ARRIVE_SPEED_VW_S) * 1000));
			const src = CAR_SRCS[Math.floor(Math.random() * CAR_SRCS.length)];
			const typeIndex = vehicleTypes.findIndex((v) => v.src === src);
			const variant = i % VARIANTS.length;

			const id = api.spawnVehicle({
				typeIndex,
				direction,
				duration: 9999, // inert — motionOverride replaces the CSS drive entirely
				clickOverride: bumpCar, // parked → click shoves neighbours, no normal egg
				extraClass: `jam-angry-${variant}`,
				carFx,
				roadFx,
				motionOverride: (el) => {
					el.style.animation = 'none'; // kill the default drive-ltr/rtl
					const startTx = direction === 'ltr' ? `-${OFFSCREEN_MARGIN_PX}px` : `calc(100vw + ${OFFSCREEN_MARGIN_PX}px)`;
					const stop = `${stopVw}vw`;
					const r = rot;
					// Physics: momentum only ever carries FORWARD into the pile — a real crash
					// doesn't glide backward and forward again, it slams forward hard (impact
					// at 45% in), then ONE small backward recoil (crumple rebound), then it's
					// simply stopped. No lingering back-and-forth oscillation. Overshoot is
					// deliberately SMALLER than CAR_GAP_PX (58px) — it's the amount a crumple
					// zone compresses on impact, not a distance that drives through the car
					// it just hit. Collision = the moment it reaches this peak, not a delayed
					// "glide past, then come back" swing.
					const kf: Keyframe[] =
						direction === 'ltr'
							? [
									{ transform: `translateX(${startTx}) rotate(0deg)` },
									{ transform: `translateX(calc(${stop} + 28px)) rotate(${r}deg)`, offset: 0.45 },
									{ transform: `translateX(calc(${stop} - 10px)) rotate(${-r * 0.5}deg)`, offset: 0.61 },
									{ transform: `translateX(${stop}) rotate(${-r * 0.75}deg)` }
								]
							: [
									{ transform: `translateX(${startTx}) rotate(0deg)` },
									{ transform: `translateX(calc(${stop} - 28px)) rotate(${-r}deg)`, offset: 0.45 },
									{ transform: `translateX(calc(${stop} + 10px)) rotate(${r * 0.5}deg)`, offset: 0.61 },
									{ transform: `translateX(${stop}) rotate(${r * 0.75}deg)` }
								];
					// fill: 'both' (not just 'forwards') — with a multi-second delay, 'forwards'
					// has NO effect during the delay itself, so the car would sit at its
					// default (no-transform) position — visibly at the road's edge — for the
					// whole 9-15s snow-build wait instead of staying off-screen until it's
					// actually time to slide in.
					el.animate(kf, { duration: arriveDurMs, delay: delayMs, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'both' });
				}
			});

			const impactMs = delayMs + arriveDurMs * 0.45;
			pileCars.push({ id, stopVw, rot });
			carConfigs[id] = {
				fxDelayMs: impactMs, // crash fx right AT impact — same checkpoint the motion itself uses
				angrySymbol: ANGRY_SYMBOLS[Math.floor(Math.random() * ANGRY_SYMBOLS.length)], // ambient pop — never 🤬, that's click-only
				variant
			};

			// Chain reaction: the car it just hit (the one ahead, already parked) gets
			// shoved a bit further forward too — that's where the force actually goes.
			// Same pushForward() the click-bump uses.
			if (i > 0) {
				const ahead = pileCars[i - 1];
				setTimeout(() => pushForward(ahead, 50), impactMs);
			}
		}

		// lifecycle: deep snow builds → cars slide in & crash → pile sits (snowman builds
		// on the halted, snowed-in road) → snow stops & MELTS away → only then cars drive off
		setTimeout(() => {
			if (storm !== myStorm) return; // superseded by a re-click — old storm's timers stand down
			snowmanUp = true; // pile has parked & traffic is frozen — NOW the snowman builds
		}, 15000);
		setTimeout(() => {
			if (storm !== myStorm) return;
			groundOut = true; // snow stops falling; settled snow (and the snowman) start melting
		}, 19000);
		setTimeout(() => {
			if (storm !== myStorm) return;
			leaving = true; // melt finished — road clear, pile-up drives off
			snowFreeze.set(false); // ...and normal traffic moves again
			cloudActive = false; // un-park the cloud the instant the cars start driving, not at full cleanup
			const exitMarginVw = (OFFSCREEN_MARGIN_PX / iw) * 100; // matches the actual off-frame exit distance
			let maxFinishMs = 0;
			// Jam clears front-first: each car only pulls away once the one ahead has
			// opened a gap (~0.55s), plus a little reaction jitter — not all at once.
			pileCars.forEach((car, i) => {
				const leaveDelay = i * 550 + Math.random() * 180;
				const travelVw = direction === 'ltr' ? 100 + exitMarginVw - car.stopVw : car.stopVw + exitMarginVw;
				const leaveDurMs = Math.min(8500, Math.max(3500, (travelVw / SPEED_VW_S) * 1000));
				maxFinishMs = Math.max(maxFinishMs, leaveDelay + leaveDurMs);
				setTimeout(() => {
					const liveApi = fleetRef.current;
					if (!liveApi) return;
					liveApi.setClickOverride(car.id, undefined); // normal click-egg again
					liveApi.setExtraClass(car.id, undefined); // stop fidgeting
					liveApi.setMotionOverride(car.id, (el) => {
						const end = direction === 'ltr' ? `calc(100vw + ${OFFSCREEN_MARGIN_PX}px)` : `-${OFFSCREEN_MARGIN_PX}px`;
						const tilt = direction === 'ltr' ? -car.rot * 0.75 : car.rot * 0.75; // matches the arrive keyframes' settle tilt
						el.animate(
							[
								{ transform: `translateX(${car.stopVw}vw) rotate(${tilt}deg)` },
								// straightens out FIRST, right as it pulls out — not a slow un-tilt
								// spread across the whole crossing.
								{ transform: `translateX(${car.stopVw}vw) rotate(0deg)`, offset: 0.06 },
								{ transform: `translateX(${end}) rotate(0deg)` }
							],
							{ duration: leaveDurMs, easing: 'linear', fill: 'forwards' }
						);
					});
				}, leaveDelay);
			});
			// Safety-net cleanup, timed off the ACTUAL slowest car's real finish time —
			// not a hand-tuned constant that silently goes stale (and starts cutting cars
			// off mid-drive) every time speed/duration/stagger constants change upstream.
			setTimeout(() => {
				if (storm === myStorm) endEvent();
			}, maxFinishMs + 3000);
		}, 26500);
	}

	function endEvent() {
		// Safety net: any car whose leave animation hasn't cleared the frame yet (off-frame
		// removal usually already got it) is force-removed so a storm never leaves stragglers.
		const api = fleetRef.current;
		if (api) for (const c of pileCars) api.removeVehicle(c.id);
		pileCars = [];
		carConfigs = {};
		eventActive = false;
		snowing = false;
		groundOut = false;
		leaving = false;
		snowmanUp = false;
		snowmanMelted = false;
		cloudActive = false; // un-freeze: cloud resumes drifting from where it parked
		snowFreeze.set(false); // safety: never leave traffic frozen
	}

	// Cloud finished drifting across (after a storm it resumes from where it parked,
	// then finishes here) → tell the scheduler this snow cloud is done.
	function onCloudDriftEnd() {
		if (eventActive) return; // still storming (drift paused) — ignore
		cloudVisible = false;
		if (mode === 'drift') ondone?.(); // scheduler brings the next cloud along
	}

	onMount(() => {
		cloudVisible = true; // the scheduler mounted us because it's snow's turn
	});
</script>

<!-- Car-attached decoration (rides through the arrive/leave motion): crash-fx sparks
     on arrival + the click-bump honk/smoke/symbol/dust + the ambient anger-mark. 🤬
     (CLICK_SYMBOL) is reserved for the car that was actually clicked (level 2) — never
     shown any other way. The ambient pop and the shoved-neighbour pick both draw from
     ANGRY_SYMBOLS, which never contains 🤬. -->
{#snippet carFx(id: number)}
	{@const cfg = carConfigs[id]}
	{#if cfg}
		<span class="anger-mark jam-angry-{cfg.variant}" class:leaving aria-hidden="true">{cfg.angrySymbol}</span>
		{#if bumped[id]}
			<div class="bump-fx" aria-hidden="true">
				<span class="bump-sym">{bumped[id].sym}</span>
				{#if bumped[id].level === 2}
					<span class="bump-honk">!</span>
				{/if}
				<span class="bump-smoke b1"></span><span class="bump-smoke b2"></span>
				<span class="bump-dust bd1"></span><span class="bump-dust bd2"></span>
			</div>
		{/if}
		<div class="crash-fx" style="--fx-delay: {cfg.fxDelayMs}ms;" aria-hidden="true">
			<span class="spark s1"></span><span class="spark s2"></span><span class="spark s3"></span><span class="spark s4"></span>
			<span class="spark s5"></span><span class="spark s6"></span>
			<span class="csmoke cm1"></span><span class="csmoke cm2"></span><span class="csmoke cm3"></span>
			<span class="csmoke cm4"></span><span class="csmoke cm5"></span><span class="csmoke cm6"></span>
			<span class="csmoke cm7"></span><span class="csmoke cm8"></span>
			<span class="honk">!</span>
		</div>
	{/if}
{/snippet}

<!-- Ground-relative decoration: dust kicked up at the wheels while stuck in the jam —
     stays at the road, doesn't need to ride the car's own bump/skid transforms. -->
{#snippet roadFx(id: number)}
	{@const cfg = carConfigs[id]}
	{#if cfg && !leaving}
		<span class="jam-dust d1 jam-angry-{cfg.variant}" aria-hidden="true"></span>
		<span class="jam-dust d2 jam-angry-{cfg.variant}" aria-hidden="true"></span>
		<span class="jam-dust d3 jam-angry-{cfg.variant}" aria-hidden="true"></span>
	{/if}
{/snippet}

{#if cloudVisible}
	<button
		type="button"
		class="cloud snow {mode === 'static' ? 'debug' : direction}"
		class:active={cloudActive}
		style={mode === 'static' ? `left:${left};` : `--drift:${drift}s;`}
		onclick={startEvent}
		onanimationend={onCloudDriftEnd}
		aria-label="Snesky"
	>
		<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
		<span class="cloud-snow" aria-hidden="true">
			{#each Array(7) as _, i}
				<span class="cf" style="left: {8 + i * 12}px; --d: {2.2 + (i % 3) * 0.5}s; --delay: {-(i % 5) * 0.6}s; --sway: {8 + (i % 3) * 4}px;"></span>
			{/each}
		</span>
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

<!-- Snowman: builds only once the pile-up has halted (snowmanUp), off to the clear side
     of the jam. Click → melts early to a puddle; otherwise melts with the ground. Its
     timing is just a fixed delay after the storm starts — it doesn't need to be tied to
     any specific car, so it isn't touched by the fleet migration at all. -->
{#if snowmanUp}
	<button
		type="button"
		class="snowman {direction}"
		class:melting={snowmanMelted || groundOut}
		style="--sx: {snowmanX}vw;"
		onclick={() => (snowmanMelted = true)}
		aria-label="Snemand"
	>
		<span class="ball b-bottom"></span>
		<span class="ball b-mid"></span>
		<span class="ball b-head">
			<span class="eye e-l"></span><span class="eye e-r"></span>
			<span class="nose"></span>
		</span>
		<span class="arm arm-l"></span><span class="arm arm-r"></span>
	</button>
{/if}

<style>
	/* ---- cloud (trigger) ---- */
	/* Uses the SHARED .cloud skeleton (position/size/drift/active/debug) from
	   cloudBase.css, same as every other cloud type — only the snow-specific puff
	   colour (cloudBase.css's .cloud.snow rule) and the drip decoration below are
	   local to this component. */
	/* a bit of snow always drifting down under the cloud (part of its look) */
	.cloud-snow { position: absolute; left: 50%; top: 30px; width: 84px; height: 46px; transform: translateX(-50%); pointer-events: none; z-index: -1; }
	.cf {
		position: absolute;
		top: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: radial-gradient(circle, #fff 40%, rgba(255, 255, 255, 0.55) 100%);
		box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
		animation: cloud-snowfall var(--d, 2.4s) ease-in-out var(--delay, 0s) infinite;
	}
	/* slow, wavy drift (sways side to side) → clearly snow, not straight rain streaks */
	@keyframes cloud-snowfall {
		0% { transform: translate(0, 0); opacity: 0; }
		15% { opacity: 0.95; }
		35% { transform: translate(var(--sway, 8px), 15px); }
		65% { transform: translate(calc(var(--sway, 8px) * -1), 30px); }
		100% { transform: translate(0, 44px); opacity: 0.1; }
	}
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
		top: 18%; /* spawn at the cloud's own height (cloudBase.css .cloud top), not the container top */
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

	/* ---- pile-up car decorations (rendered via carFx/roadFx into the fleet's own
	   vehicle-container/.vfx — see Vehicles.svelte) ---- */

	/* Stuck-jam fidget: mostly idle, then a quick lurch into the car ahead and a
	   bump-back recoil. Applied to the fleet's .vfx via extraClass. 5 preset
	   variants (not per-car-random) so the jam doesn't twitch in perfect lockstep. */
	@keyframes jam-angry {
		0%, 76%, 100% { transform: translate(0, 0) rotate(0deg); }
		82% { transform: translate(3px, 0) rotate(2deg); }      /* lurch into the car ahead */
		87% { transform: translate(-2px, 0) rotate(-1.5deg); }  /* recoil */
		93% { transform: translate(1px, 0) rotate(0.5deg); }    /* settle */
	}
	.jam-angry-0 { animation: jam-angry 3.6s ease-in-out 0s infinite; }
	.jam-angry-1 { animation: jam-angry 4.2s ease-in-out 0.4s infinite; }
	.jam-angry-2 { animation: jam-angry 4.8s ease-in-out 0.9s infinite; }
	.jam-angry-3 { animation: jam-angry 3.2s ease-in-out 1.3s infinite; }
	.jam-angry-4 { animation: jam-angry 5.4s ease-in-out 1.7s infinite; }

	/* click bump: clicked car slams VIOLENTLY into its neighbour; the neighbours it hits
	   get shoved hard too (slightly less than the car that started it, but still a real
	   hit, not a nudge). */
	:global(.vfx.bumped-hard) { animation: snow-bump-hard 0.9s ease-out !important; }
	:global(.vfx.bumped-soft) { animation: snow-bump-soft 0.9s ease-out !important; }
	/* One push, one settle — not a springy multi-bounce. Forward hard, a single small
	   recoil, done. */
	@keyframes snow-bump-hard {
		0% { transform: translate(0, 0) rotate(0deg); }
		45% { transform: translate(30px, 0) rotate(14deg); }
		70% { transform: translate(-8px, 0) rotate(-4deg); }
		100% { transform: translate(0, 0) rotate(0deg); }
	}
	@keyframes snow-bump-soft {
		0% { transform: translate(0, 0) rotate(0deg); }
		45% { transform: translate(14px, 0) rotate(7deg); }
		70% { transform: translate(-4px, 0) rotate(-2deg); }
		100% { transform: translate(0, 0) rotate(0deg); }
	}

	.bump-fx { position: absolute; left: 50%; bottom: 0; width: 0; height: 0; z-index: 3; pointer-events: none; }
	/* 4x honk-pop's effective visible lifetime — pops in the same way but HOLDS
	   visible much longer before fading, instead of fading out almost immediately. */
	.bump-sym { position: absolute; left: -9px; top: -28px; font-size: 17px; line-height: 1; animation: symbol-linger 2.4s ease-out forwards; }
	@keyframes symbol-linger {
		0% { opacity: 0; transform: translateY(2px) scale(0.6); }
		10% { opacity: 1; transform: translateY(-2px) scale(1.1); }
		20% { opacity: 1; transform: translateY(-4px) scale(1); }
		88% { opacity: 1; transform: translateY(-4px) scale(1); }
		100% { opacity: 0; transform: translateY(-10px) scale(0.9); }
	}
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

	/* a bit of dust kicked up at the wheels the instant a bump lands — a one-shot puff,
	   not the looping ambient jam-dust below */
	.bump-dust {
		position: absolute;
		bottom: -3px;
		width: 10px;
		height: 8px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(210, 198, 176, 0.8), rgba(210, 198, 176, 0) 70%);
		opacity: 0;
		animation: bump-dust-puff 0.55s ease-out forwards;
	}
	.bump-dust.bd1 { left: -16px; }
	.bump-dust.bd2 { left: 10px; animation-delay: 60ms; }
	@keyframes bump-dust-puff {
		0% { opacity: 0; transform: translateY(0) scale(0.3); }
		20% { opacity: 0.85; }
		100% { opacity: 0; transform: translateY(-10px) scale(1.6); }
	}

	/* 💢 ambient anger mark — pops above the car on its own jam-angry cycle. Never 🤬
	   (that pool is ANGRY_SYMBOLS, which excludes it). Stops once it's driving off. */
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
	}
	.anger-mark.jam-angry-0 { animation: anger-pop 3.6s ease-out 0s infinite; }
	.anger-mark.jam-angry-1 { animation: anger-pop 4.2s ease-out 0.4s infinite; }
	.anger-mark.jam-angry-2 { animation: anger-pop 4.8s ease-out 0.9s infinite; }
	.anger-mark.jam-angry-3 { animation: anger-pop 3.2s ease-out 1.3s infinite; }
	.anger-mark.jam-angry-4 { animation: anger-pop 5.4s ease-out 1.7s infinite; }
	.anger-mark.leaving { animation: none; opacity: 0; }
	@keyframes anger-pop {
		0%, 76%, 100% { opacity: 0; transform: translateX(-50%) scale(0.4); }
		82% { opacity: 1; transform: translateX(-50%) translateY(-3px) scale(1.15); }
		93% { opacity: 0.85; transform: translateX(-50%) translateY(-7px) scale(1); }
	}

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
	}
	.jam-dust.d1 { --ddx: -11px; }
	.jam-dust.d2 { --ddx: 9px; }
	.jam-dust.d3 { --ddx: -2px; width: 7px; height: 7px; }
	.jam-dust.jam-angry-0 { animation: jam-dust-puff 3.6s ease-out 0s infinite; }
	.jam-dust.jam-angry-1 { animation: jam-dust-puff 4.2s ease-out 0.4s infinite; }
	.jam-dust.jam-angry-2 { animation: jam-dust-puff 4.8s ease-out 0.9s infinite; }
	.jam-dust.jam-angry-3 { animation: jam-dust-puff 3.2s ease-out 1.3s infinite; }
	.jam-dust.jam-angry-4 { animation: jam-dust-puff 5.4s ease-out 1.7s infinite; }
	/* dust puff fires with the lurch, then drifts out (per-puff via --ddx) and fades */
	@keyframes jam-dust-puff {
		0%, 80% { opacity: 0; transform: translate(-50%, 0) scale(0.2); }
		86% { opacity: 0.6; transform: translate(calc(-50% + var(--ddx, 0px) * 0.35), -2px) scale(0.85); }
		98% { opacity: 0; transform: translate(calc(-50% + var(--ddx, 0px)), -5px) scale(1.3); }
		100% { opacity: 0; transform: translate(-50%, 0) scale(0.2); }
	}

	/* crash sparks + "!" honk, fired once as the car hits the pile (--fx-delay, inline) */
	.crash-fx {
		position: absolute;
		top: 2px;
		left: 50%;
		width: 0;
		height: 0;
		z-index: 5;
		pointer-events: none;
	}
	/* bigger, faster, further-flying sparks — a hard hit, not a fender-bender */
	.crash-fx .spark {
		position: absolute;
		width: 6px;
		height: 6px;
		border-radius: 1px;
		background: #fff3b0;
		box-shadow: 0 0 6px #ffd24a;
		opacity: 0;
		animation: spark-pop 0.5s ease-out var(--fx-delay) forwards;
	}
	.crash-fx .s1 { --dx: -34px; --dy: -24px; }
	.crash-fx .s2 { --dx: 30px; --dy: -28px; }
	.crash-fx .s3 { --dx: -16px; --dy: -38px; }
	.crash-fx .s4 { --dx: 22px; --dy: -14px; }
	.crash-fx .s5 { --dx: -26px; --dy: -6px; }
	.crash-fx .s6 { --dx: 12px; --dy: -40px; }
	/* the impact is mostly a big, dense smoke burst — the car practically vanishes
	   into it for a moment, several overlapping puffs instead of two thin ones */
	.crash-fx .csmoke {
		position: absolute;
		bottom: -6px;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(90, 90, 95, 0.92), rgba(90, 90, 95, 0) 70%);
		opacity: 0;
		animation: crash-smoke 1.4s ease-out var(--fx-delay) forwards;
	}
	.crash-fx .cm1 { --sx: -30px; width: 34px; height: 34px; }
	.crash-fx .cm2 { --sx: 28px; width: 34px; height: 34px; animation-delay: calc(var(--fx-delay) + 60ms); }
	.crash-fx .cm3 { --sx: -12px; width: 40px; height: 40px; animation-delay: calc(var(--fx-delay) + 40ms); }
	.crash-fx .cm4 { --sx: 14px; width: 38px; height: 38px; animation-delay: calc(var(--fx-delay) + 90ms); }
	.crash-fx .cm5 { --sx: 0px; width: 46px; height: 46px; animation-delay: calc(var(--fx-delay) + 20ms); }
	.crash-fx .cm6 { --sx: -46px; width: 26px; height: 26px; animation-delay: calc(var(--fx-delay) + 140ms); }
	.crash-fx .cm7 { --sx: 44px; width: 26px; height: 26px; animation-delay: calc(var(--fx-delay) + 160ms); }
	.crash-fx .cm8 { --sx: 0px; width: 22px; height: 22px; animation-delay: calc(var(--fx-delay) + 220ms); }
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
	/* cloud-drift-ltr/rtl now come from the shared cloudBase.css (.cloud.ltr/.rtl) */

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

	@keyframes crash-smoke {
		0% { opacity: 0; transform: translate(0, 0) scale(0.3); }
		15% { opacity: 0.95; }
		55% { opacity: 0.8; transform: translate(calc(var(--sx) * 0.6), -18px) scale(1.6); }
		100% { opacity: 0; transform: translate(var(--sx), -34px) scale(2.3); }
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

	/* ---- snowman ---- */
	.snowman {
		position: absolute;
		bottom: 8px;
		left: var(--sx, 78vw);
		z-index: 1; /* above the back houses, below the vehicles → cars drive in front of it */
		width: 34px;
		height: 48px;
		transform: translateX(-50%);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
	}
	/* balls centred by explicit left offsets → transform stays free for build/melt */
	.snowman .ball {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(circle at 38% 30%, #ffffff, #dbe7f3 78%);
		box-shadow: inset -2px -3px 4px rgba(150, 170, 190, 0.35);
		transform-origin: 50% 100%;
	}
	.b-bottom { bottom: 0; left: 4px; width: 26px; height: 26px; }
	.b-mid { bottom: 18px; left: 7px; width: 20px; height: 20px; }
	.b-head { bottom: 32px; left: 10px; width: 15px; height: 15px; }
	.eye { position: absolute; top: 5px; width: 2px; height: 2px; border-radius: 50%; background: #2a2a2a; }
	.eye.e-l { left: 4px; }
	.eye.e-r { left: 9px; }
	/* carrot nose — a little orange triangle poking out */
	.nose {
		position: absolute;
		top: 7px;
		left: 11px;
		width: 0;
		height: 0;
		border-left: 6px solid #ff8a2a;
		border-top: 2px solid transparent;
		border-bottom: 2px solid transparent;
	}
	.arm { position: absolute; bottom: 25px; width: 11px; height: 2px; border-radius: 1px; background: #7a4a22; }
	.arm-l { left: -3px; transform: rotate(22deg); transform-origin: right center; }
	.arm-r { right: -3px; transform: rotate(-22deg); transform-origin: left center; }

	/* build: balls pop in bottom→top as the snow deepens; details fade in last */
	.snowman:not(.melting) .ball { animation: ball-build 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
	.snowman:not(.melting) .b-bottom { animation-delay: 0.3s; }
	.snowman:not(.melting) .b-mid { animation-delay: 1.5s; }
	.snowman:not(.melting) .b-head { animation-delay: 2.7s; }
	.snowman:not(.melting) .eye,
	.snowman:not(.melting) .nose,
	.snowman:not(.melting) .arm { opacity: 0; animation: detail-in 0.5s ease-out 3.3s forwards; }

	/* melt: balls slump onto the ground and fade (head first), puddle spreads */
	/* one sphere melts fully before the next starts — delay = previous balls' full
	   2.4s duration each, not a short overlap-stagger. */
	.snowman.melting .ball { animation: ball-melt 2.4s ease-in both; }
	.snowman.melting .b-head { animation-delay: 0s; }
	.snowman.melting .b-mid { animation-delay: 2.4s; }
	.snowman.melting .b-bottom { animation-delay: 4.8s; }
	.snowman.melting .eye,
	.snowman.melting .nose,
	.snowman.melting .arm { animation: detail-out 0.8s ease-in forwards; }

	@keyframes ball-build {
		0% { transform: scaleY(0) scaleX(0.6); opacity: 0; }
		60% { opacity: 1; }
		100% { transform: scale(1); opacity: 1; }
	}
	@keyframes detail-in { from { opacity: 0; } to { opacity: 1; } }
	@keyframes detail-out { from { opacity: 1; } to { opacity: 0; } }
	@keyframes ball-melt {
		0% { transform: translateY(0) scaleY(1) scaleX(1); opacity: 1; }
		100% { transform: translateY(12px) scaleY(0.06) scaleX(1.35); opacity: 0; }
	}
</style>
