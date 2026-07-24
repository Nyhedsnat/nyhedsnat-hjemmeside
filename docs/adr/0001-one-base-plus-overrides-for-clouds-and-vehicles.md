# ADR 0001: One base cloud, one base vehicle — variance is overrides, not parallel systems

## Status

Accepted. Binding for all future work on the weather-cloud and traffic-vehicle
easter eggs.

## Context

Both the cloud system and the vehicle system went through the same failure
mode twice:

- **Clouds**: each cloud type (rain, confetti, thunder, fog, autumn, ufo,
  snow) is supposed to share one skeleton — position, size, drift animation,
  active/debug state (`cloudBase.css`'s `.cloud` class). Snow's cloud
  (`SnowCrash.svelte`) was written as a fully separate `.snow-cloud` class
  instead, duplicating the skeleton by hand. When the shared skeleton's
  `top` value was tuned (38% → 28% → 18%) across a string of requests, snow
  silently didn't move, because it was never touched — it had its own
  copy. Same thing happened with the `cloud-drift-ltr/rtl` keyframes and the
  off-frame spawn margin (fleet used 250px, snow independently had 280px,
  later drifted to 650px while being hand-tuned in isolation).

- **Vehicles**: the convoy started as `Convoy.svelte`, a fully separate
  component re-implementing its own drive animation, puddle-splash-less
  physics, click behaviour, and RGB underglow — none of which is shared with
  the real traffic fleet. Every new weather reaction (rate ramps, freeze,
  bounce, flinch) had to be manually re-taught to Convoy from scratch. The
  snow pile-up (`SnowCrash.svelte`'s old `cars` array) had the same
  problem, at greater scale: its own arrive/park/leave keyframes, its own
  crash-fx/bump/jam-angry system, its own click-egg re-implementation
  (`fireLeaveEgg`), none of it wired into the fleet's weather machinery.

The pattern in both cases: **a "variant" was built as a sibling system
instead of the base system plus overrides**, so it silently stopped
receiving updates made to the base, and had to re-invent mechanics the base
already had.

## Decision

There is exactly **one** cloud implementation and exactly **one** vehicle
implementation. Every visual/behavioural variant is achieved by overriding
specific pieces of that one implementation — never by writing a second,
parallel implementation of "a cloud" or "a car."

### Clouds

- The shared skeleton lives in `src/lib/components/clouds/cloudBase.css`
  (`.cloud` class: position, size, drift/active/debug, puff shape) and is
  imported by every cloud component, including `SnowCrash.svelte`.
- A cloud "type" only ever supplies: a per-type puff colour rule
  (`.cloud.<type> .puff { background: ... }` in `cloudBase.css`) and
  whatever type-specific decoration it needs locally (rain's drip trail,
  autumn's leaf trail, snow's flake trail) — never its own copy of the
  skeleton, sizing, or drift keyframes.
- `registry.ts` maps `CloudType → Component<CloudProps>`; every cloud
  component accepts the same `CloudProps` contract.

### Vehicles

- The shared implementation is `Vehicles.svelte`'s `activeVehicles` fleet —
  spawn, drive animation, click pipeline, off-frame culling, and every
  weather reaction (puddle splash, thunder strike, snow freeze, UFO beam,
  rush hour) all operate on entries in this one array.
- A vehicle "variant" (convoy, snow-pile car, anything future) is just an
  entry in that same array with one or more of the following **override
  fields**, all defined in `$lib/stores/vehicleFleet.ts` and settable both
  at spawn (`spawnVehicle(opts)`) and mid-life (`setXOverride(id, ...)`):
  - `motionOverride` — replaces the standard `drive-ltr`/`drive-rtl` CSS
    crossing with a custom WAAPI sequence on the car's own element (arrive,
    park, skid, leave — anything that isn't "cross the screen once").
  - `clickOverride` — replaces the whole click pipeline for behaviour that
    doesn't fit "play an Egg" (e.g. bump-your-neighbour, which also mutates
    *other* vehicles).
  - `eggOverride` — swaps which `Egg` fires on click, without touching the
    click pipeline itself. `null` = click is egg-less (just honks).
  - `extraClass` — an ambient/idle CSS hook (a continuous fidget loop, a
    one-shot bump-shake), swappable mid-life.
  - `carFx` / `roadFx` — open `Snippet<[id]>` slots for arbitrary
    decoration: `carFx` renders inside `.car-body` (VehicleSprite) so it
    rides through any motion transform; `roadFx` renders as a sibling of the
    car so it stays at the road if the car moves away from it. **Never add
    a new named boolean prop for a new decoration** (the old
    `decorations: { underglow?: boolean }` shape) — extend via a snippet
    the caller supplies instead.
- Bridge: other components (SnowCrash, anything future) reach the fleet via
  `fleetRef` (`$lib/stores/vehicleFleet.ts`) — a synchronous mutable ref, not
  a pub/sub store, because `Vehicles.svelte` is a page-level singleton.
- Shared constants (off-frame spawn/exit margin, sizes, egg mappings) live in
  `$lib/vehicles.ts` and are imported by both `Vehicles.svelte` and any
  variant — never re-declared locally with a "close enough" number.

## Consequences

- A future variant (another convoy-like burst, another parked-cluster
  scene, whatever) should almost never need a new component with its own
  drive/click/decoration system. It needs: a spawn call into the shared
  fleet, plus whichever of the five override fields above it actually needs
  set.
- If a genuinely new override *type* is needed (not covered by motion/
  click/egg/class/fx), generalise it the same way these five were derived:
  look at the concrete thing that doesn't fit, name the override by what it
  replaces (not by the feature that needed it), and make it a field other
  future features can also use — not a one-off prop.
- When tuning something on the shared skeleton (cloud position, vehicle
  off-frame margin, drift timing), grep for the OTHER places that value
  might be duplicated before assuming a single edit covers every type. The
  original failure in both cases was exactly this: an edit to the shared
  file that a separately-implemented variant never received.
