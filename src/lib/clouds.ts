// Cloud easter-egg config, mirrors vehicles.ts. One drifting cloud shows at a
// time; the scheduler in WeatherClouds.svelte picks the next type weighted by
// `weight` (same weighted-random system as the traffic in Vehicles.svelte).
// Tune the numbers below to make a cloud rarer (lower) or more common (higher).

export type CloudType = 'snow' | 'rain' | 'confetti' | 'thunder' | 'fog' | 'autumn' | 'ufo';

export interface CloudConfig {
	type: CloudType;
	weight: number; // relative spawn rarity — same idea as vehicleTypes.weight
	label: string; // aria-label / eggtest label (Danish)
}

// Props every cloud component (clouds/*.svelte) accepts. `mode: 'drift'` = the
// scheduler drifts it across once; `mode: 'static'` = a fixed debug cloud. Each
// component calls `ondone` when it has finished (drifted off / effect over) so the
// scheduler can bring the next one along.
export type CloudMode = 'drift' | 'static';
export interface CloudProps {
	mode?: CloudMode;
	direction?: 'ltr' | 'rtl';
	drift?: number; // drift duration in seconds
	left?: string; // x position in static/debug mode
	ondone?: () => void;
}

// Weights ARE spawn-chance percentages — they must sum to 100, so you can read
// `weight: 20` as "20% chance" directly instead of eyeballing a ratio. Rarest
// entries here (confetti/ufo) are 5%, the floor requested for "least likely".
export const cloudTypes: CloudConfig[] = [
	{ type: 'snow', weight: 2000, label: 'Snesky' },
	{ type: 'rain', weight: 20, label: 'Regnsky' },
	{ type: 'confetti', weight: 5, label: 'Konfettisky' },
	{ type: 'thunder', weight: 15, label: 'Tordensky' },
	{ type: 'fog', weight: 20, label: 'Tågesky' },
	{ type: 'autumn', weight: 15, label: 'Efterårssky' },
	{ type: 'ufo', weight: 5, label: 'UFO-sky' }
];

const totalWeight = cloudTypes.reduce((s, c) => s + c.weight, 0);

// Weighted-random pick, identical approach to getWeightedRandomVehicle().
export function pickCloud(): CloudConfig {
	let r = Math.random() * totalWeight;
	for (const c of cloudTypes) {
		r -= c.weight;
		if (r <= 0) return c;
	}
	return cloudTypes[0];
}
