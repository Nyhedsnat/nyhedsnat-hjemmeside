import { writable } from 'svelte/store';

// True while a snowstorm covers the road. Normal background traffic (Vehicles)
// freezes in place — no new cars spawn and existing ones stop — until the
// crashed pile-up starts driving off again.
export const snowFreeze = writable(false);
