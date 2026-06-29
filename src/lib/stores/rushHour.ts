import { writable } from 'svelte/store';

// Set to true to kick off a ~20s "rush hour" traffic surge.
// Emitted by MoonLaser (when the laser fires), consumed by Vehicles.
export const rushHourTrigger = writable(false);
