# Unify car rendering: `VehicleSprite` + controllers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the car sprite (look + easter-egg visuals) and car data into reusable units that both `Vehicles` (traffic) and `SnowCrash` (pile-up) puppeteer, so egg definitions live once and a leaving pile-up car becomes a normal car with normal eggs.

**Architecture:** A presentational `VehicleSprite` renders the car image and, for a given `effect` string, its visual (owning all shared egg CSS/keyframes/fx markup). `vehicles.ts` holds the car type list and `eggFor(src)`. `vehicleMotion.ts` holds the WAAPI drive ops. `Vehicles` and `SnowCrash` stay as separate controllers that own their (very different) motion and decide, by state, which `effect` to pass the sprite.

**Tech Stack:** SvelteKit, Svelte 5 runes, scoped CSS, Web Animations API. No test framework in the repo — verification is `npm run check` (svelte-check) + parity checks on the `/animation-test` grid via the preview tools.

## Global Constraints

- **Node 20 for tooling:** run svelte-check with `export PATH="/Users/daniel/.nvm/versions/node/v20.20.0/bin:$PATH"` (repo default node is 16, which breaks vite/svelte-check).
- **No git commits without the user's explicit go-ahead** (standing user rule). "Commit" steps below are checkpoints — run the verification, then commit ONLY when the user says so.
- **Parity is the bar:** after each task that moves egg code, every egg on `/animation-test` must look and replay exactly as before. Any visual regression = revert that step.
- **Keep the tuned motion systems untouched:** the traffic drive loop and the snow choreography (arrival/crash/pile/melt/staggered-leave/no-jump) must not change behavior.
- **Preserve the `boostDrive` animation match:** drive-coupled eggs find the car's motion animation by keyframe-name substring; that match must keep working after CSS moves.

---

## File Structure

- **Create `src/lib/vehicles.ts`** — `SIZE`, `SizeCategory`, `VehicleType`, `EffectName`, `vehicleTypes[]`, `MotionOp`, `eggFor(src)`. Pure data/logic, no DOM.
- **Create `src/lib/vehicleMotion.ts`** — `getMotionAnimation(el)`, `boost(anim, rate, ms)`, `reverse(anim, rate)`. Generic WAAPI ops on a given element/animation.
- **Create `src/lib/components/VehicleSprite.svelte`** — presentational sprite: props `{ src, size, direction, effect, fire }`; renders the car `<img>` + effect fx children; owns all shared egg CSS classes + keyframes.
- **Modify `src/lib/components/Vehicles.svelte`** — becomes the traffic controller: imports the above, removes moved code, keeps spawn/drive/rush/snow-freeze/grid, and click→effect via `eggFor`.
- **Modify `src/lib/components/SnowCrash.svelte`** — pile controller: renders pile cars via `VehicleSprite` (keeps choreography + snow-only overlays), and on click decides the effect by state (incl. leaving → egg).

---

## Task 1: Extract car data + `eggFor` into `vehicles.ts`

