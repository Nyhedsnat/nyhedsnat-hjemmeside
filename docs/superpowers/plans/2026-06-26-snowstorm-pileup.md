# Snowstorm Pile-up Easter Egg — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-contained "snow cloud → snowstorm → 20-car pile-up" click easter egg that touches no existing component except one layout insertion.

**Architecture:** One new Svelte 5 component `SnowCrash.svelte` mounted once in `+layout.svelte` inside `.houses-container`. It renders an intermittently-drifting clickable snow cloud; clicking it runs a timed event: snowfall ramps up, a snow mound grows on the road, ~20 car sprites flood in from one side and skid into a bumper-to-bumper pile-up with spark/honk marks, then everything melts/clears and resets.

**Tech Stack:** SvelteKit + Svelte 5 runes (`$state`, `$props`), scoped CSS keyframes, existing vehicle SVGs in `static/svg/eastereggs/vehicles/`.

## Global Constraints

- **Isolation:** Do NOT edit `Vehicles.svelte`, `Convoy.svelte`, `Ufo.svelte`, `MoonLaser.svelte`, `Bus.svelte`, `Streamers.svelte`, `Drone.svelte`, any store, or any existing effect. The ONLY change outside `SnowCrash.svelte` is adding its import + one `<SnowCrash />` element to `src/routes/+layout.svelte`.
- **No commits during execution.** The user authorizes commits explicitly. You may `git add` to stage if helpful, but never `git commit`. Each task ends with `npm run check` instead of a commit.
- **Svelte 5 runes** only (`$state`, `$props`, `onMount`). Match existing component style (see `Bus.svelte` for the intermittent-spawn pattern).
- **Verification gate per task:** `npm run check` must report `0 errors` (2 pre-existing warnings in `src/routes/redaktion/+layout.svelte` are expected). Plus the DOM/geometry check noted in the task.
- **Preview caveat:** the preview/automation browser tab runs backgrounded, so CSS animations freeze and `setTimeout` throttles. Verify state/geometry via `preview_eval` (class presence, element counts, bounding rects, seeking `getAnimations().currentTime`), not by watching motion. `.env` may have `PUBLIC_DEBUG_TRAFFIC=true` — leave it.
- **Reduced motion:** match existing components (they do not special-case it). No extra handling.

## File Structure

- **Create** `src/lib/components/SnowCrash.svelte` — the entire easter egg: cloud (trigger), snowfall, mound, car fleet, spark/honk marks, lifecycle. One responsibility: the snowstorm pile-up egg.
- **Modify** `src/routes/+layout.svelte` — import + mount `<SnowCrash />` inside `.houses-container`.

Car geometry reference (reused, do not edit): SVGs live at `/svg/eastereggs/vehicles/` (e.g. `car-1.svg` … `car-5.svg`, `4x4.svg`, `random-short-car.svg`). Rendered at ~45px height in existing traffic. Each SVG faces left by default; `scaleX(-1)` makes it face right (the existing `ltr` convention).

---

### Task 1: Scaffold component + intermittent clickable cloud

**Files:**
- Create: `src/lib/components/SnowCrash.svelte`
- Modify: `src/routes/+layout.svelte`

**Interfaces:**
- Produces: `<SnowCrash />` (no props). Internal state `cloudVisible: boolean`, `eventActive: boolean`, function `startEvent(): void`.

- [ ] **Step 1: Create the component with a drifting, clickable cloud**

