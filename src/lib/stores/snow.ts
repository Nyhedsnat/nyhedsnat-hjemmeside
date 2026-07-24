import { writable } from 'svelte/store';

// True while a snowstorm covers the road. Normal background traffic (Vehicles)
// freezes in place — no new cars spawn and existing ones stop — until the
// crashed pile-up starts driving off again.
export const snowFreeze = writable(false);

// Puddles left behind by melted snowmen. Persist forever (not just the page session) —
// every snowstorm's snowman adds a permanent damp mark on the road, so they survive
// reloads and new visits via localStorage. { x } is in vw.
const PUDDLES_KEY = 'snowPuddles';

function loadPuddles(): { x: number }[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(PUDDLES_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export const snowPuddles = writable<{ x: number }[]>(loadPuddles());

if (typeof window !== 'undefined') {
	snowPuddles.subscribe((p) => localStorage.setItem(PUDDLES_KEY, JSON.stringify(p)));
}
