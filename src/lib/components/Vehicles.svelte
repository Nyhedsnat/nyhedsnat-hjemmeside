<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { triggerConvoy } from '$lib/stores/convoy';
	import { rushHourTrigger } from '$lib/stores/rushHour';
	import { snowFreeze, snowPuddles } from '$lib/stores/snow';
	import { trafficMode, trafficPulse, abductBeam, abductCaught, abductRelease } from '$lib/stores/traffic';
	import { vehicleTypes, eggFor, type EffectName, type VehicleType, type MotionOp, type Egg } from '$lib/vehicles';
	import { getMotionAnimation } from '$lib/vehicleMotion';
	import { jaggedPath } from '$lib/lightning';
	import VehicleSprite from '$lib/components/VehicleSprite.svelte';


	// When `grid` is true (used by /animation-test) the component renders one
	// stationary vehicle of every type in a grid so each click effect can be
	// previewed and replayed in isolation, instead of spawning live traffic.
	let { grid = false }: { grid?: boolean } = $props();

	interface ActiveVehicle {
		id: number;
		typeIndex: number;
		direction: 'ltr' | 'rtl';
		duration: number;
		eggOverride?: Egg | null; // click behaviour override, mutable post-spawn via setEggOverride (null = no egg at all, e.g. parked)
		underglow?: boolean; // persistent RGB underglow decoration (convoy look) — extension point for future per-vehicle decorations
	}

	// Strategy-pattern overrides: motion + egg (+ speed) are all swappable per vehicle,
	// independent of its type. motionOverride replaces the standard drive-ltr/rtl
	// crossing with a custom WAAPI sequence on that car's own element (same technique
	// as the UFO beam's pin/rise/release) — e.g. arrive → park at a spot → hold, for
	// something like a future snow-pile-up-as-regular-vehicles migration. eggOverride
	// is mutable after spawn (setEggOverride) so a parked car can go egg-less (or
	// angry-honk-only) while stopped, then revert to its normal egg once it drives
	// off again — the override doesn't have to be fixed for the vehicle's whole life.
	type MotionOverride = (el: HTMLDivElement, id: number) => void;

	function setEggOverride(id: number, egg: Egg | null | undefined) {
		activeVehicles = activeVehicles.map((v) => (v.id === id ? { ...v, eggOverride: egg } : v));
	}

	// A convoy is just regular vehicles, spawned in a tight, fast burst with the
	// underglow decoration, instead of a bespoke component re-implementing every
	// weather reaction from scratch. Each car keeps its own normal click egg.
	const CONVOY_TYPES = ['car-1.svg', 'car-2.svg', 'car-3.svg', 'car-4.svg', 'car-5.svg'];
	const CONVOY_COUNT = 10;
	// Spawn stagger. Cars share one duration/speed, so screen-space gap ≈ (crossing
	// distance / duration) * gap — 140ms was tuned for the old single-row convoy, not
	// independent per-car drive animations, and worked out to only ~10-20px between
	// cars (less than a car's own width) → they rendered stacked on top of each other.
	// 700ms was still too tight — bumped further for a clearly-separated row.
	const CONVOY_GAP_MS = 1000;

	const totalWeight = vehicleTypes.reduce((sum, v) => sum + v.weight, 0);
	const minSpawnInterval = 5000;
	const maxSpawnInterval = 15000;
	// `$env/dynamic/public`, not `import.meta.env` — SvelteKit doesn't expose PUBLIC_*
	// to the client via import.meta.env, so the old check was always false in browser.
	const debugTrafficEnabled = env.PUBLIC_DEBUG_TRAFFIC === 'true';
	const spawnRateMultiplier = debugTrafficEnabled ? 5 : 1;

	let vehicleIdCounter = 0;
	let debugSpawnCounter = 0;
	let activeVehicles = $state<ActiveVehicle[]>([]);
	let effects = $state<Record<number, EffectName | undefined>>({});
	let paused = $state<Record<number, boolean>>({});
	let fireActive = $state<Record<number, boolean>>({});
	let trafficFrozen = $state(false); // snowstorm on the road → no new spawns (from snow start)
	let trafficStopped = $state(false); // cars actually halted (after the grace) → clicks just honk
	let angry = $state<Record<number, string>>({}); // id → emoji shown when a stopped car is clicked

	// ---- weather reactions (driven by the cloud eggs via the traffic store) ----
	let wet = $state(false); // rain: wet road → wheel spray
	let leafy = $state(false); // autumn: leaves kicked up from the wheels
	let bouncing = $state(false); // confetti: celebratory hop (all cars)
	let struck = $state<Record<number, boolean>>({}); // thunder: cars hit by a bolt (blacken/smoke)
	let abducting = $state<Record<number, boolean>>({}); // ufo: car floating up the beam
	let dust = $state<Record<number, boolean>>({}); // ufo-release: dust puff when a dropped car lands
	const abductTimers: Record<number, ReturnType<typeof setTimeout>> = {}; // per-car lift→remove timer, cancelled on release
	const abductAnims: Record<number, Animation> = {}; // per-car rise animation, cancelled on release
	let beamPops = $state<{ id: number; x: number; y: number }[]>([]); // sparkle where a car pops out at the cone top
	let popId = 0;
	let carSplash = $state<Record<number, boolean>>({}); // rain: car kicking up water over a puddle
	let modeRate = 1; // current sustained fleet-speed multiplier (so new spawns match)
	let puddleXs: number[] = []; // rain puddle x-centres (vw) — temporary, cleared once evaporated
	let snowPuddleXs: number[] = []; // snowman meltwater x-centres (vw) — permanent for the session
	let puddleRAF: number | null = null;
	const carOverPuddle: Record<number, number> = {}; // id → puddle index it's currently over (-1 none)

	const STUCK_EMOJI = ['💢', '😡', '🤬', '😤', '❗', '‼️'];
	function popAngry(id: number, emoji?: string) {
		angry = { ...angry, [id]: emoji ?? STUCK_EMOJI[Math.floor(Math.random() * STUCK_EMOJI.length)] };
		setTimeout(() => {
			const next = { ...angry };
			delete next[id];
			angry = next;
		}, 1100);
	}

	// Element ref per vehicle. Speed/direction effects (turbo, nitro, uturn)
	// drive the container's own CSS drive-animation via the Web Animations API
	// instead of layering a temporary transform on top of it — the latter made
	// the car snap back to the container's position when the effect ended.
	const containerEls: Record<number, HTMLDivElement> = {};

	function getDriveAnimation(id: number): Animation | undefined {
		const el = containerEls[id];
		return el ? getMotionAnimation(el) : undefined;
	}

	// Temporarily speed the car up (e.g. turbo/nitro), then ease back to normal.
	function boostDrive(id: number, rate: number, ms: number) {
		const anim = getDriveAnimation(id);
		if (!anim) return;
		anim.playbackRate = rate;
		setTimeout(() => {
			try {
				anim.playbackRate = 1;
			} catch {
				/* vehicle already gone */
			}
		}, ms);
	}

	// Send the car back the way it came (u-turn) — it retraces its path and
	// leaves on the side it entered from. A *forward* WAAPI animation back to the
	// entry edge stays on the compositor and runs smoothly; reversing the existing
	// CSS drive with a negative playbackRate dropped to the main thread and stuttered.
	function reverseDrive(id: number, rate = 1.5) {
		const el = containerEls[id];
		if (!el) return;
		const old = getDriveAnimation(id);
		const dir = el.classList.contains('rtl') ? 'rtl' : 'ltr';
		const curX = new DOMMatrixReadOnly(getComputedStyle(el).transform).m41;
		const fullDur = old ? Number(old.effect?.getTiming().duration) || 0 : 0; // ms for a full crossing
		old?.cancel();
		el.style.animation = 'none'; // kill the declarative CSS drive so it can't fight the new one
		// drive keyframes span roughly -250px .. (100vw + 250px)
		const span = window.innerWidth + 500;
		const targetX = dir === 'ltr' ? -(el.offsetWidth + 300) : el.offsetWidth + 300;
		const dist = Math.abs(targetX - curX);
		const speed = fullDur > 0 ? span / fullDur : 0.05; // px per ms at normal drive speed
		const ms = Math.max(300, dist / (speed * Math.abs(rate)));
		el.animate(
			[{ transform: `translateX(${curX}px)` }, { transform: `translateX(${targetX}px)` }],
			{ duration: ms, easing: 'linear', fill: 'forwards' }
		);
	}

	function setEffect(id: number, effect: EffectName, durationMs: number) {
		effects = { ...effects, [id]: effect };
		setTimeout(() => {
			const next = { ...effects };
			delete next[id];
			effects = next;
		}, durationMs);
	}

	function setFireActive(id: number, on: boolean) {
		const next = { ...fireActive };
		if (on) next[id] = true;
		else delete next[id];
		fireActive = next;
	}

	/**
	 * car-5 choreography: smoke first while still rolling → slow down → stop
	 * with the engine on fire → fire dies out but it keeps smoking → only once
	 * the smoke clears does it drive on again. Speed is the container's own
	 * drive-animation playbackRate, so position stays continuous (no snap).
	 */
	function fireStopSequence(id: number) {
		const SLOW_AT = 450; // smoked a moment, now ease off the gas
		const STOP_AT = 1000; // rolled to a halt, engine bursts into flames
		const FIRE_OUT = 4900; // flames burn while stopped (~3.9s) then die down
		const DRIVE_AT = 8500; // keeps smoking (~3.6s) before it finally pulls away
		const TOTAL = 8500; // smoke (effect) lifetime; cleared as it pulls away

		const anim = getDriveAnimation(id);
		const rate = (r: number) => {
			if (anim)
				try {
					anim.playbackRate = r;
				} catch {
					/* vehicle gone */
				}
		};

		setEffect(id, 'firestop', TOTAL); // smoke + shake for the whole sequence
		setTimeout(() => rate(0.35), SLOW_AT); // drive slower
		setTimeout(() => {
			rate(0); // come to a stop
			setFireActive(id, true); // ...and catch fire
		}, STOP_AT);
		setTimeout(() => setFireActive(id, false), FIRE_OUT); // fire out, smoke lingers
		setTimeout(() => rate(0.5), DRIVE_AT); // pull away
		setTimeout(() => rate(1), DRIVE_AT + 250); // back up to speed
	}

	/**
	 * DET HER ER DIN ØNSKE-LISTE FOR CLICK-EASTER-EGGS (holdt tæt på dit sprog):
	 *
	 * 1. car-1.svg
	 *    Skal slingre op og ned mens den kører videre (ca bilens højde).
	 *
	 * 2. car-2.svg
	 *    Skal vende om og køre modsatte vej.
	 *
	 * 3. car-3.svg
	 *    Skal flyve ud af billedet:
	 *    - gradvist højere og højere
	 *    - glidende op/ned flyvebevægelse undervejs
	 *    - blive ved til den er HELT ude af billedet
	 *
	 * 4. car-4.svg
	 *    Skal lave wheelie + have røg samtidig.
	 *
	 * 5. car-5.svg
	 *    Skal ryge helt vildt, kort ild, holde stille kort, og så køre videre.
	 *
	 * 6. 4x4.svg
	 *    Skal være lowrider/hydraulik: hoppe 3 gange.
	 *
	 * 7. random-short-car.svg
	 *    Presseflash + BREAKING banner i kort tid.
	 *
	 * 8. truck.svg
	 *    Turbo boost i længere tid + blå flamme bag i bagenden.
	 *
	 * 9. moped.svg
	 *    Wheelie (dobbelte løft), uden mærkelig vending.
	 *
	 * 10. e-scooter.svg
	 *     U-vending og kør modsatte vej.
	 *
	 * 11/12. nyhedsnat-car-rtl/ltr
	 *        Trigger RGB-konvoj.
	 *
	 * 13. dino-car.svg
	 *     Stor meteor ned bag bilen, ild/trail, dino panikker og sætter fart på.
	 *
	 * 14. racer.svg
	 *     Nitro launch + motion blur (må ikke bare "forsvinde").
	 *
	 * 15. limo.svg
	 *     Golden mode + sparkle.
	 */
	// Apply an egg's motion op to the car's own drive animation. firestop runs the
	// full stop→fire→resume choreography; boost/reverse (optionally delayed) tweak
	// the drive playbackRate. All the visual state (smoke, confetti, meteor, …) is
	// driven off the effect class, set separately in handleClick.
	function applyEggMotion(id: number, m: MotionOp) {
		if (!m) return;
		if (m.kind === 'firestop') return fireStopSequence(id);
		const run = () => (m.kind === 'boost' ? boostDrive(id, m.rate, m.ms) : reverseDrive(id, m.rate));
		if (m.delayMs) setTimeout(run, m.delayMs);
		else run();
	}

	function handleClick(vehicle: ActiveVehicle) {
		// Only once actually halted by the snow → just an angry honk, no easter egg (which
		// would un-stick it). During the pre-halt grace, normal eggs still fire.
		if (trafficStopped) return popAngry(vehicle.id);
		// Lightning-stalled car → no egg while it sits dead (eggs work before + after).
		if (struck[vehicle.id]) return popAngry(vehicle.id);

		// eggOverride === null → explicitly egg-less (e.g. parked), distinct from
		// undefined (no override → fall through to its normal egg). A parked car
		// just honks, same as the snow/lightning halts above.
		if (vehicle.eggOverride === null) return popAngry(vehicle.id);

		const src = vehicleTypes[vehicle.typeIndex].src;
		const egg = vehicle.eggOverride ?? eggFor(src);
		if (!egg) return triggerConvoy.set(vehicle.direction); // unmapped → default convoy trigger

		if (egg.convoy) triggerConvoy.set(vehicle.direction); // convoy travels the same way as this car
		setEffect(vehicle.id, egg.effect, egg.durationMs);
		// car-2 poof: gone for good in the live scene; on the grid it reappears so it can replay.
		if (egg.vanish && !grid) setTimeout(() => removeVehicle(vehicle.id), 1250);
		applyEggMotion(vehicle.id, egg.motion);
	}

	function getWeightedRandomVehicle(): number {
		if (debugTrafficEnabled) {
			return debugSpawnCounter % vehicleTypes.length;
		}

		let random = Math.random() * totalWeight;
		for (let i = 0; i < vehicleTypes.length; i++) {
			random -= vehicleTypes[i].weight;
			if (random <= 0) return i;
		}
		return 0;
	}

	function getDirection(vehicleType: VehicleType): 'ltr' | 'rtl' {
		const allowed = vehicleType.direction ?? 'both';
		if (allowed !== 'both') return allowed;
		if (debugTrafficEnabled) return debugSpawnCounter % 2 === 0 ? 'ltr' : 'rtl';
		return Math.random() > 0.5 ? 'rtl' : 'ltr';
	}

	// Removal is off-frame based: a car is culled once it has entered the viewport and
	// then fully exited it (any edge). This is robust to any speed (weather crawl, snow
	// stop, boost, reverse) — a slowed or stopped car simply stays on-screen until it
	// actually leaves, so nothing gets culled mid-screen.
	const enteredCars = new Set<number>(); // cars that have been inside the frame at least once
	let offFrameRAF: number | null = null;
	function offFrameWatch() {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const M = 80; // margin ≈ widest vehicle, so it's fully gone before removal
		for (const v of activeVehicles) {
			const el = containerEls[v.id];
			if (!el) continue;
			const r = el.getBoundingClientRect();
			if (r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh) {
				enteredCars.add(v.id); // it's on screen now
			} else if (enteredCars.has(v.id)) {
				// entered earlier and is now fully off-frame (exited a side or flew off top)
				if (r.right < -M || r.left > vw + M || r.bottom < -M || r.top > vh + M) removeVehicle(v.id);
			}
		}
		offFrameRAF = requestAnimationFrame(offFrameWatch);
	}

	// Snowstorm freeze: every car eases to a smooth stop (and back up to speed on
	// thaw) by ramping its drive playbackRate, instead of snapping play-state to
	// paused. A stopped car just sits on-screen (off-frame removal leaves it be).
	// Spawning is gated separately (see scheduleNextSpawn / startRush).
	let freezeGen = 0; // bumps on every freeze/thaw so an in-flight ramp can bail

	// Smoothly drive every active car's playbackRate to `target` over `ms` (cosine
	// ease → gentle start and gentle settle, like a car braking / pulling away).
	// Stepped with setTimeout (not requestAnimationFrame) so the ramp still runs
	// — and completes — in a backgrounded tab, where rAF is frozen. Progress is
	// keyed off performance.now(), so a throttled step still lands at the right
	// value. It only writes playbackRate (no layout reads), and the motion itself
	// stays on the GPU compositor, so it's cheap on mobile / old hardware.
	function rampDriveRates(target: number, ms: number) {
		const gen = ++freezeGen;
		// skip lightning-stalled cars — they own their own rate for the full 10s stall,
		// so flinch/mode ramps must not drag them back up to speed.
		const anims = activeVehicles
			.filter((v) => !struck[v.id])
			.map((v) => getDriveAnimation(v.id))
			.filter(Boolean) as Animation[];
		const starts = anims.map((a) => a.playbackRate);
		const t0 = performance.now();
		const STEP_MS = 40; // ~25 updates/s in the foreground; throttled (but still firing) when hidden
		const tick = () => {
			if (gen !== freezeGen) return; // superseded by a newer freeze/thaw
			const p = Math.min(1, (performance.now() - t0) / ms);
			const e = (1 - Math.cos(p * Math.PI)) / 2; // easeInOut
			anims.forEach((a, i) => {
				try {
					a.playbackRate = starts[i] + (target - starts[i]) * e;
				} catch {
					/* vehicle gone */
				}
			});
			if (p < 1) setTimeout(tick, STEP_MS);
		};
		tick();
	}

	function freezeTraffic() {
		if (trafficFrozen) return;
		trafficFrozen = true; // stop NEW spawns immediately (no cars appear mid-snow)
		const gen = ++freezeGen;
		// Cars already on the road carry on ~5s, THEN ease to a gradual stop. Off-frame
		// removal means a stopped car just sits there (on-screen) — no timers to pause.
		setTimeout(() => {
			if (gen !== freezeGen) return; // thawed during the grace window
			rampDriveRates(0, 1800); // glide to a gradual stop (not an instant halt)
			trafficStopped = true; // now clicks just honk (angry emoji), no easter egg
		}, 5000);
	}

	function unfreezeTraffic() {
		if (!trafficFrozen) return;
		trafficFrozen = false;
		trafficStopped = false; // driving again → eggs work normally
		rampDriveRates(1, 1100); // ease back up to normal speed
	}

	// ---- weather reactions ----
	function setDriveRate(id: number, rate: number) {
		const anim = getDriveAnimation(id);
		if (anim) try { anim.playbackRate = rate; } catch { /* gone */ }
	}

	// Sustained mode (rain/fog/autumn crawl): ease the whole fleet to `rate` and
	// flag the per-car visuals. null = back to normal driving.
	function applyMode(m: import('$lib/stores/traffic').TrafficMode | null) {
		const newRate = m ? m.rate : 1;
		wet = !!m?.spray;
		leafy = !!m?.leaves;
		puddleXs = m?.puddles ?? [];
		updatePuddleWatch();
		modeRate = newRate;
		// Removal is off-frame based, so a slowed car simply takes longer to reach the
		// edge — nothing to rescale. (Snow keeps its full-stop via trafficStopped.)
		if (trafficStopped) return; // snow owns the road right now
		rampDriveRates(modeRate, m ? 1200 : 1000);
	}

	// Watch each car's x against the puddle positions; when a car drives onto a puddle
	// it hasn't just been on, kick up a water splash at its wheels. Covers BOTH the
	// rain cloud's temporary puddles and the permanent snowman meltwater marks — same
	// splash, whichever puddle it is.
	function startPuddleWatch() {
		if (puddleRAF != null) return;
		const tick = () => {
			const iw = window.innerWidth;
			const allX = [...puddleXs, ...snowPuddleXs];
			for (const v of activeVehicles) {
				if (effects[v.id] === 'flyout') continue; // airborne — wheels aren't on the road, no splash
				const el = containerEls[v.id];
				if (!el) continue;
				const r = el.getBoundingClientRect();
				const cx = r.left + r.width / 2;
				let over = -1;
				for (let i = 0; i < allX.length; i++) {
					if (Math.abs(cx - (allX[i] / 100) * iw) < 26) { over = i; break; }
				}
				const prev = carOverPuddle[v.id] ?? -1;
				if (over !== -1 && over !== prev) doRoadSplash(v.id); // just rolled onto a puddle
				carOverPuddle[v.id] = over;
			}
			puddleRAF = requestAnimationFrame(tick);
		};
		puddleRAF = requestAnimationFrame(tick);
	}
	function stopPuddleWatch() {
		if (puddleRAF != null) cancelAnimationFrame(puddleRAF);
		puddleRAF = null;
		for (const k of Object.keys(carOverPuddle)) delete carOverPuddle[Number(k)];
	}
	// Start/stop the shared watch based on whether ANY puddle (rain or permanent
	// snowman meltwater) currently exists.
	function updatePuddleWatch() {
		if (puddleXs.length || snowPuddleXs.length) startPuddleWatch();
		else stopPuddleWatch();
	}
	function doRoadSplash(id: number) {
		if (carSplash[id]) return;
		carSplash = { ...carSplash, [id]: true };
		setTimeout(() => {
			const n = { ...carSplash };
			delete n[id];
			carSplash = n;
		}, 700);
	}

	// Thunder: brief startled halt for everyone, then ease back to the current pace.
	function doFlinch() {
		rampDriveRates(0, 180);
		setTimeout(() => rampDriveRates(modeRate, 450), 500);
	}


	function drawBolt(x1: number, y1: number, x2: number, y2: number) {
		const NS = 'http://www.w3.org/2000/svg';
		const dist = Math.hypot(x2 - x1, y2 - y1);
		const mainD = jaggedPath(x1, y1, x2, y2, dist * 0.18, 5);
		// one branch splitting off partway down, at an angle
		const t = 0.35 + Math.random() * 0.25;
		const bx = x1 + (x2 - x1) * t;
		const by = y1 + (y2 - y1) * t;
		const ang = Math.atan2(y2 - y1, x2 - x1) + (0.5 + Math.random() * 0.5) * (Math.random() < 0.5 ? -1 : 1);
		const bLen = dist * (0.2 + Math.random() * 0.18);
		const branchD = jaggedPath(bx, by, bx + Math.cos(ang) * bLen, by + Math.sin(ang) * bLen, dist * 0.08, 4);

		const svg = document.createElementNS(NS, 'svg');
		svg.setAttribute('width', String(window.innerWidth));
		svg.setAttribute('height', String(window.innerHeight));
		svg.style.cssText =
			'position:fixed;left:0;top:0;pointer-events:none;z-index:100;overflow:visible;' +
			'filter:drop-shadow(0 0 4px #cfe4ff) drop-shadow(0 0 12px #7db4ff) drop-shadow(0 0 28px #4f86ff);' +
			'animation:wx-boltline 0.6s linear forwards;';
		const stroke = (d: string, color: string, w: number, opacity = '1') => {
			const p = document.createElementNS(NS, 'path');
			p.setAttribute('d', d);
			p.setAttribute('fill', 'none');
			p.setAttribute('stroke', color);
			p.setAttribute('stroke-width', String(w));
			p.setAttribute('stroke-linecap', 'round');
			p.setAttribute('stroke-linejoin', 'round');
			p.setAttribute('opacity', opacity);
			svg.appendChild(p);
		};
		stroke(mainD, '#8fc0ff', 9, '0.55'); // blue glow underlay
		stroke(branchD, '#8fc0ff', 5, '0.45');
		stroke(branchD, '#ffffff', 2); // white cores
		stroke(mainD, '#ffffff', 3.5);
		document.body.appendChild(svg);
		setTimeout(() => svg.remove(), 640);
	}

	// Thunder bolt: the cloud discharges into the car BELOW it (nearest to xPct that's
	// on-screen). Draws the bolt cloud→car, then the car stalls dead and recovers.
	function doStrike(xPct: number, ox: number, oy: number) {
		if (!activeVehicles.length) return;
		const targetX = (xPct / 100) * window.innerWidth;
		let bestId = -1;
		let bestDist = Infinity;
		let bestEl: HTMLElement | null = null;
		for (const v of activeVehicles) {
			if (struck[v.id]) continue; // already blackened — pick a fresh car instead
			const el = containerEls[v.id];
			if (!el) continue;
			const r = el.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			if (cx < -50 || cx > window.innerWidth + 50) continue; // off-screen
			const d = Math.abs(cx - targetX);
			if (d < bestDist) { bestDist = d; bestId = v.id; bestEl = el; }
		}
		if (bestId < 0) return; // no eligible car below the cloud → bolt fizzles (flash only)
		const r = bestEl!.getBoundingClientRect();
		// lightning strikes FIRST and reaches the car...
		drawBolt(ox, oy, r.left + r.width / 2, r.top + r.height / 2);
		// ...THEN (only once the bolt has struck) the car blackens + stalls dead. Stays
		// stalled ~2s longer than before, then sputters back to life.
		setTimeout(() => {
			struck = { ...struck, [bestId]: true };
			setDriveRate(bestId, 0); // stalled dead — stands still, blackened, for 10s
			setTimeout(() => {
				setDriveRate(bestId, modeRate); // ...then drives forward again
				const n = { ...struck };
				delete n[bestId]; // cleaned (back to normal look)
				struck = n;
			}, 10000);
		}, 200); // car blackens 0.2s after the lightning strikes
	}

	// Confetti: quick celebratory hop for every car on screen.
	function doBounce() {
		bouncing = true;
		setTimeout(() => (bouncing = false), 650);
	}

	// UFO tractor beam: while armed at `beamXPct`, watch for the first car to drive into
	// the beam, then lift it up to the UFO (float + fade) and remove it.
	let beamXPct = -1;
	let beamInt: ReturnType<typeof setInterval> | null = null;
	const beamPrev: Record<number, number> = {}; // last (carCenter − coneCenter) per car, for crossing detection
	function startBeamWatch() {
		if (beamInt != null) return;
		// setInterval (not rAF) so the beam still catches cars when the tab is throttled.
		beamInt = setInterval(() => {
			const bx = (beamXPct / 100) * window.innerWidth;
			for (const v of activeVehicles) {
				const el = containerEls[v.id];
				if (!el || abducting[v.id]) continue;
				const r = el.getBoundingClientRect();
				const cx = r.left + r.width / 2; // car SVG centre
				if (cx < -50 || cx > window.innerWidth + 50) continue;
				const d = cx - bx;
				const prev = beamPrev[v.id];
				beamPrev[v.id] = d;
				// catch ~100ms BEFORE the car's centre actually reaches the cone's centre:
				// extrapolate from this tick's travel (poll is every 40ms) how far it'll
				// cover in the next 100ms, and fire once it's within that lead distance —
				// so pinAndRise starts 100ms earlier than a dead-on crossing would.
				const lead = prev !== undefined ? Math.abs(d - prev) * 2.5 : 3;
				if (Math.abs(d) <= Math.max(lead, 3) || (prev !== undefined && Math.sign(prev) !== Math.sign(d))) {
					beamAbduct(v.id);
					return; // caught one — the watch is torn down via abductBeam=null
				}
			}
		}, 40);
	}
	function stopBeamWatch() {
		if (beamInt != null) clearInterval(beamInt);
		beamInt = null;
		for (const k of Object.keys(beamPrev)) delete beamPrev[Number(k)];
	}
	// Rise the car up into the cone. Distance is MEASURED against the beam's actual
	// on-screen rect (not a fixed px guess) so it lands at the same spot in the cone on
	// any screen size / zoom — the cloud's height and vertical position both scale with
	// the viewport. 140 below is only the reference distance the curve was authored at;
	// every other offset is scaled by the real:reference ratio.
	const REFERENCE_RISE = 140;
	function riseCarToBeam(id: number): Animation | null {
		const el = containerEls[id];
		const vfx = el?.querySelector('.vfx') as HTMLElement | null;
		if (!el || !vfx) return null;
		const beamEl = document.querySelector('.cloud.ufo .beam') as HTMLElement | null;
		const carRect = el.getBoundingClientRect();
		let rise = REFERENCE_RISE;
		if (beamEl) {
			const beamRect = beamEl.getBoundingClientRect();
			const catchY = beamRect.top + beamRect.height * 0.2; // partway down the cone
			rise = Math.max(60, carRect.top + carRect.height / 2 - catchY);
		}
		const scale = rise / REFERENCE_RISE;
		return vfx.animate(
			[
				{ transform: 'translateY(0) rotate(0deg) scale(1)', offset: 0 },
				{ transform: `translateY(${-13 * scale}px) rotate(-9deg) scale(0.97)`, offset: 0.12 },
				{ transform: `translateY(${-38 * scale}px) rotate(8deg) scale(0.9)`, offset: 0.3 },
				{ transform: `translateY(${-68 * scale}px) rotate(-8deg) scale(0.82)`, offset: 0.48 },
				{ transform: `translateY(${-98 * scale}px) rotate(7deg) scale(0.73)`, offset: 0.66 },
				{ transform: `translateY(${-122 * scale}px) rotate(-6deg) scale(0.63)`, offset: 0.84 },
				{ transform: `translateY(${-rise}px) rotate(0deg) scale(0.54)`, offset: 1 }
			],
			{ duration: 1700, easing: 'ease-in', fill: 'forwards' }
		);
	}
	function beamAbduct(id: number) {
		abductBeam.set(null); // consume → disarm the beam watch
		const el = containerEls[id];
		const drive = el ? getDriveAnimation(id) : undefined;
		const EASE_MS = 0;
		if (!drive || EASE_MS <= 0) return pinAndRise(id);
		// Ease the drive to a stop (brake, don't just cut it dead) — THEN pin + rise.
		const startRate = drive.playbackRate;
		const t0 = performance.now();
		const tick = () => {
			const p = Math.min(1, (performance.now() - t0) / EASE_MS);
			const e = 1 - Math.pow(1 - p, 3); // easeOutCubic — brakes hard, eases off at the very end
			try {
				drive.playbackRate = startRate * (1 - e);
			} catch {
				return pinAndRise(id); // vehicle gone mid-brake
			}
			if (p < 1) setTimeout(tick, 20);
			else pinAndRise(id);
		};
		tick();
	}
	function pinAndRise(id: number) {
		const el = containerEls[id];
		if (el) {
			// PIN the car where it is: kill the drive animation and set a static left at
			// its current x. Otherwise it keeps driving off + gets culled off-frame while
			// the lift plays → looks like it vanishes. transform:none drops the drive's
			// translateX; the left keeps it in place.
			const r = el.getBoundingClientRect();
			const houses = el.closest('.houses-container') as HTMLElement | null;
			const hLeft = houses ? houses.getBoundingClientRect().left : 0;
			el.style.animation = 'none';
			el.style.transform = 'none';
			el.style.left = `${r.left - hLeft}px`;
			el.style.right = 'auto';
			el.style.zIndex = '4'; // above the houses (3), BELOW the UFO beam (cone stays on top)
		}
		abducting = { ...abducting, [id]: true }; // marks it mid-rise (sprite CSS reacts via class:lift)
		abductCaught.update((n) => n + 1); // tell the cloud to shut the beam after the lift
		const anim = riseCarToBeam(id); // measured rise (pixel scouting) — scales to any screen size
		if (anim) abductAnims[id] = anim;
		abductTimers[id] = setTimeout(() => {
			delete abductTimers[id];
			delete abductAnims[id];
			// it has reached the top of the cone → sparkle-pop where the car's top is, then vanish
			const e2 = containerEls[id];
			const vfx = e2?.querySelector('.vfx');
			const cont = e2?.closest('.houses-container') as HTMLElement | null;
			if (vfx && cont) {
				const r = vfx.getBoundingClientRect();
				const cr = cont.getBoundingClientRect();
				const p = { id: popId++, x: r.left + r.width / 2 - cr.left, y: r.top - cr.top };
				beamPops = [...beamPops, p];
				setTimeout(() => (beamPops = beamPops.filter((q) => q.id !== p.id)), 700);
			}
			removeVehicle(id); // gone
			const n = { ...abducting };
			delete n[id];
			abducting = n;
		}, 1700);
	}

	// UFO beam switched off mid-lift (user re-clicked) → drop every car still rising:
	// it falls back to the road, throws an angry emoji + dust puff, then drives on.
	function releaseRisingCars() {
		for (const key of Object.keys(abductTimers)) releaseCar(Number(key));
	}
	function releaseCar(id: number) {
		const t = abductTimers[id];
		if (t == null) return; // not mid-lift
		clearTimeout(t);
		delete abductTimers[id];
		const el = containerEls[id];
		const vfx = el?.querySelector('.vfx') as HTMLElement | null;
		abducting = (({ [id]: _, ...rest }) => rest)(abducting); // stop marking it mid-rise
		if (!vfx) return onCarLanded(id);
		const cur = getComputedStyle(vfx).transform; // current height up the beam (whatever screen size)
		abductAnims[id]?.cancel(); // stop the measured rise, freeze `cur` as the fall's start point
		delete abductAnims[id];
		// Fall is its OWN animation, ending exactly at ground contact (translateY(0)) — that's
		// the instant onCarLanded (dust + angry face) fires. The recoil bounce plays AFTER,
		// as a separate animation, so it never delays the impact moment.
		const fall = vfx.animate(
			[{ transform: cur }, { transform: 'translateY(0)' }],
			{ duration: 480, easing: 'cubic-bezier(.55,0,.85,.35)', fill: 'forwards' }
		);
		fall.onfinish = () => {
			fall.cancel();
			onCarLanded(id); // fires exactly on ground contact, not after the settle
			const bounce = vfx.animate(
				[{ transform: 'translateY(0)' }, { transform: 'translateY(7px)' }, { transform: 'translateY(0)' }],
				{ duration: 260, easing: 'ease-out', fill: 'forwards' }
			);
			bounce.onfinish = () => bounce.cancel();
		};
	}
	function onCarLanded(id: number) {
		popAngry(id, '😡'); // always the angry face for a dropped landing — never the random set
		dust = { ...dust, [id]: true }; // big puff of dust, thrown up by the impact
		setTimeout(() => (dust = (({ [id]: _, ...rest }) => rest)(dust)), 1000);
		resumeDrive(id); // ...and it carries on its way
	}
	// Un-pin an abducted car and send it on to its exit edge (WAAPI drive, same as u-turn).
	function resumeDrive(id: number) {
		const el = containerEls[id];
		if (!el) return;
		el.style.zIndex = ''; // back to the normal car stacking (below the houses-front)
		const dir = el.classList.contains('rtl') ? 'rtl' : 'ltr';
		const r = el.getBoundingClientRect();
		const exitVp = dir === 'ltr' ? window.innerWidth + 300 : -(el.offsetWidth + 300);
		const dist = exitVp - r.left; // signed px to the exit edge
		const ms = Math.max(1200, Math.abs(dist) / 0.05); // ~normal drive speed
		el.animate(
			[{ transform: 'translateX(0)' }, { transform: `translateX(${dist}px)` }],
			{ duration: ms, easing: 'linear', fill: 'forwards' }
		);
		// offFrameWatch culls it once it leaves the frame
	}

	function removeVehicle(id: number) {
		activeVehicles = activeVehicles.filter((v) => v.id !== id);
		const nextEffects = { ...effects };
		const nextPaused = { ...paused };
		const nextFire = { ...fireActive };
		delete nextEffects[id];
		delete nextPaused[id];
		delete nextFire[id];
		delete containerEls[id];
		enteredCars.delete(id);
		effects = nextEffects;
		paused = nextPaused;
		fireActive = nextFire;
	}

	function spawnVehicle(opts?: {
		typeIndex?: number;
		direction?: 'ltr' | 'rtl';
		duration?: number;
		eggOverride?: Egg | null;
		underglow?: boolean;
		speedOverride?: number; // playbackRate this car spawns at (e.g. 2 = double speed), instead of the current weather rate
		motionOverride?: MotionOverride; // replaces the standard drive-ltr/rtl crossing entirely (e.g. arrive-and-park)
	}) {
		const typeIndex = opts?.typeIndex ?? getWeightedRandomVehicle();
		const vehicleType = vehicleTypes[typeIndex];
		const direction = opts?.direction ?? getDirection(vehicleType);

		const duration =
			opts?.duration ??
			(debugTrafficEnabled
				? (vehicleType.minDuration + vehicleType.maxDuration) / 2
				: Math.random() * (vehicleType.maxDuration - vehicleType.minDuration) + vehicleType.minDuration);
		const id = vehicleIdCounter++;

		if (debugTrafficEnabled) debugSpawnCounter++;

		activeVehicles = [
			...activeVehicles,
			{ id, typeIndex, direction, duration, eggOverride: opts?.eggOverride, underglow: opts?.underglow }
		];
		// no removal timer — offFrameWatch culls it once it drives off the frame.

		if (opts?.motionOverride) {
			// Custom motion entirely replaces the CSS drive-ltr/rtl crossing — hand the
			// element straight to the override once it exists (after render).
			const motionOverride = opts.motionOverride;
			requestAnimationFrame(() => {
				const el = containerEls[id];
				if (el) motionOverride(el, id);
			});
			return id;
		}

		// A car spawned mid weather-crawl should roll at the same slowed pace, not
		// zoom in at full speed — unless it has its own speed override (e.g. convoy).
		// Apply once its element exists (after render).
		const rate = opts?.speedOverride ?? modeRate;
		if (rate !== 1) requestAnimationFrame(() => setDriveRate(id, rate));
		return id;
	}

	// A convoy: CONVOY_COUNT cars from the curated small-car set, spawned in a tight,
	// fast burst all travelling the same way, all sharing one duration (so they stay
	// evenly spaced across the whole crossing instead of drifting apart), each with
	// the dance egg override + underglow decoration instead of their normal click egg.
	function spawnConvoyBatch(direction: 'ltr' | 'rtl') {
		const duration = Math.random() * 5 + 18; // 18-23s, shared by the whole batch
		for (let i = 0; i < CONVOY_COUNT; i++) {
			setTimeout(() => {
				const pick = CONVOY_TYPES[Math.floor(Math.random() * CONVOY_TYPES.length)];
				const typeIndex = vehicleTypes.findIndex((v) => v.src.includes(pick));
				// no eggOverride — convoy cars use their own normal egg (poof/flyout/firestop
				// and all), the chaos is the fun part now that they're just regular vehicles.
				spawnVehicle({ typeIndex, direction, duration, underglow: true, speedOverride: 2.6 });
			}, i * CONVOY_GAP_MS);
		}
	}

	// "Rush hour" surge (triggered by the moon laser): ~10x traffic for 20s.
	const RUSH_FACTOR = 10;
	let rushActive = false;
	let spawnTimer: ReturnType<typeof setTimeout>;

	function scheduleNextSpawn() {
		const base = debugTrafficEnabled
			? minSpawnInterval / spawnRateMultiplier
			: (Math.random() * (maxSpawnInterval - minSpawnInterval) + minSpawnInterval) / spawnRateMultiplier;
		const interval = base / (rushActive ? RUSH_FACTOR : 1);
		spawnTimer = setTimeout(() => {
			// no new cars while snow covers the road, or while the tab is hidden (off-frame
			// removal is rAF-based and paused when hidden — don't let cars pile up).
			if (!trafficFrozen && !document.hidden) spawnVehicle();
			scheduleNextSpawn();
		}, interval);
	}

	function startRush() {
		if (rushActive) return;
		rushActive = true;
		clearTimeout(spawnTimer); // drop the slow pending spawn, reschedule fast now
		scheduleNextSpawn();
		for (let i = 0; i < 6; i++) setTimeout(() => rushActive && !trafficFrozen && spawnVehicle(), i * 180); // instant burst
		setTimeout(() => {
			rushActive = false;
		}, 20000);
	}

	// Friendly Danish description of what each vehicle's click effect does.
	function getEffectLabel(src: string): string {
		if (src.includes('nyhedsnat-car')) return 'Starter RGB-konvoj';
		if (src.includes('car-1.svg')) return 'Slingrer op og ned';
		if (src.includes('car-2.svg')) return 'Forsvinder i konfetti';
		if (src.includes('car-3.svg')) return 'Flyver ud af billedet';
		if (src.includes('car-4.svg')) return 'Wheelie med røg';
		if (src.includes('car-5.svg')) return 'Røg, ild og kort stop';
		if (src.includes('4x4.svg')) return 'Plasker gennem en vandpyt';
		if (src.includes('random-short-car.svg')) return 'Pressefoto + BREAKING';
		if (src.includes('truck.svg')) return 'Turbo med blå flamme';
		if (src.includes('moped.svg')) return 'Wheelie';
		if (src.includes('e-scooter.svg')) return 'Vender om (U-turn)';
		if (src.includes('dino-car.svg')) return 'Meteor + dino-panik';
		if (src.includes('racer.svg')) return 'Nitro-launch';
		if (src.includes('limo.svg')) return 'Strækker sig (stræk-limo)';
		if (src.includes('bus.svg')) return 'Laver et kæmpe hop';
		return '';
	}

	// Grid mode: re-trigger an effect, restarting it cleanly even if one is
	// already playing (clears the class, then re-applies after a reflow).
	function replayEffect(vehicle: ActiveVehicle) {
		const id = vehicle.id;
		if (effects[id]) {
			const nextEffects = { ...effects };
			const nextPaused = { ...paused };
			delete nextEffects[id];
			delete nextPaused[id];
			effects = nextEffects;
			paused = nextPaused;
			setTimeout(() => handleClick(vehicle), 30);
		} else {
			handleClick(vehicle);
		}
	}

	onMount(() => {
		if (grid) {
			activeVehicles = vehicleTypes.map((vt, typeIndex) => ({
				id: vehicleIdCounter++,
				typeIndex,
				direction: vt.direction === 'rtl' ? 'rtl' : 'ltr',
				duration: 9999
			}));
			return;
		}
		spawnVehicle();
		scheduleNextSpawn();
		offFrameRAF = requestAnimationFrame(offFrameWatch); // cull cars once they leave the frame

		// Moon laser → rush hour: spike traffic ~10x for 20s.
		const unsub = rushHourTrigger.subscribe((on) => {
			if (on) {
				startRush();
				rushHourTrigger.set(false);
			}
		});

		// Snowstorm → freeze all traffic until the pile-up drives off again.
		const unsubSnow = snowFreeze.subscribe((on) => {
			if (on) freezeTraffic();
			else unfreezeTraffic();
		});

		// Permanent snowman meltwater marks — splash on these too, for as long as they exist.
		const unsubSnowPuddles = snowPuddles.subscribe((list) => {
			snowPuddleXs = list.map((p) => p.x);
			updatePuddleWatch();
		});

		// Weather clouds → sustained crawl (rain/fog/autumn) + one-shot reactions.
		const unsubMode = trafficMode.subscribe((m) => applyMode(m));
		const unsubPulse = trafficPulse.subscribe((p) => {
			if (!p) return;
			if (p.kind === 'flinch') doFlinch();
			else if (p.kind === 'strike') doStrike(p.xPct, p.ox, p.oy);
			else if (p.kind === 'bounce') doBounce();
			trafficPulse.set(null); // consume
		});

		// UFO tractor beam armed/disarmed → start/stop watching for a car to enter it.
		const unsubBeam = abductBeam.subscribe((b) => {
			if (b) {
				beamXPct = b.xPct;
				startBeamWatch();
			} else {
				beamXPct = -1;
				stopBeamWatch();
			}
		});
		let releaseInit = true;
		const unsubRelease = abductRelease.subscribe(() => {
			if (releaseInit) return void (releaseInit = false); // skip the store's initial value
			releaseRisingCars();
		});

		// A car's egg (or a click on an unmapped one) asks for a convoy → spawn a batch
		// of regular vehicles (see spawnConvoyBatch) instead of a separate component, so
		// every weather reaction already applies to them for free.
		const unsubConvoy = triggerConvoy.subscribe((dir) => {
			if (dir) {
				spawnConvoyBatch(dir);
				triggerConvoy.set(null); // consume
			}
		});

		return () => {
			unsub();
			unsubSnow();
			unsubSnowPuddles();
			unsubMode();
			unsubPulse();
			unsubBeam();
			unsubRelease();
			unsubConvoy();
			stopPuddleWatch();
			stopBeamWatch();
			if (offFrameRAF != null) cancelAnimationFrame(offFrameRAF);
		};
	});