`src/lib/components/SnowCrash.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	let cloudVisible = $state(false);
	let cloudActive = $state(false); // darkened while storming
	let eventActive = $state(false);
	let direction = $state<'ltr' | 'rtl'>('ltr');
	let driftDuration = $state(40);

	function startEvent() {
		if (eventActive || !cloudVisible) return;
		eventActive = true;
		cloudActive = true;
		// phases wired up in later tasks
		setTimeout(() => endEvent(), 14000);
	}

	function endEvent() {
		cloudActive = false;
		eventActive = false;
	}

	onMount(() => {
		const showCloud = () => {
			direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
			driftDuration = Math.random() * 20 + 35; // 35-55s drift
			cloudVisible = true;
			setTimeout(() => {
				cloudVisible = false;
				cloudActive = false;
				eventActive = false;
			}, driftDuration * 1000 + 200);
		};
		const initial = Math.random() * 30000 + 20000; // first appearance 20-50s
		const t = setTimeout(function loop() {
			showCloud();
			setTimeout(loop, Math.random() * 90000 + 60000); // then every 60-150s
		}, initial);
		return () => clearTimeout(t);
	});
</script>

{#if cloudVisible}
	<button
		type="button"
		class="snow-cloud {direction}"
		class:active={cloudActive}
		style="--drift: {driftDuration}s;"
		onclick={startEvent}
		aria-label="Snesky"
	>
		<span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
	</button>
{/if}

<style>
	.snow-cloud {
		position: absolute;
		top: 14%;
		left: 0;
		width: 92px;
		height: 38px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
		z-index: 3;
		opacity: 0.78;
		transition: opacity 0.3s ease;
	}
	.snow-cloud.ltr { animation: cloud-drift-ltr var(--drift, 40s) linear forwards; }
	.snow-cloud.rtl { right: 0; left: auto; animation: cloud-drift-rtl var(--drift, 40s) linear forwards; }
	.snow-cloud.active { opacity: 1; }
	.snow-cloud .puff {
		position: absolute;
		bottom: 0;
		border-radius: 50%;
		background: radial-gradient(circle at 40% 35%, #e7edf5, #9fb0c4 75%, rgba(159,176,196,0) 100%);
		filter: blur(0.5px);
	}
	.snow-cloud.active .puff {
		background: radial-gradient(circle at 40% 35%, #aeb9c8, #5f6b7d 75%, rgba(95,107,125,0) 100%);
	}
	.puff.p1 { left: 4px;  width: 38px; height: 30px; }
	.puff.p2 { left: 26px; width: 50px; height: 38px; }
	.puff.p3 { left: 56px; width: 34px; height: 28px; }

	@keyframes cloud-drift-ltr { 0% { transform: translateX(-120px); } 100% { transform: translateX(calc(100vw + 120px)); } }
	@keyframes cloud-drift-rtl { 0% { transform: translateX(120px); } 100% { transform: translateX(calc(-100vw - 120px)); } }
</style>
```

- [ ] **Step 2: Mount it in the layout**

In `src/routes/+layout.svelte`: add the import next to the other component imports, and add `<SnowCrash />` inside `.houses-container` (next to `<Vehicles />`/`<Bus />`/`<Convoy />`).

```svelte
import SnowCrash from '$lib/components/SnowCrash.svelte';
```
```svelte
<!-- inside .houses-container, near <Vehicles /> -->
<SnowCrash />
```

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: `0 errors` (2 pre-existing warnings allowed).

- [ ] **Step 4: DOM verify the cloud + click guard**

Start preview, then via `preview_eval` force a cloud for testing:
```js
// component is private; verify by forcing visible state through the rendered DOM after it naturally appears,
// OR temporarily set onMount initial delay to ~500ms while testing, then restore.
// Check: a `.snow-cloud` button exists, has pointer-events auto, and clicking sets eventActive (cloudActive class).
(() => { const c=document.querySelector('.snow-cloud'); if(!c) return {cloud:false}; const pe=getComputedStyle(c).pointerEvents; c.click(); return { cloud:true, pe, active: c.classList.contains('active') }; })()
```
Expected: `{ cloud:true, pe:"auto", active:true }`. (If testing requires a quick appearance, temporarily lower the `initial` delay in `onMount` to ~500ms, verify, then restore it.)

---

### Task 2: Snowfall + storm-build phase

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: `eventActive`, `startEvent()`.
- Produces: `snowing: boolean` state; a `.snowfall` layer rendered while snowing.

- [ ] **Step 1: Add `snowing` state and toggle it in the event**

