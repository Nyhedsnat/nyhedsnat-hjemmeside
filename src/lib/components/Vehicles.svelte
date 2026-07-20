<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';
	import { rushHourTrigger } from '$lib/stores/rushHour';
	import { snowFreeze } from '$lib/stores/snow';
	import { vehicleTypes, eggFor, type EffectName, type VehicleType, type MotionOp } from '$lib/vehicles';
	import { getMotionAnimation } from '$lib/vehicleMotion';
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
	}

	const totalWeight = vehicleTypes.reduce((sum, v) => sum + v.weight, 0);
	const minSpawnInterval = 5000;
	const maxSpawnInterval = 15000;
	const debugTrafficEnabled = import.meta.env.PUBLIC_DEBUG_TRAFFIC === 'true';
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

	const STUCK_EMOJI = ['💢', '😡', '🤬', '😤', '❗', '‼️'];
	function popAngry(id: number) {
		angry = { ...angry, [id]: STUCK_EMOJI[Math.floor(Math.random() * STUCK_EMOJI.length)] };
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
		postponeRemoval(id, 8000); // it's stopped a long while; don't cull it mid-screen
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

		const src = vehicleTypes[vehicle.typeIndex].src;
		const egg = eggFor(src);
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

	// Removal is tracked per vehicle so effects that halt a car (firestop) can
	// postpone it — otherwise the wall-clock timer would cull the car mid-screen
	// while it is still stopped, since pausing the drive doesn't pause this timer.
	const removalTimers: Record<number, { timer: ReturnType<typeof setTimeout>; at: number; remaining?: number }> = {};

	// Snowstorm freeze: every car eases to a smooth stop (and back up to speed on
	// thaw) by ramping its drive playbackRate, instead of snapping play-state to
	// paused. Removal timers are halted so a frozen car isn't culled mid-screen.
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
		const anims = activeVehicles.map((v) => getDriveAnimation(v.id)).filter(Boolean) as Animation[];
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
		// Cars already on the road carry on ~5s, THEN ease to a gradual stop.
		setTimeout(() => {
			if (gen !== freezeGen) return; // thawed during the grace window
			const now = performance.now();
			for (const key of Object.keys(removalTimers)) {
				const r = removalTimers[Number(key)];
				clearTimeout(r.timer);
				r.remaining = Math.max(0, r.at - now);
			}
			rampDriveRates(0, 1800); // glide to a gradual stop (not an instant halt)
			trafficStopped = true; // now clicks just honk (angry emoji), no easter egg
		}, 5000);
	}

	function unfreezeTraffic() {
		if (!trafficFrozen) return;
		trafficFrozen = false;
		trafficStopped = false; // driving again → eggs work normally
		rampDriveRates(1, 1100); // ease back up to normal speed
		const now = performance.now();
		for (const key of Object.keys(removalTimers)) {
			const r = removalTimers[Number(key)];
			scheduleRemoval(Number(key), now + (r.remaining ?? Math.max(0, r.at - now)));
		}
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
		delete removalTimers[id];
		effects = nextEffects;
		paused = nextPaused;
		fireActive = nextFire;
	}

	function scheduleRemoval(id: number, at: number) {
		removalTimers[id] = { timer: setTimeout(() => removeVehicle(id), Math.max(0, at - performance.now())), at };
	}

	function postponeRemoval(id: number, extraMs: number) {
		const r = removalTimers[id];
		if (!r) return;
		clearTimeout(r.timer);
		scheduleRemoval(id, r.at + extraMs);
	}

	function spawnVehicle() {
		const typeIndex = getWeightedRandomVehicle();
		const vehicleType = vehicleTypes[typeIndex];
		const direction = getDirection(vehicleType);

		const duration = debugTrafficEnabled
			? (vehicleType.minDuration + vehicleType.maxDuration) / 2
			: Math.random() * (vehicleType.maxDuration - vehicleType.minDuration) + vehicleType.minDuration;
		const id = vehicleIdCounter++;

		if (debugTrafficEnabled) debugSpawnCounter++;

		activeVehicles = [...activeVehicles, { id, typeIndex, direction, duration }];

		scheduleRemoval(id, performance.now() + duration * 1000 + 200);
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
			if (!trafficFrozen) spawnVehicle(); // no new cars while snow covers the road
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

		return () => {
			unsub();
			unsubSnow();
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
			<VehicleSprite
				src={vehicleType.src}
				size={vehicleType.size}
				direction={vehicle.direction}
				effect={effects[vehicle.id]}
				fire={!!fireActive[vehicle.id]}
			/>
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
</style>