</script>

{#snippet vehicleCard(vehicle: ActiveVehicle)}
	{@const vehicleType = vehicleTypes[vehicle.typeIndex]}
	<div
		bind:this={containerEls[vehicle.id]}
		class="vehicle-container {vehicle.direction}"
		class:paused={!!paused[vehicle.id]}
		class:grid
		style="--duration: {vehicle.duration}s;"
	>
		<button class="vehicle-button" onclick={() => { if (!grid) handleClick(vehicle); }} aria-label="Vehicle action">
			{#if angry[vehicle.id]}<span class="angry-pop" aria-hidden="true">{angry[vehicle.id]}</span>{/if}
			{#if dust[vehicle.id]}
				<span class="land-dust" aria-hidden="true">
					{#each Array(16) as _, i (i)}
						{@const a = (i / 16) * Math.PI + Math.PI}
						{@const spread = 34 + (i % 4) * 16}
						<span
							class="ld-{i % 3}"
							style="--dx: {Math.cos(a) * spread}px; --dy: {Math.sin(a) * spread * 0.6 - 6}px; --sz: {5 + (i % 5) * 2}px; --dd: {0.55 + (i % 4) * 0.1}s;"
						></span>
					{/each}
				</span>
			{/if}
			<div class="vfx" class:bounce={bouncing} class:lift={!!abducting[vehicle.id]} class:zapped={!!struck[vehicle.id]} class:leafy={leafy}>
				<VehicleSprite
					src={vehicleType.src}
					size={vehicleType.size}
					direction={vehicle.direction}
					effect={effects[vehicle.id]}
					fire={!!fireActive[vehicle.id]}
					decorations={{ underglow: vehicle.underglow }}
				/>
			</div>
			{#if wet}<span class="wheel-fx spray" aria-hidden="true"><span></span><span></span></span>{/if}
			{#if leafy}<span class="wheel-fx leaf" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>{/if}
			{#if carSplash[vehicle.id]}
				<span class="road-splash rear" aria-hidden="true">
					<span></span><span></span><span></span><span></span><span></span><span></span>
				</span>
				<span class="road-splash front" aria-hidden="true">
					<span></span><span></span><span></span><span></span><span></span><span></span>
				</span>
			{/if}
			{#if struck[vehicle.id]}
				<span class="strike-fx" aria-hidden="true">
					<span class="bolt">⚡</span>
					<span class="ssmoke s1"></span><span class="ssmoke s2"></span>
				</span>
			{/if}
		</button>
	</div>
{/snippet}

{#if grid}
	<div class="anim-grid">
		{#each activeVehicles as vehicle (vehicle.id)}
			{@const vehicleType = vehicleTypes[vehicle.typeIndex]}
			<div class="anim-cell">
				<div class="anim-stage" onclick={() => replayEffect(vehicle)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); replayEffect(vehicle); } }} role="button" tabindex="0" aria-label="Afspil animation igen">
					{@render vehicleCard(vehicle)}
				</div>
				<span class="anim-label">
					<strong>{vehicleType.src.split('/').pop()}</strong>
					<span class="anim-effect">{getEffectLabel(vehicleType.src)}</span>
					<span class="anim-prob">{((vehicleType.weight / totalWeight) * 100).toFixed(1)}% spawn chance</span>
				</span>
			</div>
		{/each}
	</div>
{:else}
	{#each activeVehicles as vehicle (vehicle.id)}
		{@render vehicleCard(vehicle)}
	{/each}
	<!-- sparkle where an abducted car pops out at the top of the UFO cone -->
	{#each beamPops as p (p.id)}
		<span class="beam-pop" style="left: {p.x}px; top: {p.y}px;" aria-hidden="true">
			<span class="bp-flash"></span>
			{#each Array(8) as _, i (i)}
				{@const a = (i / 8) * Math.PI * 2}
				<span class="bp-spark" style="--dx: {Math.cos(a) * 22}px; --dy: {Math.sin(a) * 22}px;"></span>
			{/each}
		</span>
	{/each}
{/if}

<style>
	.vehicle-container {
		position: absolute;
		bottom: 10px;
		z-index: 2;
		pointer-events: none;
	}

	/* Must out-specify `.vehicle-container.ltr/.rtl`, whose `animation` shorthand
	   resets play-state to running and otherwise wins on source order. */
	.vehicle-container.ltr.paused,
	.vehicle-container.rtl.paused {
		animation-play-state: paused;
	}

	/* Grid mode (used by /animation-test): each vehicle gets its own dark
	   "stage" that clips its effect, with a label underneath. */
	.anim-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 24px;
		width: 100%;
		max-width: 1120px;
		margin: 0 auto;
	}
	.anim-cell {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.anim-stage {
		position: relative;
		height: 190px;
		border-radius: 14px;
		overflow: hidden;
		background: radial-gradient(120% 90% at 50% 125%, #1a2747 0%, #0c1426 58%, #080d1a 100%);
		border: 1px solid rgba(212, 175, 55, 0.18);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	.anim-stage:hover {
		border-color: rgba(212, 175, 55, 0.45);
	}
	.anim-stage::after {
		content: '';
		position: absolute;
		left: 8%;
		right: 8%;
		bottom: 24px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
	}
	.anim-grid .vehicle-container.grid {
		position: relative;
		bottom: auto;
		left: auto;
		right: auto;
		margin-bottom: 26px;
		animation: none;
		pointer-events: none;
	}
	.anim-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		text-align: center;
		line-height: 1.3;
	}
	.anim-label strong {
		font-family: monospace;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.85);
	}
	.anim-effect {
		font-size: 12px;
		color: rgba(212, 175, 55, 0.85);
	}
	.anim-prob {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.35);
	}

	.vehicle-button {
		position: relative;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
	}

	.vehicle-container.ltr {
		left: 0;
		animation: drive-ltr var(--duration, 12s) linear forwards;
	}

	.vehicle-container.rtl {
		right: 0;
		left: auto;
		animation: drive-rtl var(--duration, 12s) linear forwards;
	}

	@keyframes drive-ltr { 0% { transform: translateX(-250px);} 100% { transform: translateX(calc(100vw + 250px));}}
	@keyframes drive-rtl { 0% { transform: translateX(250px);} 100% { transform: translateX(calc(-100vw - 250px));}}

	/* angry honk emoji when a snow-frozen car is clicked (no easter egg fires) */
	.angry-pop {
		position: absolute;
		left: 50%;
		bottom: 100%;
		font-size: 16px;
		line-height: 1;
		pointer-events: none;
		z-index: 4;
		animation: angry-rise 1.1s ease-out forwards;
	}
	@keyframes angry-rise {
		0%   { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.4); }
		20%  { opacity: 1; transform: translateX(-50%) translateY(-2px) scale(1.2); }
		70%  { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1); }
		100% { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(0.9); }
	}

	/* big puff of dust when a UFO-released car THUMPS back onto the road — a lot of very
	   light, fine dust thrown out by the impact force, not a dainty little poof. */
	.land-dust {
		position: absolute;
		left: 50%;
		bottom: 2px;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 3;
	}
	.land-dust span {
		position: absolute;
		bottom: 0;
		left: 0;
		width: var(--sz, 7px);
		height: var(--sz, 7px);
		border-radius: 50%;
		filter: blur(2px);
		animation: land-dust-puff var(--dd, 0.7s) cubic-bezier(0.15, 0.7, 0.3, 1) forwards;
	}
	/* three light, dusty tones — near-opaque so it reads as a big, thick cloud of dust */
	.land-dust .ld-0 { background: rgba(240, 234, 222, 1); }
	.land-dust .ld-1 { background: rgba(218, 206, 186, 0.98); }
	.land-dust .ld-2 { background: rgba(198, 186, 166, 0.94); }
	@keyframes land-dust-puff {
		0%   { opacity: 0; transform: translate(0, 0) scale(0.25); }
		10%  { opacity: 1; transform: translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.3)) scale(1.3); }
		60%  { opacity: 1; transform: translate(calc(var(--dx) * 0.75), calc(var(--dy) * 0.85)) scale(2); }
		100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(2.6); }
	}

	/* ---- weather reactions (rain / confetti / thunder / fog / autumn / ufo) ---- */
	/* Inner layer so weather transforms compose over the sprite without touching
	   the container's horizontal drive animation (same trick as .snow-fidget). */
	.vfx {
		display: block;
		transform-origin: 50% 100%;
	}
	/* autumn: car bumps + wobbles as it slogs through the deep leaves */
	.vfx.leafy { animation: leaf-trudge 0.85s ease-in-out infinite; }
	@keyframes leaf-trudge {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		25% { transform: translateY(-2px) rotate(-1.4deg); }
		50% { transform: translateY(0) rotate(0.3deg); }
		75% { transform: translateY(-1px) rotate(1.4deg); }
	}
	/* confetti: quick celebratory hop */
	.vfx.bounce { animation: wx-bounce 0.6s ease-out; }
	@keyframes wx-bounce {
		0%, 100% { transform: translateY(0) scaleY(1); }
		20% { transform: translateY(0) scaleY(0.85); }
		45% { transform: translateY(-14px) scaleY(1.08); }
		70% { transform: translateY(0) scaleY(0.92); }
		85% { transform: translateY(-4px) scaleY(1); }
	}
	/* thunder: struck car goes dark + shudders */
	.vfx.zapped { animation: wx-shudder 0.4s ease-in-out 3; filter: brightness(0.25) contrast(1.3); }
	@keyframes wx-shudder {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-2px) rotate(-1deg); }
		75% { transform: translateX(2px) rotate(1deg); }
	}
	/* ufo pop: green sparkle burst where the car vanishes at the top of the cone */
	.beam-pop { position: absolute; width: 0; height: 0; z-index: 6; pointer-events: none; }
	.bp-flash {
		position: absolute;
		left: 0;
		top: 0;
		width: 26px;
		height: 26px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(circle, rgba(190, 255, 215, 0.95), rgba(120, 255, 170, 0) 70%);
		animation: bp-flash 0.5s ease-out forwards;
	}
	.bp-spark {
		position: absolute;
		left: 0;
		top: 0;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: #d6ffe6;
		box-shadow: 0 0 4px #7bffaa;
		transform: translate(-50%, -50%);
		animation: bp-spark 0.6s ease-out forwards;
	}
	@keyframes bp-flash {
		0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
		30% { opacity: 1; }
		100% { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
	}
	@keyframes bp-spark {
		0% { opacity: 0; transform: translate(-50%, -50%); }
		20% { opacity: 1; }
		100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4); }
	}

	/* ufo: slowly float up the beam, rocking side to side, staying fully visible — only
	   removed (in JS) once it reaches the cone. The actual rise animation is driven by
	   riseCarToBeam() in JS (measured against the beam's real on-screen rect), not CSS,
	   so it lands in the right spot on any screen size. `lift` is just a state marker. */

	/* thunder strike fx: bolt glyph + smoke off the hit car */
	.strike-fx { position: absolute; left: 50%; bottom: 0; width: 0; height: 0; z-index: 5; pointer-events: none; }
	.strike-fx .bolt {
		position: absolute;
		left: -10px;
		top: -46px;
		font-size: 26px;
		line-height: 1;
		filter: drop-shadow(0 0 6px #fff3b0);
		animation: wx-bolt 0.5s ease-out forwards;
	}
	@keyframes wx-bolt {
		0% { opacity: 0; transform: translateY(-10px) scale(0.6); }
		20% { opacity: 1; transform: translateY(0) scale(1.15); }
		60% { opacity: 1; }
		100% { opacity: 0; transform: translateY(2px) scale(1); }
	}
	.strike-fx .ssmoke {
		position: absolute;
		bottom: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(90, 90, 90, 0.75), rgba(90, 90, 90, 0) 70%);
		opacity: 0;
		animation: wx-smoke 2.2s ease-out forwards;
	}
	.strike-fx .s1 { --sx: -12px; left: -14px; animation-delay: 0.3s; }
	.strike-fx .s2 { --sx: 12px; left: 2px; animation-delay: 0.6s; }
	@keyframes wx-smoke {
		0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
		20% { opacity: 0.7; }
		100% { opacity: 0; transform: translate(var(--sx), -30px) scale(1.8); }
	}

	@keyframes wx-fade-in { from { opacity: 0; } to { opacity: 1; } }

	/* wet-road spray / autumn leaf-kick off the wheels while the car crawls */
	.wheel-fx { position: absolute; left: 50%; bottom: 0; width: 0; height: 0; z-index: 1; pointer-events: none; }
	.wheel-fx span {
		position: absolute;
		bottom: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		opacity: 0;
	}
	.wheel-fx.spray span { background: rgba(200, 220, 245, 0.85); animation: wx-spray 0.9s ease-out infinite; }
	/* autumn kick-up: actual leaf shapes (lobed blob + midrib), not dots */
	.wheel-fx.leaf span {
		width: 9px;
		height: 7px;
		border-radius: 0 100% 0 100%;
		animation: wx-leafkick 1.2s ease-out infinite;
	}
	.wheel-fx.leaf span::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 10%;
		width: 1px;
		height: 80%;
		background: rgba(80, 40, 15, 0.5);
		transform: translateX(-50%);
	}
	.wheel-fx span:nth-child(1) { left: -14px; --kx: -16px; }
	.wheel-fx span:nth-child(2) { left: 10px; --kx: 16px; animation-delay: 0.45s; }
	/* autumn swirl: a bigger cloud of leaves flung up around the car as it plows through */
	.wheel-fx.leaf span:nth-child(1) { background: #c8722e; }
	.wheel-fx.leaf span:nth-child(2) { background: #b5492a; }
	.wheel-fx.leaf span:nth-child(3) { left: -4px; --kx: -8px; background: #d9822b; animation-delay: 0.2s; }
	.wheel-fx.leaf span:nth-child(4) { left: 2px; --kx: 24px; background: #a83e1f; animation-delay: 0.6s; }
	.wheel-fx.leaf span:nth-child(5) { left: -10px; --kx: -26px; background: #e6b23a; animation-delay: 0.35s; }
	@keyframes wx-spray {
		0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
		20% { opacity: 0.9; }
		100% { opacity: 0; transform: translate(var(--kx), -14px) scale(1); }
	}
	@keyframes wx-leafkick {
		0% { opacity: 0; transform: translate(0, 0) rotate(0) scale(0.4); }
		20% { opacity: 1; }
		100% { opacity: 0; transform: translate(var(--kx), -36px) rotate(420deg) scale(1.2); }
	}

	/* rain: water kicked up in a fan when a car drives through a puddle */
	.road-splash { position: absolute; bottom: 0; width: 0; height: 0; z-index: 3; pointer-events: none; }
	.road-splash.rear { left: calc(50% - 15px); } /* both wheels splash */
	.road-splash.front { left: calc(50% + 15px); }
	.road-splash span {
		position: absolute;
		bottom: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: rgba(200, 222, 245, 0.9);
		box-shadow: 0 0 3px rgba(180, 210, 240, 0.7);
		opacity: 0;
		animation: road-splash 0.65s ease-out forwards;
	}
	.road-splash span:nth-child(1) { --sx: -22px; --sy: -12px; }
	.road-splash span:nth-child(2) { --sx: -12px; --sy: -21px; animation-delay: 0.03s; }
	.road-splash span:nth-child(3) { --sx: -3px; --sy: -25px; animation-delay: 0.05s; width: 6px; height: 6px; }
	.road-splash span:nth-child(4) { --sx: 8px; --sy: -23px; animation-delay: 0.04s; }
	.road-splash span:nth-child(5) { --sx: 18px; --sy: -17px; animation-delay: 0.06s; }
	.road-splash span:nth-child(6) { --sx: 26px; --sy: -9px; animation-delay: 0.08s; width: 4px; height: 4px; }
	@keyframes road-splash {
		0% { opacity: 0; transform: translate(0, 2px) scale(0.4); }
		25% { opacity: 1; }
		70% { opacity: 0.9; transform: translate(calc(var(--sx) * 0.7), var(--sy)) scale(1); }
		100% { opacity: 0; transform: translate(var(--sx), 4px) scale(0.9); } /* arc back down */
	}

	/* thunder bolt flicker — global: the bolt div is appended to document.body */
	@keyframes -global-wx-boltline {
		0% { opacity: 0; }
		6% { opacity: 1; } /* strike */
		16% { opacity: 0.25; } /* flicker */
		26% { opacity: 1; }
		44% { opacity: 0.5; }
		60% { opacity: 1; } /* last bright pulse */
		100% { opacity: 0; } /* fade */
	}
</style>