In `<script>`: add `let snowing = $state(false);`. In `startEvent()` set `snowing = true;` (after `eventActive = true`). In `endEvent()` set `snowing = false;` first.

- [ ] **Step 2: Render the snowfall layer**

Add to the template (after the cloud `{#if}` block, gated by `snowing`):

```svelte
{#if snowing}
	<div class="snowfall" aria-hidden="true">
		{#each Array(60) as _, i}
			<span class="flake" style="--x: {(i * 53) % 100}vw; --d: {(i % 7) * 0.4 + 2.2}s; --delay: {-(i % 11) * 0.5}s; --drift: {((i % 5) - 2) * 14}px; --sz: {(i % 3) + 2}px;"></span>
		{/each}
	</div>
{/if}
```

CSS:
```css
.snowfall {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 2;
	overflow: hidden;
	animation: snow-fade-in 1.8s ease forwards;
}
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
@keyframes snow-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes flake-fall {
	0%   { transform: translate(0, 0); opacity: 0; }
	10%  { opacity: 0.9; }
	100% { transform: translate(var(--drift), 420px); opacity: 0.15; }
}
```

- [ ] **Step 3: Type-check** — `npm run check` → `0 errors`.

- [ ] **Step 4: DOM verify** — after triggering the event (click the cloud), `document.querySelectorAll('.snowfall .flake').length` is 60 and `document.querySelector('.snowfall')` exists; clicking again while active does NOT start a second event (`startEvent` guard — flake count stays 60).

---

### Task 3: Growing snow mound on the road

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: `snowing`, `direction`.
- Produces: a `.snow-mound` element at the blockage point, sized via CSS growth animation. The blockage x is a constant `BLOCK_VW` (see Task 4) — for now place the mound at `left: 52vw`.

- [ ] **Step 1: Render the mound (while event active)**

Gate on `eventActive`. Add to template:
```svelte
{#if eventActive}
	<div class="snow-mound" aria-hidden="true"></div>
{/if}
```
CSS:
```css
.snow-mound {
	position: absolute;
	bottom: 2px;
	left: 52vw;
	transform: translateX(-50%) scale(0);
	transform-origin: bottom center;
	width: 120px;
	height: 30px;
	border-radius: 50% 50% 40% 40% / 70% 70% 30% 30%;
	background: radial-gradient(ellipse at 50% 30%, #ffffff, #d7e2ef 70%, #b9c8da 100%);
	filter: blur(0.6px);
	z-index: 4;
	animation: mound-grow 7s ease-out forwards;
}
@keyframes mound-grow {
	0%   { transform: translateX(-50%) scale(0); opacity: 0; }
	12%  { opacity: 1; }
	100% { transform: translateX(-50%) scale(1); opacity: 1; }
}
```

- [ ] **Step 2: Type-check** — `npm run check` → `0 errors`.

- [ ] **Step 3: DOM verify** — during the event, `.snow-mound` exists; seek its animation (`el.getAnimations()[0].currentTime = 7000`) and confirm computed `transform` scale ≈ 1 (e.g. `new DOMMatrixReadOnly(getComputedStyle(el).transform).a` ≈ 1).

---

### Task 4: Car fleet floods in and piles up

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: `eventActive`, `direction`.
- Produces: `cars: Car[]` where `type Car = { id:number; src:string; stopVw:number; rot:number; delayMs:number }`; constant `BLOCK_VW = 52`. Cars render as absolutely-positioned `<img class="snow-car">` driving in from `direction`'s entry side and stopping at `stopVw`, chained backward from the mound (bumper-to-bumper).

- [ ] **Step 1: Add the fleet model + spawn logic**

