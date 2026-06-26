import { writable } from 'svelte/store';

// null = no convoy; 'ltr' | 'rtl' = start a convoy travelling that direction
// (matching the direction of the clicked nyhedsnat car).
export type ConvoyTrigger = 'ltr' | 'rtl' | null;

export const triggerConvoy = writable<ConvoyTrigger>(null);