**Files:**
- Create: `src/lib/vehicles.ts`
- Modify: `src/lib/components/Vehicles.svelte` (remove local `SIZE`/`SizeCategory`/`VehicleType`/`EffectName`/`vehicleTypes`; import from `vehicles.ts`; rewrite `handleClick`'s per-src chain to use `eggFor`)

**Interfaces:**
- Produces:
  - `SIZE: Record<'car'|'large'|'small'|'bus', number>` = `{ car: 45, large: 65, small: 24, bus: 60 }`
  - `type SizeCategory = keyof typeof SIZE`
  - `interface VehicleType { src: string; size: SizeCategory; minDuration: number; maxDuration: number; weight: number; direction?: 'ltr'|'rtl'|'both' }`
  - `type EffectName` (union of all effect strings, unchanged from current Vehicles)
  - `const vehicleTypes: VehicleType[]` (moved verbatim from Vehicles)
  - `type MotionOp = { kind: 'boost'; rate: number; ms: number; delayMs?: number } | { kind: 'reverse'; rate: number; delayMs?: number } | { kind: 'firestop' } | null`
  - `interface Egg { effect: EffectName; durationMs: number; motion: MotionOp; convoy?: boolean; vanish?: boolean }`
  - `function eggFor(src: string): Egg | null` — returns `null` for unmapped srcs (the default convoy-trigger case stays in the controller).

- [ ] **Step 1: Create `src/lib/vehicles.ts` with data + `eggFor`**

```ts
export const SIZE = { car: 45, large: 65, small: 24, bus: 60 } as const;
export type SizeCategory = keyof typeof SIZE;

export type EffectName =
	| 'slingre' | 'flyout' | 'drift' | 'smokewheelie' | 'firestop' | 'splash'
	| 'press' | 'turbo' | 'wheelie' | 'meteorpanic' | 'nitro' | 'stretch'
	| 'uturn' | 'poof' | 'busjump' | 'disco';

export interface VehicleType {
	src: string;
	size: SizeCategory;
	minDuration: number;
	maxDuration: number;
	weight: number;
	direction?: 'ltr' | 'rtl' | 'both';
}

// MOVE the existing `vehicleTypes` array from Vehicles.svelte here verbatim.
export const vehicleTypes: VehicleType[] = [ /* … moved verbatim … */ ];

export type MotionOp =
	| { kind: 'boost'; rate: number; ms: number; delayMs?: number }
	| { kind: 'reverse'; rate: number; delayMs?: number }
	| { kind: 'firestop' }
	| null;

export interface Egg {
	effect: EffectName;
	durationMs: number;
	motion: MotionOp;
	convoy?: boolean; // nyhedsnat cars also start the RGB convoy
	vanish?: boolean; // car-2 removes itself after the poof
}

// Mapping copied 1:1 from the current handleClick chain.
export function eggFor(src: string): Egg | null {
	if (src.includes('nyhedsnat-car')) return { effect: 'disco', durationMs: 8000, motion: null, convoy: true };
	if (src.includes('car-1.svg')) return { effect: 'slingre', durationMs: 3600, motion: null };
	if (src.includes('car-2.svg')) return { effect: 'poof', durationMs: 1300, motion: null, vanish: true };
	if (src.includes('car-3.svg')) return { effect: 'flyout', durationMs: 60000, motion: null };
	if (src.includes('car-4.svg')) return { effect: 'smokewheelie', durationMs: 3000, motion: { kind: 'boost', rate: 2.2, ms: 1800 } };
	if (src.includes('car-5.svg')) return { effect: 'firestop', durationMs: 8500, motion: { kind: 'firestop' } };
	if (src.includes('4x4.svg')) return { effect: 'splash', durationMs: 1600, motion: null };
	if (src.includes('random-short-car.svg')) return { effect: 'press', durationMs: 2000, motion: null };
	if (src.includes('truck.svg')) return { effect: 'turbo', durationMs: 2600, motion: { kind: 'boost', rate: 3.4, ms: 2400 } };
	if (src.includes('moped.svg')) return { effect: 'wheelie', durationMs: 2500, motion: { kind: 'boost', rate: 2.2, ms: 1800 } };
	if (src.includes('e-scooter.svg')) return { effect: 'uturn', durationMs: 60000, motion: { kind: 'reverse', rate: 1.5, delayMs: 220 } };
	if (src.includes('dino-car.svg')) return { effect: 'meteorpanic', durationMs: 3500, motion: { kind: 'boost', rate: 3.5, ms: 1800, delayMs: 1300 } };
	if (src.includes('racer.svg')) return { effect: 'nitro', durationMs: 2500, motion: { kind: 'boost', rate: 4.2, ms: 1500 } };
	if (src.includes('limo.svg')) return { effect: 'stretch', durationMs: 2000, motion: null };
	if (src.includes('bus.svg')) return { effect: 'busjump', durationMs: 1400, motion: null };
	return null;
}
```

Note: car-4 `smokewheelie` currently has no boost in `handleClick`; keep parity — **remove the `motion` on car-4** (set `motion: null`). Double-check against the current `handleClick` before finalizing each row; the mapping above must match it exactly (car-4 = smokewheelie, no boost).

- [ ] **Step 2: Rewrite `Vehicles.svelte` to consume `vehicles.ts`**

- Delete the local `SIZE`, `SizeCategory`, `EffectName`, `VehicleType`, `vehicleTypes` definitions.
- Add `import { SIZE, vehicleTypes, eggFor, type SizeCategory, type EffectName, type VehicleType } from '$lib/vehicles';`
- Replace the per-src `if` chain in `handleClick` (keep the `trafficStopped` guard and the nyhedsnat/default handling) with:

```ts
const src = vehicleTypes[vehicle.typeIndex].src;
const egg = eggFor(src);
if (!egg) { triggerConvoy.set(vehicle.direction); return; } // default: nyhedsnat handled below via egg.convoy? no—nyhedsnat returns an egg
if (egg.convoy) triggerConvoy.set(vehicle.direction);
setEffect(vehicle.id, egg.effect, egg.durationMs);
if (egg.vanish && !grid) setTimeout(() => removeVehicle(vehicle.id), 1250);
applyEggMotion(vehicle.id, egg.motion); // added in Task 2 (temp: inline the boost/reverse/firestop switch here for now)
```

For this task, keep `applyEggMotion` as a local switch that calls the existing `boostDrive`/`reverseDrive`/`fireStopSequence` (unchanged), honoring `delayMs`:

```ts
function applyEggMotion(id: number, m: MotionOp) {
	if (!m) return;
	if (m.kind === 'firestop') return fireStopSequence(id);
	const run = () => m.kind === 'boost' ? boostDrive(id, m.rate, m.ms) : reverseDrive(id, m.rate);
	m.delayMs ? setTimeout(run, m.delayMs) : run();
}
```

- [ ] **Step 3: svelte-check**

Run: `export PATH="/Users/daniel/.nvm/versions/node/v20.20.0/bin:$PATH" && npm run check`
Expected: `0 errors` (the 2 pre-existing `redaktion/+layout.svelte` slot warnings remain).

- [ ] **Step 4: Parity check on the grid**

Start preview (`preview_start` "dev"), open `/animation-test`, and for each car card click it and confirm the effect replays (spot-check car-1 slingre, car-5 firestop, truck turbo, e-scooter uturn). Data-only refactor → behavior identical.

- [ ] **Step 5: Checkpoint (commit on user OK)**

```bash
git add src/lib/vehicles.ts src/lib/components/Vehicles.svelte
git commit -m "refactor: extract vehicle data + eggFor into vehicles.ts"
```

---

## Task 2: Extract WAAPI drive ops into `vehicleMotion.ts`

**Files:**
- Create: `src/lib/vehicleMotion.ts`
- Modify: `src/lib/components/Vehicles.svelte` (`getDriveAnimation`, `boostDrive`, `reverseDrive` delegate to the shared ops)

**Interfaces:**
- Consumes: nothing (pure DOM/WAAPI).
- Produces:
  - `getMotionAnimation(el: HTMLElement): Animation | undefined` — finds the running CSS animation that moves the element. Match by `animationName` containing `"drive"` **or** `"snowcar-leave"` **or** `"snowcar-ltr"`/`"snowcar-rtl"` (covers traffic drive and snow arrival/leave).
  - `boost(anim: Animation, rate: number, ms: number): void` — set `playbackRate = rate`, restore to 1 after `ms`.
  - `reverse(anim: Animation, rate?: number): void` — set `playbackRate = -Math.abs(rate ?? 1.5)`.

- [ ] **Step 1: Create `src/lib/vehicleMotion.ts`**

```ts
export function getMotionAnimation(el: HTMLElement): Animation | undefined {
	return el.getAnimations().find((a) => {
		const n = (a as CSSAnimation).animationName ?? '';
		return n.includes('drive') || n.includes('snowcar');
	});
}

export function boost(anim: Animation, rate: number, ms: number): void {
	anim.playbackRate = rate;
	setTimeout(() => { try { anim.playbackRate = 1; } catch { /* gone */ } }, ms);
}

export function reverse(anim: Animation, rate = 1.5): void {
	anim.playbackRate = -Math.abs(rate);
}
```

Note: the current `reverseDrive` in Vehicles does a fresh forward WAAPI animation (the u-turn smoothness fix), not a `playbackRate` flip. Keep that behavior in Vehicles' `reverseDrive` wrapper — `vehicleMotion.reverse` is the simple primitive used where a plain reverse is enough. Do NOT regress the e-scooter u-turn; leave Vehicles' `reverseDrive` implementation as-is and have it call `getMotionAnimation` for the element lookup only.

- [ ] **Step 2: Point Vehicles' lookups at `getMotionAnimation`**

- `import { getMotionAnimation } from '$lib/vehicleMotion';`
- Replace the body of Vehicles' `getDriveAnimation(id)` with `return getMotionAnimation(containerEls[id]);` (keep the `id`-based wrapper so the rest of Vehicles is unchanged).

- [ ] **Step 3: svelte-check** — `0 errors`.

- [ ] **Step 4: Parity check** — on `/animation-test`, confirm truck turbo, racer nitro, moped wheelie, e-scooter u-turn, car-5 firestop all still work.

- [ ] **Step 5: Checkpoint (commit on user OK)**

```bash
git add src/lib/vehicleMotion.ts src/lib/components/Vehicles.svelte
git commit -m "refactor: shared vehicleMotion WAAPI ops"
```

---

## Task 3: Create `VehicleSprite.svelte` and render it from `Vehicles`

**Files:**
- Create: `src/lib/components/VehicleSprite.svelte`
- Modify: `src/lib/components/Vehicles.svelte` (`vehicleCard` snippet renders `<VehicleSprite>`; move shared egg CSS + fx markup + keyframes out)

**Interfaces:**
- Consumes: `SIZE`, `SizeCategory`, `EffectName` from `vehicles.ts`.
- Produces: `VehicleSprite` with props
  `{ src: string; size: SizeCategory; direction?: 'ltr' | 'rtl'; effect?: EffectName | null; fire?: boolean }`.
  Renders a root element carrying the `direction` class, the car `<img class="car {effect}">`, the per-effect fx children (smoke, flame, breaking, disco glows, water-splash, poof-fx, meteor, engine-fire when `fire`), sized via `SIZE[size]`.

- [ ] **Step 1: Create `VehicleSprite.svelte` (skeleton + moved visuals)**

```svelte
<script lang="ts">
	import { SIZE, type SizeCategory, type EffectName } from '$lib/vehicles';
	let { src, size, direction, effect = null, fire = false }:
		{ src: string; size: SizeCategory; direction?: 'ltr' | 'rtl'; effect?: EffectName | null; fire?: boolean } = $props();
	const height = $derived(SIZE[size]);
</script>

<div class="sprite {direction ?? ''}">
	<!-- MOVE the fx children from Vehicles' vehicleCard here, gated by `effect` (and `fire`):
	     smoke/land-dust/bus-dust/turbo-flame/exhaust-fire/breaking/disco-glow/water-splash/
	     poof-fx/meteor group/engine-fire(when fire). Use `effect === '<name>'` guards. -->
	<img {src} alt="" aria-hidden="true" draggable="false" class="car {effect ?? ''}" style="height: {height}px;" />
</div>

<style>
	/* MOVE from Vehicles.svelte verbatim, renaming the container/element selectors:
	   `.vehicle-container.ltr .vehicle` → `.sprite.ltr .car`, `.vehicle` → `.car`, etc.
	   Move ALL of: base .car rules, the `.car.<effect>` animation rules (slingre/flyout/
	   drift/firestop/splash/press/wheelie/smokewheelie/meteorpanic/nitro/stretch/uturn/
	   poof/busjump), every fx element rule (.smoke, .land-dust, .bus-dust, .flame,
	   .turbo-flame, .exhaust-fire, .breaking, .disco-glow, .water-splash, .poof-fx,
	   .meteor*, .engine-fire, .fire-tongue…), and ALL their @keyframes.
	   Keyframe names are unchanged (they move with their rules), so the boost match holds. */
</style>
```

- [ ] **Step 2: Render the sprite from Vehicles' `vehicleCard`**

Replace the `<img class="vehicle …">` + all fx child `{#if effect === …}` blocks inside the `vehicleCard` snippet with:

```svelte
<VehicleSprite src={vehicleType.src} size={vehicleType.size} direction={vehicle.direction}
	effect={effects[vehicle.id]} fire={!!fireActive[vehicle.id]} />
```

Keep on the `.vehicle-container`: the drive animation, `bind:this={containerEls[vehicle.id]}`, `class:paused`, the click `<button>`/handler, `--duration`, and the angry-pop (Vehicles-local). The container still owns motion + click; the sprite owns appearance.

Add `import VehicleSprite from '$lib/components/VehicleSprite.svelte';`. Delete the moved CSS/keyframes/fx markup from Vehicles.

- [ ] **Step 3: svelte-check** — `0 errors`.

- [ ] **Step 4: Full parity sweep (the critical gate)**

On `/animation-test`, replay EVERY card and confirm each effect is visually identical to before (positions, timing, fx). Use `preview_eval` to seek each effect animation if needed. Any difference → fix before continuing. Confirm car-5 firestop shows flames (via `fire` prop) and 4x4 splash stays centered between the wheels.

- [ ] **Step 5: Checkpoint (commit on user OK)**

```bash
git add src/lib/components/VehicleSprite.svelte src/lib/components/Vehicles.svelte
git commit -m "refactor: move car sprite + egg visuals into VehicleSprite"
```

---

## Task 4: Render `SnowCrash` pile cars via `VehicleSprite`

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: `VehicleSprite`; `SIZE` (cars are `'car'` size = 45, matching current `.snow-car` height).
- Produces: pile cars rendered by the shared sprite; snow-only overlays unchanged.

- [ ] **Step 1: Insert a fidget layer + sprite**

In the `{#each cars}` block, keep `.snow-car-wrap` (position/arrival/leave animations) and the snow-only siblings (`.anger-mark`, `.jam-dust`, `.crash-fx`, the click `<button>`, `.bump-fx`). Replace the `<img class="snow-car">` with a fidget wrapper that carries the jam-angry / bump animations, wrapping the sprite:

```svelte
<div class="snow-fidget">
	<VehicleSprite src={car.src} size="car" direction={direction} effect={snowEffect[car.id] ?? null} />
</div>
```

Move the `jam-angry` and `snow-bump-hard`/`snow-bump-soft` animations from `.snow-car` onto `.snow-fidget` (so SnowCrash still owns them; they compose with the wrap position and the sprite's egg transform on separate elements). Update the `.snow-car-wrap.leaving .snow-car { animation: none }` and bump selectors to target `.snow-fidget`.

Add `import VehicleSprite from '$lib/components/VehicleSprite.svelte';` and `let snowEffect = $state<Record<number, string | null>>({});` (used in Task 5; default null → plain car).

- [ ] **Step 2: svelte-check** — `0 errors`.

- [ ] **Step 3: Parity check** — trigger a storm (temporarily set the first-cloud delay low, then restore): confirm cars arrive/crash/pile/melt/leave exactly as before, angry fidget + click-bump + 💢 + smoke still work, cars are 45px.

- [ ] **Step 4: Checkpoint (commit on user OK)**

```bash
git add src/lib/components/SnowCrash.svelte
git commit -m "refactor: SnowCrash pile cars render VehicleSprite"
```

---

## Task 5: Leaving pile cars fire real eggs

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: `eggFor` (`vehicles.ts`), `getMotionAnimation` + `boost`/`reverse` (`vehicleMotion.ts`).

- [ ] **Step 1: Route clicks by state**

In the pile car's click handler (currently `bumpCar(i)`), branch on state:

```ts
function clickCar(i: number, el: HTMLElement) {
	if (leaving) return fireLeaveEgg(i, el); // driving off → normal easter egg
	if (eventActive) return bumpCar(i);       // stuck / arriving → angry bump
}
function fireLeaveEgg(i: number, el: HTMLElement) {
	const egg = eggFor(cars[i].src);
	if (!egg) return;
	snowEffect = { ...snowEffect, [cars[i].id]: egg.effect };
	setTimeout(() => { const n = { ...snowEffect }; delete n[cars[i].id]; snowEffect = n; }, egg.durationMs);
	const anim = getMotionAnimation(el); // the car's snowcar-leave animation
	if (anim && egg.motion) {
		if (egg.motion.kind === 'boost') boost(anim, egg.motion.rate, egg.motion.ms);
		else if (egg.motion.kind === 'reverse') reverse(anim, egg.motion.rate);
		// firestop: ponytail — leaving car shows the firestop VISUAL (fire prop) but keeps
		// rolling off; the stop→restart sequence is traffic-only, not worth porting here.
	}
}
```

Pass the fidget element into the click handler (`onclick={(e) => clickCar(i, e.currentTarget.closest('.snow-car-wrap'))}` or bind a ref per car). Wire the button `onclick` to `clickCar`.

- [ ] **Step 2: firestop visual for leaving car-5 (optional parity)**

If car-5 is clicked while leaving, also flip a `fire` flag briefly so the sprite shows flames:

```ts
// inside fireLeaveEgg, when egg.effect === 'firestop':
snowFire = { ...snowFire, [cars[i].id]: true };
setTimeout(() => { const n = { ...snowFire }; delete n[cars[i].id]; snowFire = n; }, 3500);
```

Add `let snowFire = $state<Record<number, boolean>>({});` and pass `fire={!!snowFire[car.id]}` to the sprite.

- [ ] **Step 3: svelte-check** — `0 errors`.

- [ ] **Step 4: Behavior check**

Trigger a storm, wait for the drive-off, and click a leaving car: confirm it fires its real egg (e.g. a leaving car-1 slingres, car-3 flies out, 4x4 splashes) and a stuck car still just bumps/honks. Confirm arriving/crashing clicks do nothing.

- [ ] **Step 5: Checkpoint (commit on user OK)**

```bash
git add src/lib/components/SnowCrash.svelte
git commit -m "feat: leaving snow pile-up cars fire normal easter eggs"
```

---

## Self-Review

- **Spec coverage:** `vehicles.ts` (Task 1) + `VehicleSprite` (Task 3) + `vehicleMotion` (Task 2) = the boundaries; controllers keep motion (Tasks 3–4); leaving eggs (Task 5) = the original goal; effect-split honored (shared eggs in sprite; snow overlays stay in SnowCrash — Task 4). All covered.
- **Placeholders:** the CSS "MOVE …" instructions describe relocating existing, already-verified code (not new logic) — enumerated by exact selector/keyframe names, not "etc. figure it out". New logic (eggFor, motion ops, sprite props, click routing) is shown in full.
- **Type consistency:** `EffectName`, `MotionOp`, `Egg`, `eggFor`, `getMotionAnimation`/`boost`/`reverse`, and the `VehicleSprite` prop shape are used identically across tasks.
- **Risk:** Task 3 is the heavy one; its Step 4 full-grid parity sweep is the gate. The user's pre-refactor commit is the rollback point.