In `<script>`:
```ts
type Car = { id: number; src: string; stopVw: number; rot: number; delayMs: number };
const CAR_SRCS = [
	'/svg/eastereggs/vehicles/car-1.svg',
	'/svg/eastereggs/vehicles/car-2.svg',
	'/svg/eastereggs/vehicles/car-3.svg',
	'/svg/eastereggs/vehicles/car-4.svg',
	'/svg/eastereggs/vehicles/car-5.svg',
	'/svg/eastereggs/vehicles/4x4.svg',
	'/svg/eastereggs/vehicles/random-short-car.svg'
];
const BLOCK_VW = 52;
const FLEET = 20;
let cars = $state<Car[]>([]);
let carId = 0;
```
In `startEvent()` (after setting `snowing = true`), build the fleet. For `ltr` (enters from left, faces right, piles to the LEFT of the mound) the chain stops decrease; for `rtl` they increase:
```ts
const sign = direction === 'ltr' ? -1 : 1; // chain grows away from travel
cars = Array.from({ length: FLEET }, (_, i) => ({
	id: carId++,
	src: CAR_SRCS[Math.floor(Math.random() * CAR_SRCS.length)],
	stopVw: BLOCK_VW + sign * (i * 3.6),
	rot: Math.random() * 8 - 4,
	delayMs: 1400 + i * 230
}));
```
In `endEvent()`: after `snowing = false`, schedule `setTimeout(() => { cars = []; }, 1500);`.

- [ ] **Step 2: Render the cars**

```svelte
{#each cars as car (car.id)}
	<img
		src={car.src}
		alt=""
		aria-hidden="true"
		draggable="false"
		class="snow-car {direction}"
		style="--stop: {car.stopVw}vw; --rot: {car.rot}deg; --delay: {car.delayMs}ms;"
	/>
{/each}
```

CSS (drive in from off-screen to `--stop`, decelerate, small skid `--rot`, hold via `forwards`):
```css
.snow-car {
	position: absolute;
	bottom: 8px;
	left: 0;
	height: 45px;
	width: auto;
	z-index: 5;
	transform-origin: 50% 100%;
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
	user-select: none;
	-webkit-user-drag: none;
}
.snow-car.ltr { animation: snowcar-ltr 1.6s cubic-bezier(0.15, 0.7, 0.2, 1) var(--delay) backwards; }
.snow-car.rtl { animation: snowcar-rtl 1.6s cubic-bezier(0.15, 0.7, 0.2, 1) var(--delay) backwards; }
@keyframes snowcar-ltr {
	0%   { transform: translateX(-260px) scaleX(-1) rotate(0); }
	82%  { transform: translateX(calc(var(--stop) + 2px)) scaleX(-1) rotate(calc(var(--rot) * -1)); }
	90%  { transform: translateX(calc(var(--stop) - 6px)) scaleX(-1) rotate(var(--rot)); }
	100% { transform: translateX(var(--stop)) scaleX(-1) rotate(var(--rot)); }
}
@keyframes snowcar-rtl {
	0%   { transform: translateX(calc(100vw + 260px)) scaleX(1) rotate(0); }
	82%  { transform: translateX(calc(var(--stop) - 2px)) scaleX(1) rotate(calc(var(--rot) * -1)); }
	90%  { transform: translateX(calc(var(--stop) + 6px)) scaleX(1) rotate(var(--rot)); }
	100% { transform: translateX(var(--stop)) scaleX(1) rotate(var(--rot)); }
}
```
Note: `--stop` is a `vw` value used inside `translateX` — valid. The keyframe holds the final skid via `forwards`? It uses default fill; add `forwards` if the end state must persist: change both animations to end with `... var(--delay) both;`. Use `both` so the pre-delay state (off-screen) and post-end state (stopped) both hold.

Fix: set animation fill to `both` (replaces `backwards`):
```css
.snow-car.ltr { animation: snowcar-ltr 1.6s cubic-bezier(0.15,0.7,0.2,1) var(--delay) both; }
.snow-car.rtl { animation: snowcar-rtl 1.6s cubic-bezier(0.15,0.7,0.2,1) var(--delay) both; }
```

- [ ] **Step 3: Type-check** — `npm run check` → `0 errors`.

