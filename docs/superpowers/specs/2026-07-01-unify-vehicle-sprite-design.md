# Unify car rendering: `VehicleSprite` + controllers

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Today two components render/animate/click-handle cars independently:

- `Vehicles.svelte` — free background traffic, with all the click easter eggs.
- `SnowCrash.svelte` — the snowstorm pile-up, its own choreographed cars, no eggs.

They duplicate the car sprite + egg definitions, and a pile-up car that drives
off is a dead end (no easter egg). Unify the **sprite** (look + eggs) into one
reusable unit that both components *puppeteer*, so:

1. The egg visuals + car data live in exactly one place.
2. A pile-up car that leaves becomes a normal car with normal eggs.

Motion is deliberately **not** unified — the two motion systems (free drive vs
choreography) are very different and heavily tuned; each stays with its owner.

## Boundaries

### `src/lib/vehicles.ts` (data + pure logic)

- The car type list: `{ src, size, egg?, label? }` (moved out of `Vehicles.svelte`).
- `eggFor(src)` → `{ effect: string, motion?: MotionOp }` where `MotionOp` is one
  of `boost(rate, ms)` / `reverse(rate)` / `firestop` (the drive-coupled eggs).
- No DOM, no Svelte. Importable by both controllers.

### `VehicleSprite.svelte` (presentational, the reusable "Vehicle")

- Props: `src`, `size`, `direction`, `effect` (string | null).
- Renders the car `<img>` plus, for the given `effect`, the matching visual
  (owns ALL shared egg CSS classes, their fx child elements, and keyframes).
- **No** click handler, **no** state, **no** motion, **no** knowledge of when an
  egg should fire. Given an `effect` string, it shows that effect. Given `null`,
  it shows a plain car. That is the entire contract.
- Because it is a pure function of `(src, effect)`, it can be understood and
  tested in isolation (the `/animation-test` grid already does exactly this).

### `Vehicles.svelte` — traffic controller

- Owns: spawn loop, weighted random, the free CSS drive animation, rush hour,
  snow-freeze (rate ramp), removal timers, grid mode.
- On click: `effect = trafficStopped ? angry : eggFor(src).effect`; set it on the
  car's sprite; apply any `motion` op to *its* drive animation.

### `SnowCrash.svelte` — pile controller

- Owns: the choreography (cloud → snow build → arrival → crash → pile → melt →
  staggered leave) and the snow-only overlays (crash sparks, angry fidget,
  jam-dust, anger-mark, click-bump).
- Renders each pile car via `VehicleSprite`, puppeteering its position/motion as
  it does now, and passing an `effect` chosen by state (table below).

## The `effect` contract (behavior is passed in, gated by state)

The sprite never decides. The controller passes `effect`, gated by the car's state:

| Car state | effect the controller passes |
|---|---|
| Free traffic | its easter egg (`eggFor(src).effect`) |
| Snow: arriving / crashing | `null` (disabled) |
| Snow: stuck in the pile | `bump-hard` (clicked) / `bump-soft` (neighbours) |
| Snow: **leaving** | its easter egg — now a normal car |

"Enable/disable" = the controller passing `null`. "Egg vs aggression" = which
effect string it passes.

## Motion-coupled eggs

Turbo/nitro/u-turn/firestop change the car's *drive speed*, which the controller
owns (not the sprite). `eggFor` returns an optional `motion` op; the controller
applies it to **whatever motion animation that car is currently running**. The
existing `boostDrive`/`reverseDrive` (currently hard-wired to the traffic drive
animation, matched by `"drive"` in the keyframe name) are generalized to "find
this car's active drive animation" so they also work on a leaving pile car's
`snowcar-leave` animation.

## Effect split (keep the sprite lean)

- **In `VehicleSprite`** (shared by both): slingre, flyout, turbo, wheelie,
  splash, poof, press, stretch, disco, meteorpanic, busjump, u-turn.
- **In `SnowCrash`** (snow-only, not shared): crash sparks, angry fidget,
  jam-dust/anger-mark, bump-hard/bump-soft. Still "an effect the controller
  triggers" — just defined where it is used, so the shared sprite doesn't carry
  snow-only markup.

## Migration (incremental — tuned motion never moves)

1. Create `vehicles.ts` (type list + `eggFor`) and `VehicleSprite.svelte`; move
   the shared egg CSS/markup/keyframes into the sprite.
2. Switch `Vehicles` to render `VehicleSprite`. **Verify full egg parity on
   `/animation-test`** (the grid exercises every egg) before continuing.
3. Switch `SnowCrash` pile cars to render `VehicleSprite` (snow overlays stay).
4. Wire the leaving state → egg (the original goal) + generalize the motion op so
   drive-coupled eggs work on a leaving car.

Each step is verified before the next. The choreography and drive systems keep
their current, tuned behavior.

## Testing / verification

- `/animation-test` grid = the parity harness: after step 2 every egg must look
  and replay exactly as before.
- `npm run check` (svelte-check) clean after each step.
- Manual/preview: trigger a snowstorm; confirm stuck cars still bump/honk, and a
  leaving car now fires a real egg on click.

## Risks

- Large refactor across the two biggest files; ~800 lines of egg CSS relocate and
  both click paths are rewired. Mitigated by the incremental steps, the grid
  parity check, and the user's pre-refactor commit as a rollback point.
- Svelte scopes CSS per component — moving egg CSS into `VehicleSprite` changes
  the scope hash; keyframe names stay valid because they move with their rules.
  The `boostDrive` keyframe-name match (`includes("drive")`) must keep matching
  after the move.

## Out of scope

- Unifying the motion systems (approach B / full strategy controller) — rejected:
  the two motions barely overlap, so it is high risk for little shared code.
- Chain-reaction bump beyond immediate neighbours.
