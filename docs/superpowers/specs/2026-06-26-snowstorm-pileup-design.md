# Snowstorm pile-up easter egg — design

## Goal

A new, fully self-contained click easter egg: a snow cloud **occasionally** drifts
across the night sky. Clicking it starts a snowstorm that piles snow on the road and
causes a ~20-car bumper-to-bumper pile-up, then everything clears.

Hard constraint: **additive only**. No changes to any existing easter egg or to
`Vehicles.svelte`/`Convoy.svelte`/`Ufo.svelte`/`MoonLaser.svelte`/`Bus.svelte`/stores.
The only edit outside the new file is a single `<SnowCrash />` line in the layout.

## Trigger

- A small **snow cloud** sprite that appears intermittently (mirrors the `Bus.svelte`
  scheduling pattern): drifts slowly across the sky every ~60–150s, then leaves.
- While it is on screen it is clickable (a `<button>` with `pointer-events: auto`);
  subtle/idle-looking until clicked.
- Click while drifting → starts one event. Clicks are ignored while an event already
  runs (`eventActive` guard) and when the cloud is not currently visible.

## Phases (one event, ~12–15s total)

1. **Storm builds (~0–2s):** cloud darkens/grows; snow begins — white dots falling with
   slight horizontal drift; density ramps up.
2. **Snow piles (~1–8s):** a white mound grows on the road at a fixed "blockage" x (a
   shape that widens + heightens over time). Road whitens slightly.
3. **Pile-up (~2–12s):** ~20 cars (own fleet, reusing
   `/svg/eastereggs/vehicles/*.svg`) flood in from **one side** (random per event) at
   speed, decelerate near the mound, **skid** (small rotate) and **stop
   bumper-to-bumper**, each new car rear-ending the chain with a tiny **bump shake** +
   a small **crash spark** (✦/star) and an **"!" honk** bubble. Chain grows backward
   from the mound.
4. **Clear (~12–15s):** snow stops, mound/pile melts (fade + shrink), crashed cars fade
   out, cloud returns to idle drift. State resets → re-triggerable.

## Components (all inside one `SnowCrash.svelte`)

- **Cloud** — drifting `<button>`; idle vs active (darker) visual.
- **Snowfall** — a field of CSS snow dots (looping `translateY` + drift); opacity ramps
  with phase.
- **Pile/mound** — a white blob at the blockage x that grows in size.
- **Car fleet** — array of `{ id, src, side, stopX, rotation, delay }` rendered as
  absolutely-positioned sliding `<img>`; CSS keyframes drive-in → skid-stop; per-car
  honk/spark child elements.
- **Ground whitening** (optional) — faint white overlay on the road during the storm.

## State / lifecycle

- Local Svelte 5 `$state`: `cloudVisible`, `eventActive`, `phase`, `cars[]`.
- Cloud scheduling via `setTimeout` intervals (same shape as `Bus.svelte`).
- One event at a time; auto-clears via timers; fully resets so it can fire again.
- `pointer-events`: only the cloud button is interactive; snow/cars/pile are
  `pointer-events: none`.

## Isolation (hard constraint)

- New file: `src/lib/components/SnowCrash.svelte`.
- One added line in `src/routes/+layout.svelte`: `<SnowCrash />` (inside
  `.houses-container` so the cars sit on the same road band; cloud positioned in the
  sky via absolute positioning).
- No edits to any existing component, store, or effect.

## 2D feasibility

All motion is CSS transforms/opacity on sprites + simple shapes — no limbs/articulation.
Cars are the existing side-view SVGs that slide (`translateX`), skid (small `rotate`),
and shake (keyframe). Snow = translating dots. Pile = scaling shape. Cloud = drift +
opacity. Everything matches the project's existing animation style.

## Defaults (adjustable at review)

- Cars flood from **one side** (random per event) for a clean rear-end pile-up.
- Crash marks: **small cartoony** — spark bursts + "!" honk bubbles.
- ~20 cars; event ~12–15s; cloud appears every ~60–150s.

## Success criteria

- Clicking the drifting cloud once triggers the full sequence; ignored if already running
  or cloud not visible.
- ~20 cars visibly pile up bumper-to-bumper near a growing snow mound while snow falls.
- Everything clears and resets; re-triggerable.
- `npm run check` passes (0 errors). The only diff to existing files is the single
  `<SnowCrash />` insertion in `+layout.svelte`.