- [ ] **Step 4: DOM verify the pile** — during the event, `document.querySelectorAll('.snow-car').length === 20`. Seek each car's animation to its end (`a.currentTime = a.effect.getTiming().delay + 1600`) and confirm the cars' `getBoundingClientRect().left` values form a monotonic chain offset from the mound (bumper-to-bumper, no two identical), all on the same side of `BLOCK_VW`.

---

### Task 5: Crash sparks + "!" honk marks

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: `cars`, per-car `delayMs`.
- Produces: per-car `.crash-fx` overlay (spark burst + "!" bubble) that fires when the car reaches the pile (`animation-delay ≈ delayMs + ~1350ms`).

- [ ] **Step 1: Wrap each car so the FX can be positioned at its stop point**

Change the car render to a wrapper that carries the same drive-in animation, with the `<img>` and a `.crash-fx` inside, so the FX travels to the stop point with the car:

```svelte
{#each cars as car (car.id)}
	<div
		class="snow-car-wrap {direction}"
		style="--stop: {car.stopVw}vw; --rot: {car.rot}deg; --delay: {car.delayMs}ms;"
	>
		<img src={car.src} alt="" aria-hidden="true" draggable="false" class="snow-car {direction}" />
		<div class="crash-fx" aria-hidden="true">
			<span class="spark s1"></span><span class="spark s2"></span><span class="spark s3"></span><span class="spark s4"></span>
			<span class="honk">!</span>
		</div>
	</div>
{/each}
```
Move the drive-in animation onto `.snow-car-wrap` (so `.snow-car` keeps only `scaleX(-1)` facing via the keyframes — simplest is to keep the keyframes on the wrap and let the img sit at 0). Update CSS: rename `.snow-car.ltr/.rtl` animation rules to `.snow-car-wrap.ltr/.rtl`; the `<img class="snow-car">` keeps height/shadow but no transform of its own (the wrap moves it). Keep `scaleX(-1)` for ltr facing on the wrap keyframes (already there).

- [ ] **Step 2: Add the FX CSS**

```css
.snow-car-wrap { position: absolute; bottom: 8px; left: 0; z-index: 5; transform-origin: 50% 100%; }
.crash-fx { position: absolute; top: 2px; left: 50%; width: 0; height: 0; pointer-events: none; }
.crash-fx .spark, .crash-fx .honk { opacity: 0; }
.crash-fx .spark {
	position: absolute; width: 5px; height: 5px; border-radius: 1px;
	background: #fff3b0; box-shadow: 0 0 4px #ffd24a;
	animation: spark-pop 0.45s ease-out var(--fx-delay) forwards;
}
.crash-fx .s1 { --dx: -18px; --dy: -14px; }
.crash-fx .s2 { --dx: 16px;  --dy: -16px; }
.crash-fx .s3 { --dx: -8px;  --dy: -22px; }
.crash-fx .s4 { --dx: 12px;  --dy: -8px; }
.crash-fx .honk {
	position: absolute; left: -3px; top: -20px;
	font: 700 14px/1 system-ui, sans-serif; color: #ffd24a;
	text-shadow: 0 1px 2px rgba(0,0,0,0.6);
	animation: honk-pop 0.7s ease-out var(--fx-delay) forwards;
}
@keyframes spark-pop {
	0% { opacity: 0; transform: translate(0,0) scale(0.4); }
	20% { opacity: 1; }
	100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1); }
}
@keyframes honk-pop {
	0% { opacity: 0; transform: translateY(2px) scale(0.6); }
	25% { opacity: 1; transform: translateY(-2px) scale(1.1); }
	70% { opacity: 1; transform: translateY(-4px) scale(1); }
	100% { opacity: 0; transform: translateY(-8px) scale(0.9); }
}
```
Set `--fx-delay` per car in the inline style: add `--fx-delay: {car.delayMs + 1350}ms;` to the wrap's `style`. The crash FX uses it.

- [ ] **Step 3: Type-check** — `npm run check` → `0 errors`.

- [ ] **Step 4: DOM verify** — during the event, each `.snow-car-wrap` contains 4 `.spark` + 1 `.honk`; seek a spark's animation to mid (`currentTime = fxDelay + 200`) and confirm computed opacity > 0.

