import { writable } from 'svelte/store';

// Weather → traffic bridge. A cloud easter egg (WeatherClouds.svelte) sets these;
// Vehicles.svelte consumes them and makes the live fleet react. Snow uses its own
// snowFreeze store (full halt + pile-up); these cover the lighter reactions.

// Sustained reaction while a weather effect is running (null = normal driving).
export interface TrafficMode {
	rate: number; // fleet speed multiplier (1 = normal, <1 = crawl)
	spray?: boolean; // wet-road wheel spray (rain)
	leaves?: boolean; // leaves kicked up from the wheels (autumn)
	glow?: boolean; // headlight glow in low visibility (fog)
	confetti?: boolean; // party mode — trail, cheer chorus, conga bob, costume, click-puff
	puddles?: number[]; // puddle x-centres (vw) → a car splashes when it drives over one
}
export const trafficMode = writable<TrafficMode | null>(null);

// One-shot events aimed at the live fleet. Consumer resets the store to null.
export type TrafficPulse =
	| { kind: 'flinch' } // brief startled halt for all cars (thunder)
	// lightning strikes the car below the cloud (nearest xPct): draw a bolt from the
	// cloud emit-point (ox,oy in viewport px) to the car, then zap/blacken/stall it.
	| { kind: 'strike'; xPct: number; ox: number; oy: number }
	| { kind: 'bounce' }; // celebratory hop for all cars (confetti)
export const trafficPulse = writable<TrafficPulse | null>(null);

// UFO tractor beam: WeatherClouds arms it at a viewport x (vw). Vehicles watches for
// the first car to drive into that x, lifts it up to the UFO + removes it, then bumps
// `abductCaught` so the cloud can shut the beam off. Setting abductBeam=null disarms.
export const abductBeam = writable<{ xPct: number } | null>(null);
export const abductCaught = writable(0);
// bumped when the user clicks the UFO to turn the beam OFF while a car is still rising
// → Vehicles drops the car back down (angry + dust) and it drives on.
export const abductRelease = writable(0);
