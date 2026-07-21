import { writable } from 'svelte/store';

// True while a snowstorm covers the road. Normal background traffic (Vehicles)
// freezes in place — no new cars spawn and existing ones stop — until the
// crashed pile-up starts driving off again.
export const snowFreeze = writable(false);

// Puddles left behind by melted snowmen. Persist for the whole page session (they
// outlive the snowman AND the SnowCrash component, which unmounts after each storm),
// so a melted snowman leaves a permanent damp mark on the road. { x } is in vw.
export const snowPuddles = writable<{ x: number }[]>([]);