---

### Task 6: Clear / melt / reset + re-trigger, then final polish

**Files:**
- Modify: `src/lib/components/SnowCrash.svelte`

**Interfaces:**
- Consumes: all prior state.
- Produces: clean teardown — after ~14s the snow stops, mound + cars fade out, cloud returns to idle; `eventActive` resets so a later cloud click re-runs.

- [ ] **Step 1: Add a `clearing` fade + ordered teardown**

Add `let clearing = $state(false);`. Rework `endEvent()`:
```ts
function endEvent() {
	clearing = true;       // triggers fade-out on snow/mound/cars
	snowing = false;
	cloudActive = false;
	setTimeout(() => {
		cars = [];
		clearing = false;
		eventActive = false;
	}, 1600);
}
```
Add `class:clearing={clearing}` to the `.snowfall`, `.snow-mound`, and `.snow-car-wrap` elements (or a shared wrapper). CSS:
```css
.snowfall.clearing, .snow-mound.clearing, .snow-car-wrap.clearing {
	animation: snow-fade-out 1.4s ease forwards;
}
@keyframes snow-fade-out { to { opacity: 0; } }
```

- [ ] **Step 2: Guarantee re-trigger** — confirm `startEvent()` early-returns only on `eventActive || !cloudVisible`, and that `endEvent()` resets `eventActive=false`. The cloud keeps drifting; clicking again on a later appearance starts a fresh event.

- [ ] **Step 3: Type-check** — `npm run check` → `0 errors`.

- [ ] **Step 4: DOM verify reset** — trigger event, fast-forward (stub `setTimeout` is not needed; just drive `endEvent()` by lowering the 14000 timer to ~1500ms temporarily for the test, then restore). After teardown: `cars.length`→ no `.snow-car-wrap` in DOM, no `.snowfall`, `eventActive` false (cloud has no `.active`). Then click the cloud again → event starts again (flakes reappear).

- [ ] **Step 5: Visual polish pass** — with a tall viewport, trigger the event and screenshot mid-pile-up; confirm: cloud reads as a snow cloud, snow visibly falling, a white mound at the blockage, ~20 cars chained bumper-to-bumper with a couple of skid angles, sparks + "!" near fresh impacts. Tune `BLOCK_VW`, `FLEET`, spacing (`3.6`), timings, and colors as needed. Re-run `npm run check`.

---

## Self-Review

**Spec coverage:**
- Intermittent clickable cloud → Task 1. ✅
- Click → snow builds → Task 2. ✅
- Snow piles up (mound) → Task 3. ✅
- ~20 cars flood one side → rear-end pile-up → Task 4. ✅
- Crash sparks + "!" honks → Task 5. ✅
- Clear/melt/reset + re-triggerable → Task 6. ✅
- Isolation (only new file + 1 layout line) → enforced in Global Constraints + Task 1 Step 2; no other task edits existing files. ✅
- 2D-easy (CSS transforms/opacity only) → all tasks use sprites + keyframes. ✅

**Placeholder scan:** No TODO/TBD; every code step has real code. Task 5 Step 1 instructs a concrete refactor (move animation to `.snow-car-wrap`) with the exact markup. The only "tune as needed" is the explicit polish step (Task 6 Step 5), which is acceptable as a tuning pass, not a placeholder for missing logic.

**Type consistency:** `Car` type = `{ id, src, stopVw, rot, delayMs }` consistent across Tasks 4–5. `BLOCK_VW=52` matches the mound `left: 52vw` (Task 3) — keep them equal; if `BLOCK_VW` changes in Task 4 polish, update the mound's `left` too (noted here). Function names `startEvent`/`endEvent` consistent. State names (`cloudVisible`, `cloudActive`, `eventActive`, `snowing`, `clearing`, `cars`) consistent across tasks.

**Known coupling to keep in sync:** the mound `left` (Task 3) and `BLOCK_VW` (Task 4) are the same blockage x — change them together.
