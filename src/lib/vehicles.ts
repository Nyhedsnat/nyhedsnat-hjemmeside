// Car data + easter-egg mapping, shared by the traffic controller (Vehicles.svelte)
// and the snow pile-up controller (SnowCrash.svelte). Pure data/logic, no DOM.

export const SIZE = {
	car: 45,
	large: 65,
	small: 24,
	bus: 60 // bus.svg is ~2.98:1 → ~179px wide, matching the old standalone bus
} as const;

export type SizeCategory = keyof typeof SIZE;

export type EffectName =
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
	| 'busjump'
	| 'disco';

export interface VehicleType {
	src: string;
	size: SizeCategory;
	minDuration: number;
	maxDuration: number;
	weight: number;
	direction?: 'ltr' | 'rtl' | 'both';
}

export const vehicleTypes: VehicleType[] = [
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
	{ src: '/svg/eastereggs/vehicles/limo.svg', size: 'car', minDuration: 11, maxDuration: 17, weight: 1 },
	{ src: '/svg/eastereggs/vehicles/bus.svg', size: 'bus', minDuration: 14, maxDuration: 20, weight: 2 }
];

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

// Mapping copied 1:1 from the current Vehicles.svelte handleClick chain.
export function eggFor(src: string): Egg | null {
	if (src.includes('nyhedsnat-car')) return { effect: 'disco', durationMs: 8000, motion: null, convoy: true };
	if (src.includes('car-1.svg')) return { effect: 'slingre', durationMs: 3600, motion: null };
	if (src.includes('car-2.svg')) return { effect: 'poof', durationMs: 1300, motion: null, vanish: true };
	if (src.includes('car-3.svg')) return { effect: 'flyout', durationMs: 60000, motion: null };
	if (src.includes('car-4.svg')) return { effect: 'smokewheelie', durationMs: 3000, motion: null };
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
