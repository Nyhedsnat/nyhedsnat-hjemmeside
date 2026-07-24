import type { Snippet } from 'svelte';
import type { Egg } from '$lib/vehicles';

// Bridge for other components (SnowCrash's pile-up, anything future) to spawn and
// control REAL fleet vehicles in Vehicles.svelte, instead of building a bespoke
// parallel car system. Vehicles.svelte is a singleton (one instance in the root
// layout) so a plain mutable ref is enough — no need for a pub/sub store here,
// this is a synchronous function-call bridge, not an event channel.
//
// `current` is null until Vehicles.svelte mounts; callers must guard for that.
export type MotionOverride = (el: HTMLElement, id: number) => void;
export type ClickOverride = (id: number) => void;

export interface SpawnOpts {
	typeIndex?: number;
	direction?: 'ltr' | 'rtl';
	duration?: number;
	eggOverride?: Egg | null; // null = click just honks, no egg at all
	underglow?: boolean;
	speedOverride?: number; // playbackRate this car spawns at
	motionOverride?: MotionOverride; // replaces the standard drive-ltr/rtl crossing entirely
	clickOverride?: ClickOverride; // replaces the whole click pipeline (egg/vanish/motion) for custom behaviour
	extraClass?: string; // ambient/idle CSS hook, rendered on the car's .vfx element
	carFx?: Snippet<[id: number]>; // arbitrary car-attached decoration — rides through any transform (see VehicleSprite's car-body)
	roadFx?: Snippet<[id: number]>; // arbitrary ground-relative decoration — a sibling of the car, stays put if it flies off
}

export interface FleetApi {
	spawnVehicle: (opts?: SpawnOpts) => number;
	removeVehicle: (id: number) => void;
	setEggOverride: (id: number, egg: Egg | null | undefined) => void;
	setMotionOverride: (id: number, fn: MotionOverride) => void;
	setClickOverride: (id: number, fn: ClickOverride | undefined) => void;
	setExtraClass: (id: number, cls: string | undefined) => void;
}

export const fleetRef: { current: FleetApi | null } = { current: null };
