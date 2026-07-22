import { writable } from 'svelte/store';

// The big full-viewport balloon (Balloon.svelte) used to spawn on its own ambient
// timer. Now it ONLY spawns while the confetti cloud is on screen — ConfettiCloud
// toggles this true on mount / false on unmount; Balloon.svelte just watches it.
export const confettiPresent = writable(false);
