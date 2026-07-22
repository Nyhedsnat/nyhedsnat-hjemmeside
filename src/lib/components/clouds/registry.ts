import type { Component } from 'svelte';
import type { CloudType, CloudProps } from '$lib/clouds';
import RainCloud from './RainCloud.svelte';
import ConfettiCloud from './ConfettiCloud.svelte';
import ThunderCloud from './ThunderCloud.svelte';
import FogCloud from './FogCloud.svelte';
import AutumnCloud from './AutumnCloud.svelte';
import UfoCloud from './UfoCloud.svelte';
import SnowCloud from '../SnowCrash.svelte';

// type → cloud component. Kept out of clouds.ts (which is imported by the components)
// to avoid a circular value import. The scheduler in WeatherClouds renders these.
export const cloudComponents: Record<CloudType, Component<CloudProps>> = {
	rain: RainCloud,
	confetti: ConfettiCloud,
	thunder: ThunderCloud,
	fog: FogCloud,
	autumn: AutumnCloud,
	ufo: UfoCloud,
	snow: SnowCloud
};
