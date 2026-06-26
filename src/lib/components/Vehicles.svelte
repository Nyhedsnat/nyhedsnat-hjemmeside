<script lang="ts">
	import { onMount } from 'svelte';
	import { triggerConvoy } from '$lib/stores/convoy';


	// When `grid` is true (used by /animation-test) the component renders one
	// stationary vehicle of every type in a grid so each click effect can be
	// previewed and replayed in isolation, instead of spawning live traffic.
	let { grid = false }: { grid?: boolean } = $props();

	const SIZE = {
		car: 45,
		large: 65,
		small: 24
	} as const;

	type SizeCategory = keyof typeof SIZE;
	type EffectName =
		| 'slingre'
		| 'flyout'
		| 'drift'
		| 'smokewheelie'
		| 'firestop'
		| 'splash'
		| 'press'
		| 'turbo'
		| 'wheelie'
		| 'meteorpanic'
		| 'nitro'
		| 'stretch'
		| 'uturn'
		| 'poof'
		| 'disco';

	interface VehicleType {
		src: string;
		size: SizeCategory;
		minDuration: number;
		maxDuration: number;
		weight: number;
		direction?: 'ltr' | 'rtl' | 'both';
	}

	interface ActiveVehicle {
		id: number;
		typeIndex: number;
		direction: 'ltr' | 'rtl';
		duration: number;
	}

	const vehicleTypes: VehicleType[] = [
		{ src: '/svg/eastereggs/vehicles/car-1.svg', size: 'car', minDuration: 8, maxDuration: 14, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-2.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-3.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-4.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/car-5.svg', size: 'car', minDuration: 9, maxDuration: 15, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/4x4.svg', size: 'car', minDuration: 12, maxDuration: 18, weight: 2 },
		{ src: '/svg/eastereggs/vehicles/random-short-car.svg', size: 'car', minDuration: 7, maxDuration: 12, weight: 2 },
		{ src: '/svg/eastereggs/vehicles/truck.svg', size: 'large', minDuration: 18, maxDuration: 28, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/moped.svg', size: 'small', minDuration: 16, maxDuration: 24, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/e-scooter.svg', size: 'small', minDuration: 20, maxDuration: 30, weight: 3 },
		{ src: '/svg/eastereggs/vehicles/nyhedsnat-car-rtl.svg', size: 'large', minDuration: 9, maxDuration: 14, weight: 4, direction: 'rtl' },
		{ src: '/svg/eastereggs/vehicles/nyhedsnat-car-ltr.svg', size: 'large', minDuration: 9, maxDuration: 14, weight: 4, direction: 'ltr' },
		{ src: '/svg/eastereggs/vehicles/dino-car.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 2 },
		{ src: '/svg/eastereggs/vehicles/racer.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 1 },
		{ src: '/svg/eastereggs/vehicles/limo.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 1 }
	];

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

	// Element ref per vehicle. Speed/direction effects (turbo, nitro, uturn)
	// drive the container's own CSS drive-animation via the Web Animations API
	// instead of layering a temporary transform on top of it — the latter made
	// the car snap back to the container's position when the effect ended.
	const containerEls: Record<number, HTMLDivElement> = {};

	function getDriveAnimation(id: number): Animation | undefined {
		const el = containerEls[id];
		if (!el) return undefined;
		// Svelte scopes keyframe names (e.g. "s-abc123-drive-rtl"), so match loosely.
		return el.getAnimations().find((a) => ((a as CSSAnimation).animationName ?? '').includes('drive'));
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
	// leaves on the side it entered from.
	function reverseDrive(id: number, rate = 1.5) {
		const anim = getDriveAnimation(id);
		if (!anim) return;
		anim.playbackRate = -Math.abs(rate);
	}

	function getHeight(size: SizeCategory): number {
		return SIZE[size];
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
	function handleClick(vehicle: ActiveVehicle) {
		const src = vehicleTypes[vehicle.typeIndex].src;

		if (src.includes('nyhedsnat-car-rtl') || src.includes('nyhedsnat-car-ltr')) {
			triggerConvoy.set(vehicle.direction); // convoy travels the same way as this car
			setEffect(vehicle.id, 'disco', 8000); // the car lights up to match the convoy
			return;
		}

		if (src.includes('car-1.svg')) return setEffect(vehicle.id, 'slingre', 3600);
		if (src.includes('car-2.svg')) {
			// Magic poof: keeps gliding while it spins and vanishes, then a confetti
			// burst — so the confetti appears where the car disappears, not behind it.
			// (The confetti is a child of the moving car, so it travels with it.)
			setEffect(vehicle.id, 'poof', 1300);
			// In the live scene it's gone for good; on the grid it reappears so it can replay.
			if (!grid) setTimeout(() => removeVehicle(vehicle.id), 1250);
			return;
		}
		if (src.includes('car-3.svg')) {
			// Keep fly state until vehicle naturally leaves screen
			setEffect(vehicle.id, 'flyout', 60000);
			return;
		}
		if (src.includes('car-4.svg')) return setEffect(vehicle.id, 'smokewheelie', 3000);
		if (src.includes('car-5.svg')) {
			fireStopSequence(vehicle.id);
			return;
		}
		if (src.includes('4x4.svg')) return setEffect(vehicle.id, 'splash', 1600);
		if (src.includes('random-short-car.svg')) return setEffect(vehicle.id, 'press', 2000);
		if (src.includes('truck.svg')) {
			setEffect(vehicle.id, 'turbo', 2600);
			boostDrive(vehicle.id, 3.4, 2400);
			return;
		}
		if (src.includes('moped.svg')) {
			setEffect(vehicle.id, 'wheelie', 2500);
			boostDrive(vehicle.id, 2.2, 1800); // surge forward via the drive (no snap-back)
			return;
		}
		if (src.includes('e-scooter.svg')) {
			setEffect(vehicle.id, 'uturn', 60000);
			setTimeout(() => reverseDrive(vehicle.id), 220);
			return;
		}
		if (src.includes('dino-car.svg')) {
			setEffect(vehicle.id, 'meteorpanic', 3500);
			setTimeout(() => boostDrive(vehicle.id, 3.5, 1800), 1300); // panic away after the meteor hits
			return;
		}
		if (src.includes('racer.svg')) {
			setEffect(vehicle.id, 'nitro', 2500);
			boostDrive(vehicle.id, 4.2, 1500);
			return;
		}
		if (src.includes('limo.svg')) return setEffect(vehicle.id, 'stretch', 2000);

		triggerConvoy.set(vehicle.direction);
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
	const removalTimers: Record<number, { timer: ReturnType<typeof setTimeout>; at: number }> = {};

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

	function scheduleNextSpawn() {
		const interval = debugTrafficEnabled
			? minSpawnInterval / spawnRateMultiplier
			: (Math.random() * (maxSpawnInterval - minSpawnInterval) + minSpawnInterval) / spawnRateMultiplier;
		setTimeout(() => {
			spawnVehicle();
			scheduleNextSpawn();
		}, interval);
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
	});
</script>

{#snippet vehicleCard(vehicle: ActiveVehicle)}
	{@const vehicleType = vehicleTypes[vehicle.typeIndex]}
	{@const height = getHeight(vehicleType.size)}
	{@const effect = effects[vehicle.id]}
	<div
		bind:this={containerEls[vehicle.id]}
		class="vehicle-container {vehicle.direction}"
		class:paused={!!paused[vehicle.id]}
		class:grid
		style="--duration: {vehicle.duration}s;"
	>
		<button class="vehicle-button" class:turbo-active={effect === 'turbo'} class:nitro-active={effect === 'nitro'} onclick={() => { if (!grid) handleClick(vehicle); }} aria-label="Vehicle action">
			{#if effect === 'drift' || effect === 'firestop' || effect === 'smokewheelie' || effect === 'nitro'}<div class="smoke" class:smoke-wild={effect === 'firestop'}></div>{/if}
			{#if effect === 'smokewheelie'}<div class="land-dust" aria-hidden="true"><span></span><span></span><span></span><span></span></div>{/if}
			{#if effect === 'firestop'}<div class="smoke smoke-wild smoke-second"></div>{/if}
			{#if fireActive[vehicle.id]}<div class="engine-fire" aria-hidden="true"><span class="fire-tongue"></span><span class="fire-tongue"></span><span class="fire-tongue"></span><span class="fire-core"></span></div>{/if}
			{#if effect === 'turbo'}<div class="flame turbo-flame"></div>{/if}
			{#if effect === 'nitro'}<div class="exhaust-fire"></div>{/if}
			{#if effect === 'press'}<div class="breaking">BREAKING</div>{/if}
			{#if effect === 'disco'}<div class="disco-glow disco-car" aria-hidden="true"></div><div class="disco-glow disco-trailer" aria-hidden="true"></div>{/if}
			{#if effect === 'splash'}
				<div class="water-splash" aria-hidden="true">
					<div class="puddle"></div>
					<div class="splash-sheet"></div>
					<span class="drop"></span><span class="drop"></span><span class="drop"></span>
					<span class="drop"></span><span class="drop"></span><span class="drop"></span>
					<span class="drop"></span><span class="drop"></span><span class="drop"></span>
				</div>
			{/if}
			{#if effect === 'poof'}
				<div class="poof-fx" aria-hidden="true">
					<span></span><span></span><span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span><span></span><span></span>
				</div>
			{/if}
			{#if effect === 'meteorpanic'}
				<div class="meteor">
					<div class="meteor-trail" aria-hidden="true">
						<span></span><span></span><span></span><span></span><span></span><span></span>
					</div>
					<img src="/svg/eastereggs/vehicles/meteor.svg" alt="" draggable="false" />
				</div>
				<div class="meteor-flash"></div>
				<div class="meteor-shockwave"></div>
				<div class="meteor-fire"></div>
				<div class="meteor-smoke"></div>
			{/if}
			<img
				src={vehicleType.src}
				alt=""
				class="vehicle {effect ?? ''}"
				style="height: {height}px;"
				draggable="false"
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

	.vehicle-container.paused {
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

	.vehicle-container.ltr .vehicle {
		transform: scaleX(-1);
	}

	.vehicle {
		position: relative;
		z-index: 2;
		width: auto;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	.vehicle-container.ltr .vehicle.slingre { animation: slingre-ltr 3.6s ease-in-out; }
	.vehicle-container.rtl .vehicle.slingre { animation: slingre-rtl 3.6s ease-in-out; }
	.vehicle-container.ltr .vehicle.flyout { animation: flyout-ltr 8s ease-in-out forwards; }
	.vehicle-container.rtl .vehicle.flyout { animation: flyout-rtl 8s ease-in-out forwards; }
	.vehicle.drift { animation: drift 1.8s ease-out; }
	.vehicle-container.ltr .vehicle.firestop { animation: fireShake-ltr 1.2s linear 2; }
	.vehicle-container.rtl .vehicle.firestop { animation: fireShake-rtl 1.2s linear 2; }
	.vehicle-container.ltr .vehicle.splash { animation: splash-bob-ltr 1.2s ease-out; }
	.vehicle-container.rtl .vehicle.splash { animation: splash-bob-rtl 1.2s ease-out; }
	.vehicle.press { animation: flash 0.2s steps(2, end) 10; }
	/* turbo/nitro motion is driven by the container's drive-animation playbackRate
	   (see boostDrive) — the image only carries the visual treatment. */
	.vehicle-container.ltr .vehicle.wheelie {
		transform-origin: 50% 100%;
		animation: wheelie-ltr 2.5s ease-out;
	}
	.vehicle-container.rtl .vehicle.wheelie {
		transform-origin: 50% 100%;
		animation: wheelie-rtl 2.5s ease-out;
	}
	.vehicle-container.ltr .vehicle.smokewheelie {
		transform-origin: 50% 100%;
		animation: smokewheelie-ltr 3s ease-in-out;
	}
	.vehicle-container.rtl .vehicle.smokewheelie {
		transform-origin: 50% 100%;
		animation: smokewheelie-rtl 3s ease-in-out;
	}
	.vehicle-container.ltr .vehicle.meteorpanic { animation: panic-ltr 3.5s ease-out; }
	.vehicle-container.rtl .vehicle.meteorpanic { animation: panic-rtl 3.5s ease-out; }
	.vehicle.nitro { filter: blur(0.8px) saturate(1.4); }
	/* Stretch limo: comically elongates with an elastic boing, then springs back.
	   transform-origin at the road keeps the wheels grounded while it jiggles. */
	.vehicle.stretch { transform-origin: 50% 100%; }
	.vehicle-container.ltr .vehicle.stretch { animation: stretch-ltr 2s ease-in-out; }
	.vehicle-container.rtl .vehicle.stretch { animation: stretch-rtl 2s ease-in-out; }
	.vehicle-container.ltr .vehicle.uturn { animation: uturn-ltr 2.1s linear forwards; }
	.vehicle-container.rtl .vehicle.uturn { animation: uturn-rtl 2.1s linear forwards; }
	.vehicle-container.ltr .vehicle.poof { animation: poof-ltr 0.4s ease-in forwards; }
	.vehicle-container.rtl .vehicle.poof { animation: poof-rtl 0.4s ease-in forwards; }

	/* Magic vanish confetti — bursts from the car's spot just as it disappears. */
	/* Centred on the car body, not the image centre — car-2's SVG includes a long
	   headlight beam, so the wheel-centre is ~26% for the flipped ltr car and ~74%
	   for the rtl car. The 0.34s delay makes the burst land the instant the car
	   has finished vanishing (the poof animation is 0.4s). */
	.poof-fx {
		position: absolute;
		left: 26%;
		top: 45%;
		width: 0;
		height: 0;
		z-index: 5;
		pointer-events: none;
	}
	.vehicle-container.rtl .poof-fx {
		left: 74%;
	}
	.poof-fx span {
		position: absolute;
		left: 0;
		top: 0;
		width: 7px;
		height: 7px;
		border-radius: 2px;
		opacity: 0;
		animation: confetti-burst 0.8s ease-out 0.34s forwards;
	}
	.poof-fx span:nth-child(1)  { background: #ff2a6d; --dx: 46px;  --dy: -34px; }
	.poof-fx span:nth-child(2)  { background: #ff8a00; --dx: -42px; --dy: -30px; }
	.poof-fx span:nth-child(3)  { background: #ffe600; --dx: 30px;  --dy: -52px; }
	.poof-fx span:nth-child(4)  { background: #00f5a0; --dx: -28px; --dy: -50px; }
	.poof-fx span:nth-child(5)  { background: #00d4ff; --dx: 54px;  --dy: -8px;  }
	.poof-fx span:nth-child(6)  { background: #7b61ff; --dx: -54px; --dy: -6px;  }
	.poof-fx span:nth-child(7)  { background: #ff2ad4; --dx: 14px;  --dy: -58px; }
	.poof-fx span:nth-child(8)  { background: #ffe600; --dx: -16px; --dy: -44px; }
	.poof-fx span:nth-child(9)  { background: #ff2a6d; --dx: 38px;  --dy: -22px; }
	.poof-fx span:nth-child(10) { background: #00d4ff; --dx: -38px; --dy: -18px; }
	.poof-fx span:nth-child(11) { background: #ff8a00; --dx: 8px;   --dy: -40px; }
	.poof-fx span:nth-child(12) { background: #00f5a0; --dx: -8px;  --dy: -36px; }

	.smoke {
		position: absolute;
		left: 20%;
		top: -20px;
		width: 40px;
		height: 40px;
		background: radial-gradient(circle, rgba(120,120,120,.7), transparent 70%);
		animation: smoke 1.2s ease-out infinite;
		pointer-events: none;
	}
	.vehicle-container.rtl .smoke {
		left: auto;
		right: 15%;
	}
	/* firestop: bigger, darker, faster "wild" smoke + a second offset puff */
	.smoke.smoke-wild {
		width: 60px;
		height: 60px;
		top: -34px;
		background: radial-gradient(circle, rgba(70,70,75,.9), transparent 70%);
		animation-duration: 0.8s;
	}
	.smoke.smoke-second {
		left: 42%;
		top: -22px;
		width: 46px;
		height: 46px;
		animation-duration: 0.95s;
		animation-delay: -0.4s;
	}
	.vehicle-container.rtl .smoke.smoke-second {
		left: auto;
		right: 38%;
	}
	/* firestop: engine fire — several flame tongues of different heights with a
	   bright core, each licking on its own timing so it reads as a real fire. */
	.engine-fire {
		position: absolute;
		left: 26%;
		bottom: 6px;
		width: 34px;
		height: 46px;
		z-index: 3;
		pointer-events: none;
		transform-origin: bottom center;
		opacity: 0;
		animation: engine-fire-burst 3.9s ease-out forwards;
	}
	/* shared flame-tongue shape: rounded base, tapered point at the top */
	.fire-tongue,
	.fire-core {
		position: absolute;
		bottom: 0;
		transform-origin: bottom center;
		clip-path: polygon(50% 0%, 67% 28%, 82% 56%, 71% 84%, 50% 100%, 29% 84%, 18% 56%, 33% 28%);
	}
	.fire-tongue {
		background: linear-gradient(to top, #ffcf4d 0%, #ff8a1f 28%, #ff3d05 58%, rgba(206, 32, 0, 0.55) 84%, transparent 100%);
		filter: blur(1.5px);
	}
	.fire-tongue:nth-child(1) { left: 0;    bottom: 1px; width: 17px; height: 30px; animation: flame-lick 0.4s  ease-in-out infinite; }
	.fire-tongue:nth-child(2) { left: 8px;  bottom: 0;   width: 20px; height: 46px; animation: flame-lick 0.32s ease-in-out infinite reverse; }
	.fire-tongue:nth-child(3) { left: 19px; bottom: 1px; width: 15px; height: 27px; animation: flame-lick 0.46s ease-in-out infinite; animation-delay: -0.13s; }
	.fire-core {
		left: 9px;
		width: 16px;
		height: 30px;
		background: linear-gradient(to top, #ffffff 0%, #fff2ac 32%, #ffbb3a 66%, rgba(255, 140, 0, 0.4) 90%, transparent 100%);
		filter: blur(0.9px);
		animation: flame-lick 0.28s ease-in-out infinite;
	}
	.vehicle-container.rtl .engine-fire {
		left: auto;
		right: 26%;
	}
	/* nyhedsnat rig gets a rainbow RGB underglow on click, matching the convoy —
	   one glow under the car, one under the trailer. The SVG has a long headlight
	   beam, so positions are taken from the wheel cx values (car ~41% natural,
	   trailer ~84%/82%), mirrored to rendered % for the flipped ltr car. */
	.disco-glow {
		position: absolute;
		bottom: 3px;
		transform: translateX(-50%);
		width: 70px;
		height: 9px;
		border-radius: 999px;
		background: linear-gradient(90deg, #ff2a6d, #ff8a00, #ffe600, #00f5a0, #00d4ff, #7b61ff, #ff2ad4);
		background-size: 250% 100%;
		filter: blur(4px);
		opacity: 0.85;
		z-index: 1;
		pointer-events: none;
		animation: disco-shift 1.1s linear infinite, disco-flicker 0.35s steps(2, end) infinite;
	}
	.disco-car {
		left: 58%;
	}
	.disco-trailer {
		left: 16%;
		width: 60px;
		animation-delay: -0.18s, -0.12s; /* shimmer slightly out of phase with the car */
	}
	.vehicle-container.rtl .disco-car {
		left: 41%;
	}
	.vehicle-container.rtl .disco-trailer {
		left: 82%;
	}
	/* Dust kicked up as the wheelie's front wheel lands (~2.2s into smokewheelie). */
	.land-dust {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		z-index: 1;
		pointer-events: none;
	}
	.land-dust span {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(170, 158, 138, 0.7), transparent 70%);
		filter: blur(1px);
		opacity: 0;
		animation: land-dust-puff 0.55s ease-out 2.45s forwards;
	}
	.land-dust span:nth-child(1) { --dx: -34px; }
	.land-dust span:nth-child(2) { --dx: -12px; }
	.land-dust span:nth-child(3) { --dx: 12px; }
	.land-dust span:nth-child(4) { --dx: 34px; }

	/* 4x4 plows through a puddle: a water splash centred between the wheels.
	   The SVG also contains a long headlight beam, so the wheel-centre is NOT the
	   image centre — wheels sit at ~70% of the SVG (cx 342 & 466 of a 580 box),
	   which mirrors to ~30% when the car is flipped for ltr.
	   (Named .water-splash so it never collides with the img's .splash effect class.) */
	.water-splash {
		position: absolute;
		bottom: 0;
		left: 30%;
		width: 0;
		height: 0;
		z-index: 4; /* in front of the car body so the centred spray stays visible */
		pointer-events: none;
	}
	.vehicle-container.rtl .water-splash {
		left: 70%;
	}
	.water-splash .puddle {
		position: absolute;
		bottom: 1px;
		left: 50%;
		width: 96px;
		height: 12px;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(150, 200, 235, 0.5), rgba(150, 200, 235, 0) 70%);
		opacity: 0;
		transform: translateX(-50%) scaleX(0.2);
		animation: puddle-ripple 1.5s ease-out forwards;
	}
	.splash-sheet {
		position: absolute;
		bottom: 2px;
		left: 50%;
		width: 40px;
		height: 32px;
		border-radius: 50% 50% 42% 42%;
		background: radial-gradient(ellipse at bottom, rgba(205, 230, 250, 0.9), rgba(150, 200, 235, 0.35) 55%, transparent 78%);
		filter: blur(0.5px);
		opacity: 0;
		transform-origin: bottom center;
		transform: translateX(-50%);
		animation: splash-sheet 0.7s ease-out forwards;
	}
	.water-splash .drop {
		position: absolute;
		bottom: 6px;
		left: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(205, 232, 250, 0.95);
		box-shadow: 0 0 3px rgba(150, 200, 235, 0.7);
		opacity: 0;
		animation: splash-drop 0.75s ease-out forwards;
	}
	.water-splash .drop:nth-child(3)  { --dx: -38px; --dy: -30px; animation-delay: 0s; }
	.water-splash .drop:nth-child(4)  { --dx: -22px; --dy: -44px; animation-delay: 0.03s; }
	.water-splash .drop:nth-child(5)  { --dx: -8px;  --dy: -50px; animation-delay: 0.01s; }
	.water-splash .drop:nth-child(6)  { --dx: 8px;   --dy: -48px; animation-delay: 0.04s; }
	.water-splash .drop:nth-child(7)  { --dx: 24px;  --dy: -42px; animation-delay: 0.02s; }
	.water-splash .drop:nth-child(8)  { --dx: 40px;  --dy: -28px; animation-delay: 0.05s; }
	.water-splash .drop:nth-child(9)  { --dx: 56px;  --dy: -14px; animation-delay: 0s; }
	.water-splash .drop:nth-child(10) { --dx: -54px; --dy: -16px; animation-delay: 0.06s; }
	.water-splash .drop:nth-child(11) { --dx: 16px;  --dy: -54px; animation-delay: 0.03s; }
	.flame {
		position: absolute;
		top: 35%;
		left: -16px;
		width: 16px;
		height: 10px;
		background: linear-gradient(90deg, #30cfff, #7ee7ff, transparent);
		filter: blur(1px);
		animation: flame 0.16s steps(2, end) infinite;
	}

	.turbo-flame {
		z-index: 1;
		top: 26%;
		left: -104px;
		width: 104px;
		height: 26px;
		background: linear-gradient(90deg, #ffffff 0%, #ade6ff 22%, #38baff 52%, rgba(0, 140, 255, 0.55) 78%, transparent 100%);
		filter: blur(1.5px);
		border-radius: 999px;
	}

	.vehicle-container.ltr .turbo-flame {
		transform: rotate(180deg);
	}

	.vehicle-container.rtl .flame {
		left: auto;
		right: -16px;
	}

	.vehicle-container.rtl .turbo-flame {
		left: auto;
		right: -104px;
	}

	.vehicle-button.turbo-active .turbo-flame {
		animation: turbo-flicker 0.16s steps(2, end) infinite;
	}

	/* Horizontal nitro jet blasting out of the rear (bumper height), not a
	   vertical flame rising from the road. ltr: car faces right, rear is on
	   the left, so the jet sits on the left with its hot white end at the car. */
	.exhaust-fire {
		position: absolute;
		bottom: 13px;
		left: -66px;
		width: 70px;
		height: 18px;
		pointer-events: none;
		z-index: 1;
		transform-origin: right center;
	}
	.exhaust-fire::before {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg,
			transparent 0%,
			rgba(200,30,0,0.5) 20%,
			rgba(255,100,10,0.9) 48%,
			rgba(255,220,60,1) 82%,
			rgba(255,255,255,1) 100%
		);
		filter: blur(2px);
		border-radius: 60% 50% 50% 60% / 50%;
		animation: exhaust-flicker 0.1s steps(2, end) infinite;
		transform-origin: right center;
	}
	.exhaust-fire::after {
		content: '';
		position: absolute;
		top: 18%;
		right: 0;
		width: 68%;
		height: 64%;
		background: linear-gradient(90deg, transparent 0%, rgba(255,240,120,0.85) 55%, rgba(255,255,255,1) 100%);
		filter: blur(1px);
		border-radius: 60% 50% 50% 60% / 50%;
		animation: exhaust-inner 0.08s steps(2, end) infinite;
		transform-origin: right center;
	}
	.vehicle-container.ltr .vehicle-button.nitro-active .exhaust-fire {
		animation: nitro-follow-ltr 2.5s ease-out forwards;
	}
	/* rtl: car faces left, rear is on the right → jet on the right, hot end on the left */
	.vehicle-container.rtl .exhaust-fire {
		left: auto;
		right: -66px;
		transform-origin: left center;
	}
	.vehicle-container.rtl .exhaust-fire::before {
		background: linear-gradient(90deg,
			rgba(255,255,255,1) 0%,
			rgba(255,220,60,1) 18%,
			rgba(255,100,10,0.9) 52%,
			rgba(200,30,0,0.5) 80%,
			transparent 100%
		);
		border-radius: 50% 60% 60% 50% / 50%;
		transform-origin: left center;
	}
	.vehicle-container.rtl .exhaust-fire::after {
		right: auto;
		left: 0;
		background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,240,120,0.85) 45%, transparent 100%);
		border-radius: 50% 60% 60% 50% / 50%;
		transform-origin: left center;
	}
	.vehicle-container.rtl .vehicle-button.nitro-active .exhaust-fire {
		animation: nitro-follow-rtl 2.5s ease-out forwards;
	}
	.breaking {
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);
		background: #c00;
		color: white;
		font-size: 9px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		animation: fade 2s linear forwards;
	}
	.meteor {
		position: absolute;
		left: -150px;
		top: -420px;
		animation: meteorDrop 1.8s ease-in forwards;
		pointer-events: none;
	}
	.meteor img {
		position: relative;
		z-index: 2;
		width: 64px;
		height: auto;
		filter: drop-shadow(0 0 12px rgba(255, 100, 0, 1)) drop-shadow(0 0 4px #fff);
	}
	.meteor-fire {
		position: absolute;
		left: -110px;
		bottom: -4px;
		width: 55px;
		height: 65px;
		pointer-events: none;
		z-index: 3;
		background: radial-gradient(ellipse at bottom, rgba(255,255,255,0.95) 0%, rgba(255,150,0,0.85) 28%, rgba(255,50,0,0.6) 58%, transparent 100%);
		filter: blur(3px);
		border-radius: 50% 50% 0 0;
		opacity: 0;
		animation: meteor-fire-burst 2.2s ease-out 1.55s forwards;
	}
	.vehicle-container.rtl .meteor-fire {
		left: auto;
		right: -110px;
	}
	.meteor-flash {
		position: absolute;
		left: -120px;
		bottom: -6px;
		width: 110px;
		height: 110px;
		border-radius: 50%;
		background: radial-gradient(circle, #fff 0%, rgba(255,230,80,0.95) 22%, rgba(255,100,10,0.6) 55%, transparent 100%);
		filter: blur(3px);
		transform: scale(0);
		opacity: 0;
		pointer-events: none;
		z-index: 5;
		animation: meteor-flash 0.55s ease-out 1.52s forwards;
	}
	.vehicle-container.rtl .meteor-flash {
		left: auto;
		right: -120px;
	}
	.meteor-shockwave {
		position: absolute;
		left: -148px;
		bottom: -2px;
		width: 96px;
		height: 20px;
		border: 3px solid rgba(255, 200, 60, 0.95);
		border-radius: 50%;
		transform: scale(0.08);
		opacity: 0;
		pointer-events: none;
		z-index: 4;
		animation: meteor-shockwave 0.9s ease-out 1.54s forwards;
	}
	.vehicle-container.rtl .meteor-shockwave {
		left: auto;
		right: -148px;
	}
	.meteor-smoke {
		position: absolute;
		left: -140px;
		bottom: 2px;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(90,70,50,0.9) 0%, rgba(60,45,30,0.65) 50%, transparent 100%);
		filter: blur(8px);
		transform: scale(0) translateY(0);
		opacity: 0;
		pointer-events: none;
		z-index: 2;
		animation: meteor-smoke-rise 3s ease-out 1.58s forwards;
	}
	.vehicle-container.rtl .meteor-smoke {
		left: auto;
		right: -140px;
	}
	.meteor-trail {
		position: absolute;
		left: 36px;
		top: 22px;
		width: 70px;
		height: 40px;
		z-index: 1;
		pointer-events: none;
	}
	.meteor-trail span {
		position: absolute;
		right: 0;
		top: 50%;
		width: 30px;
		height: 8px;
		transform: translateY(-50%);
		border-radius: 999px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.85), rgba(255, 180, 60, 0.8), rgba(255, 80, 0, 0));
		filter: blur(1px);
		animation: meteorTrail 0.35s ease-out infinite;
	}
	.meteor-trail span:nth-child(2) { top: 35%; width: 22px; animation-delay: -0.08s; }
	.meteor-trail span:nth-child(3) { top: 62%; width: 26px; animation-delay: -0.15s; }
	.meteor-trail span:nth-child(4) { top: 18%; width: 18px; animation-delay: -0.05s; }
	.meteor-trail span:nth-child(5) { top: 78%; width: 20px; animation-delay: -0.19s; }
	.meteor-trail span:nth-child(6) { top: 50%; width: 35px; animation-delay: -0.24s; opacity: 0.7; }
	.vehicle-container.rtl .meteor {
		left: auto;
		right: -150px;
		animation-name: meteorDropRtl;
	}
	.vehicle-container.rtl .meteor-trail {
		left: auto;
		right: 36px;
		transform: scaleX(-1);
	}

	@keyframes drive-ltr { 0% { transform: translateX(-250px);} 100% { transform: translateX(calc(100vw + 250px));}}
	@keyframes drive-rtl { 0% { transform: translateX(250px);} 100% { transform: translateX(calc(-100vw - 250px));}}
	@keyframes slingre-ltr { 0%,100%{ transform: translateY(0) scaleX(-1);} 25%{ transform: translateY(-15px) scaleX(-1);} 50%{ transform: translateY(15px) scaleX(-1);} 75%{ transform: translateY(-9px) scaleX(-1);} }
	@keyframes slingre-rtl { 0%,100%{ transform: translateY(0);} 25%{ transform: translateY(-15px);} 50%{ transform: translateY(15px);} 75%{ transform: translateY(-9px);} }
	/* Climb to a capped height (~30% lower than before, so it clears the UI
	   above), then level off and fly straight out the side. */
	@keyframes flyout-ltr {
		0%   { transform: translateY(0)      translateX(0)    scaleX(-1); }
		20%  { transform: translateY(-84px)  translateX(28px)  scaleX(-1); }
		40%  { transform: translateY(-174px) translateX(64px)  scaleX(-1); }
		55%  { transform: translateY(-220px) translateX(105px) scaleX(-1); }
		100% { transform: translateY(-220px) translateX(440px) scaleX(-1); }
	}
	@keyframes flyout-rtl {
		0%   { transform: translateY(0)      translateX(0)     scaleX(1); }
		20%  { transform: translateY(-84px)  translateX(-28px)  scaleX(1); }
		40%  { transform: translateY(-174px) translateX(-64px)  scaleX(1); }
		55%  { transform: translateY(-220px) translateX(-105px) scaleX(1); }
		100% { transform: translateY(-220px) translateX(-440px) scaleX(1); }
	}
	@keyframes drift { 0%{ transform: scaleX(-1);} 35%{ transform: translateX(30px) rotate(-12deg) scaleX(-1);} 100%{ transform: scaleX(-1);} }
	@keyframes fireShake-ltr { 0%,100%{ transform: translateX(0) scaleX(-1);} 25%{ transform: translateX(-4px) scaleX(-1);} 75%{ transform: translateX(4px) scaleX(-1);} }
	@keyframes fireShake-rtl { 0%,100%{ transform: translateX(0);} 25%{ transform: translateX(-4px);} 75%{ transform: translateX(4px);} }
	/* 4x4 dips into the puddle on impact, rebounds on its suspension, settles. */
	@keyframes splash-bob-ltr {
		0%   { transform: scaleX(-1) translateY(0)    rotate(0); }
		16%  { transform: scaleX(-1) translateY(3px)  rotate(2deg); }
		42%  { transform: scaleX(-1) translateY(-2px) rotate(-1deg); }
		70%  { transform: scaleX(-1) translateY(1px)  rotate(0.5deg); }
		100% { transform: scaleX(-1) translateY(0)    rotate(0); }
	}
	@keyframes splash-bob-rtl {
		0%   { transform: translateY(0)    rotate(0); }
		16%  { transform: translateY(3px)  rotate(-2deg); }
		42%  { transform: translateY(-2px) rotate(1deg); }
		70%  { transform: translateY(1px)  rotate(-0.5deg); }
		100% { transform: translateY(0)    rotate(0); }
	}
	@keyframes splash-drop {
		0%   { opacity: 0; transform: translate(0, 0) scale(0.4); }
		12%  { opacity: 1; }
		55%  { opacity: 1; transform: translate(calc(var(--dx) * 0.62), var(--dy)) scale(1); }
		100% { opacity: 0; transform: translate(var(--dx), -3px) scale(0.6); }
	}
	@keyframes splash-sheet {
		0%   { opacity: 0;   transform: translateX(-50%) scaleY(0.2) scaleX(0.7); }
		22%  { opacity: 0.9; transform: translateX(-50%) scaleY(1.15) scaleX(1); }
		100% { opacity: 0;   transform: translateX(-50%) scaleY(0.5) scaleX(1.4); }
	}
	@keyframes puddle-ripple {
		0%   { opacity: 0;   transform: translateX(-50%) scaleX(0.2); }
		20%  { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
		100% { opacity: 0;   transform: translateX(-50%) scaleX(1.7); }
	}
	@keyframes turbo-flicker {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}
	/* Pivot at rear wheel (~80% from physical left in original SVG).
	   LTR uses scaleX(-1) last so rotation runs in the original coordinate space. */
	/* Double-lift wheelie, pivoting at the rear wheel. No net translate — the
	   forward surge comes from the container drive (boostDrive), so it never snaps. */
	@keyframes wheelie-ltr {
		0%   { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); }
		15%  { transform: scaleX(-1) translateX(30%) rotate(32deg) translateX(-30%); }
		35%  { transform: scaleX(-1) translateX(30%) rotate(10deg) translateX(-30%); }
		55%  { transform: scaleX(-1) translateX(30%) rotate(30deg) translateX(-30%); }
		80%  { transform: scaleX(-1) translateX(30%) rotate(12deg) translateX(-30%); }
		100% { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); }
	}
	@keyframes wheelie-rtl {
		0%   { transform: translateX(30%) rotate(0)     translateX(-30%); }
		15%  { transform: translateX(30%) rotate(32deg) translateX(-30%); }
		35%  { transform: translateX(30%) rotate(10deg) translateX(-30%); }
		55%  { transform: translateX(30%) rotate(30deg) translateX(-30%); }
		80%  { transform: translateX(30%) rotate(12deg) translateX(-30%); }
		100% { transform: translateX(30%) rotate(0)     translateX(-30%); }
	}
	/* Scared trembling + a startled hop, all returning to neutral. The "speeds
	   away" comes from the container drive (boostDrive), so nothing snaps back. */
	@keyframes panic-ltr {
		0%   { transform: translateX(0)    translateY(0)     scaleX(-1); }
		7%   { transform: translateX(10px) translateY(0)     scaleX(-1); }
		14%  { transform: translateX(-8px) translateY(0)     scaleX(-1); }
		21%  { transform: translateX(12px) translateY(0)     scaleX(-1); }
		28%  { transform: translateX(-6px) translateY(0)     scaleX(-1); }
		35%  { transform: translateX(8px)  translateY(0)     scaleX(-1); }
		42%  { transform: translateX(0)    translateY(-16px) scaleX(-1); }
		52%  { transform: translateX(0)    translateY(0)     scaleX(-1); }
		100% { transform: translateX(0)    translateY(0)     scaleX(-1); }
	}
	@keyframes panic-rtl {
		0%   { transform: translateX(0)     translateY(0)     scaleX(1); }
		7%   { transform: translateX(-10px) translateY(0)     scaleX(1); }
		14%  { transform: translateX(8px)   translateY(0)     scaleX(1); }
		21%  { transform: translateX(-12px) translateY(0)     scaleX(1); }
		28%  { transform: translateX(6px)   translateY(0)     scaleX(1); }
		35%  { transform: translateX(-8px)  translateY(0)     scaleX(1); }
		42%  { transform: translateX(0)     translateY(-16px) scaleX(1); }
		52%  { transform: translateX(0)     translateY(0)     scaleX(1); }
		100% { transform: translateX(0)     translateY(0)     scaleX(1); }
	}
	/* scaleX magnitude grows (longer); scaleY counter-squashes for jello weight.
	   The limo keeps its facing because the sign of scaleX is preserved. */
	@keyframes stretch-ltr {
		0%   { transform: scaleX(-1)    scaleY(1); }
		18%  { transform: scaleX(-1.75) scaleY(0.88); }
		34%  { transform: scaleX(-1.5)  scaleY(0.95); }
		52%  { transform: scaleX(-1.62) scaleY(0.9); }
		70%  { transform: scaleX(-0.86) scaleY(1.08); }
		84%  { transform: scaleX(-1.08) scaleY(0.97); }
		93%  { transform: scaleX(-0.97) scaleY(1.02); }
		100% { transform: scaleX(-1)    scaleY(1); }
	}
	@keyframes stretch-rtl {
		0%   { transform: scaleX(1)    scaleY(1); }
		18%  { transform: scaleX(1.75) scaleY(0.88); }
		34%  { transform: scaleX(1.5)  scaleY(0.95); }
		52%  { transform: scaleX(1.62) scaleY(0.9); }
		70%  { transform: scaleX(0.86) scaleY(1.08); }
		84%  { transform: scaleX(1.08) scaleY(0.97); }
		93%  { transform: scaleX(0.97) scaleY(1.02); }
		100% { transform: scaleX(1)    scaleY(1); }
	}
	@keyframes smoke { from { transform: scale(.6); opacity:.8;} to{ transform: translateY(-35px) scale(1.2); opacity:0;} }
	@keyframes flame { 0%,100%{ opacity:.5; width:12px;} 50%{ opacity:1; width:20px;} }
	@keyframes meteorDrop {
		0%   { transform: translate(0, 0) rotate(-42deg); opacity: 1; filter: brightness(1.3); }
		80%  { transform: translate(40px, 400px) rotate(-24deg); opacity: 1; filter: brightness(1.8); }
		90%  { transform: translate(46px, 462px) rotate(-14deg); opacity: 1; filter: brightness(3); }
		93%  { transform: translate(46px, 468px) rotate(-10deg); opacity: 1; filter: brightness(10) drop-shadow(0 0 28px #fff) drop-shadow(0 0 14px #ff8800); }
		96%  { transform: translate(46px, 470px) rotate(-8deg);  opacity: 0; filter: brightness(1); }
		100% { transform: translate(46px, 470px) rotate(-8deg);  opacity: 0; }
	}
	@keyframes meteorDropRtl {
		0%   { transform: translate(0, 0) rotate(42deg); opacity: 1; filter: brightness(1.3); }
		80%  { transform: translate(-40px, 400px) rotate(24deg); opacity: 1; filter: brightness(1.8); }
		90%  { transform: translate(-46px, 462px) rotate(14deg); opacity: 1; filter: brightness(3); }
		93%  { transform: translate(-46px, 468px) rotate(10deg); opacity: 1; filter: brightness(10) drop-shadow(0 0 28px #fff) drop-shadow(0 0 14px #ff8800); }
		96%  { transform: translate(-46px, 470px) rotate(8deg);  opacity: 0; filter: brightness(1); }
		100% { transform: translate(-46px, 470px) rotate(8deg);  opacity: 0; }
	}
	@keyframes meteorTrail {
		0% { opacity: 0.9; transform: translateY(-50%) scaleX(0.5); }
		100% { opacity: 0; transform: translateY(-50%) translateX(-26px) scaleX(1.1); }
	}
	@keyframes flash { 50%{ filter: brightness(2);} }
	@keyframes fade { to { opacity: 0; } }
	@keyframes engine-fire-burst {
		0%   { opacity: 0;   transform: scaleY(0.3) scaleX(0.8); }
		5%   { opacity: 1;   transform: scaleY(1.15) scaleX(1.05); }
		86%  { opacity: 1;   transform: scaleY(1) scaleX(0.97); }
		100% { opacity: 0;   transform: scaleY(0.4) scaleX(0.72); }
	}
	/* organic flame licking — tongue stretches/shrinks and sways side to side */
	@keyframes flame-lick {
		0%   { transform: scaleY(1)    scaleX(1)    skewX(0deg); }
		25%  { transform: scaleY(1.16) scaleX(0.9)  skewX(-5deg); }
		50%  { transform: scaleY(0.93) scaleX(1.06) skewX(4deg); }
		75%  { transform: scaleY(1.12) scaleX(0.94) skewX(-3deg); }
		100% { transform: scaleY(1)    scaleX(1)    skewX(2deg); }
	}
	@keyframes disco-shift {
		0%   { background-position: 0% 50%; }
		100% { background-position: 250% 50%; }
	}
	@keyframes disco-flicker {
		0%, 100% { opacity: 0.6; }
		50%      { opacity: 1; }
	}
	@keyframes land-dust-puff {
		0%   { opacity: 0;   transform: translate(0, 0) scale(0.3); }
		25%  { opacity: 0.8; }
		100% { opacity: 0;   transform: translate(var(--dx), -8px) scale(1.4); }
	}
	@keyframes exhaust-flicker {
		0%, 100% { transform: scaleX(0.88) scaleY(0.82); opacity: 0.85; }
		50%       { transform: scaleX(1.12) scaleY(1.18); opacity: 1; }
	}
	@keyframes exhaust-inner {
		0%, 100% { transform: scaleY(0.72); opacity: 0.8; }
		50%       { transform: scaleY(1.05); opacity: 1; }
	}
	/* Follow the car's launch and let the jet stretch out backwards (scaleX
	   grows away from the car, since transform-origin sits at the car end). */
	/* The jet stretches backwards then settles (transform-origin sits at the car
	   end); the car's forward motion now comes from the container speed-up. */
	@keyframes nitro-follow-ltr {
		0%   { transform: scaleX(0.55); opacity: 0.7; }
		14%  { transform: scaleX(1.35); opacity: 1; }
		45%  { transform: scaleX(1.1);  opacity: 1; }
		100% { transform: scaleX(0.85); opacity: 0.85; }
	}
	@keyframes nitro-follow-rtl {
		0%   { transform: scaleX(0.55); opacity: 0.7; }
		14%  { transform: scaleX(1.35); opacity: 1; }
		45%  { transform: scaleX(1.1);  opacity: 1; }
		100% { transform: scaleX(0.85); opacity: 0.85; }
	}
	@keyframes meteor-fire-burst {
		0%   { transform: scale(0)   translateY(0);     opacity: 1;   filter: blur(2px) brightness(4); }
		18%  { transform: scale(1.8) translateY(-18px); opacity: 1;   filter: blur(3px) brightness(2.5); }
		45%  { transform: scale(2.6) translateY(-38px); opacity: 0.8; filter: blur(4px) brightness(1.5); }
		75%  { transform: scale(3.2) translateY(-60px); opacity: 0.4; filter: blur(5px); }
		100% { transform: scale(3.8) translateY(-85px); opacity: 0;   filter: blur(6px); }
	}
	@keyframes meteor-flash {
		0%   { transform: scale(0.1); opacity: 1;   filter: blur(1px) brightness(8); }
		18%  { transform: scale(1.3); opacity: 1;   filter: blur(3px) brightness(5); }
		50%  { transform: scale(2.2); opacity: 0.6; filter: blur(5px) brightness(2); }
		100% { transform: scale(3.5); opacity: 0;   filter: blur(8px) brightness(1); }
	}
	@keyframes meteor-shockwave {
		0%   { transform: scale(0.08); opacity: 1;   border-color: rgba(255,255,200,0.98); }
		25%  { transform: scale(1.4);  opacity: 0.9; border-color: rgba(255,180,40,0.85); }
		60%  { transform: scale(3.5);  opacity: 0.45; border-color: rgba(255,100,20,0.4); }
		100% { transform: scale(7);    opacity: 0;   border-color: rgba(255,60,0,0); }
	}
	@keyframes meteor-smoke-rise {
		0%   { transform: scale(0.2) translateY(0);      opacity: 0.9; }
		20%  { transform: scale(1.1) translateY(-18px);  opacity: 0.85; }
		55%  { transform: scale(2.4) translateY(-65px);  opacity: 0.55; }
		100% { transform: scale(4)   translateY(-140px); opacity: 0; }
	}
	/* smokewheelie = rotation only (car-4), wheelie = rotation + surge (moped) */
	/* Snappy lift onto the rear wheels, a brief hold, then the front drops under
	   gravity (accelerating) and the front wheels hit with a little bounce before
	   settling — about twice as fast as a slow eased descent. */
	@keyframes smokewheelie-ltr {
		0%   { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		12%  { transform: scaleX(-1) translateX(30%) rotate(34deg) translateX(-30%); animation-timing-function: ease-in-out; }
		56%  { transform: scaleX(-1) translateX(30%) rotate(32deg) translateX(-30%); animation-timing-function: ease-in; }
		84%  { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		90%  { transform: scaleX(-1) translateX(30%) rotate(6deg)  translateX(-30%); animation-timing-function: ease-in; }
		96%  { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		98%  { transform: scaleX(-1) translateX(30%) rotate(2deg)  translateX(-30%); animation-timing-function: ease-in; }
		100% { transform: scaleX(-1) translateX(30%) rotate(0)     translateX(-30%); }
	}
	@keyframes smokewheelie-rtl {
		0%   { transform: translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		12%  { transform: translateX(30%) rotate(34deg) translateX(-30%); animation-timing-function: ease-in-out; }
		56%  { transform: translateX(30%) rotate(32deg) translateX(-30%); animation-timing-function: ease-in; }
		84%  { transform: translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		90%  { transform: translateX(30%) rotate(6deg)  translateX(-30%); animation-timing-function: ease-in; }
		96%  { transform: translateX(30%) rotate(0)     translateX(-30%); animation-timing-function: ease-out; }
		98%  { transform: translateX(30%) rotate(2deg)  translateX(-30%); animation-timing-function: ease-in; }
		100% { transform: translateX(30%) rotate(0)     translateX(-30%); }
	}
	/* Pivot in place to face the other way; the reverse drive (reverseDrive)
	   then carries the car back out the side it came in. Held via `forwards`. */
	@keyframes uturn-ltr {
		0%   { transform: scaleX(-1); }
		16%  { transform: scaleX(0);  }
		32%  { transform: scaleX(1);  }
		100% { transform: scaleX(1);  }
	}
	/* Spin faster and shrink to nothing (scaleX keeps the facing). */
	@keyframes poof-ltr {
		0%   { transform: scaleX(-1) rotate(0) scale(1);      opacity: 1; }
		60%  { transform: scaleX(-1) rotate(320deg) scale(0.5); opacity: 0.9; }
		100% { transform: scaleX(-1) rotate(540deg) scale(0);  opacity: 0; }
	}
	@keyframes poof-rtl {
		0%   { transform: scaleX(1) rotate(0) scale(1);       opacity: 1; }
		60%  { transform: scaleX(1) rotate(-320deg) scale(0.5); opacity: 0.9; }
		100% { transform: scaleX(1) rotate(-540deg) scale(0);  opacity: 0; }
	}
	@keyframes confetti-burst {
		0%   { opacity: 0; transform: translate(0, 0) scale(0.4) rotate(0); }
		7%   { opacity: 1; }
		100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(220deg); }
	}
	@keyframes uturn-rtl {
		0%   { transform: scaleX(1);  }
		16%  { transform: scaleX(0);  }
		32%  { transform: scaleX(-1); }
		100% { transform: scaleX(-1); }
	}
</style>
