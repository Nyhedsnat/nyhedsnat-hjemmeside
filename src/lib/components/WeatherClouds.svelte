<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { pickCloud, cloudTypes, type CloudType, type CloudConfig } from '$lib/clouds';
	import { cloudComponents } from '$lib/components/clouds/registry';
	import './clouds/cloudBase.css';

	// Thin scheduler. One weather cloud drifts across at a time; when it reports `ondone`
	// the next is picked (weighted by clouds.ts). Each cloud type is its own component in
	// clouds/ (see registry). Debug shows one static cloud of every type at once.
	// `$env/dynamic/public` — import.meta.env doesn't expose PUBLIC_* to the client.
	const debug = env.PUBLIC_DEBUG_TRAFFIC === 'true';

	let current = $state<{ cfg: CloudConfig; direction: 'ltr' | 'rtl'; drift: number } | null>(null);
	let nextTimer: ReturnType<typeof setTimeout> | undefined;
	let forced: CloudType | null = null;

	const gap = () => Math.random() * 20000 + 10000; // 10-30s between clouds

	function scheduleNext(delay: number) {
		clearTimeout(nextTimer);
		nextTimer = setTimeout(showCloud, delay);
	}
	function showCloud() {
		const cfg = forced ? (cloudTypes.find((c) => c.type === forced) ?? pickCloud()) : pickCloud();
		current = {
			cfg,
			direction: Math.random() > 0.5 ? 'ltr' : 'rtl',
			drift: Math.random() * 20 + 35 // 35-55s drift across
		};
	}
	function onDone() {
		current = null; // unmount → a fresh instance mounts for the next one
		scheduleNext(forced ? 2000 : gap());
	}

	onMount(() => {
		if (debug) return; // all clouds rendered statically; no scheduler
		const param =
			typeof window !== 'undefined'
				? (new URLSearchParams(window.location.search).get('cloud') as CloudType | null)
				: null;
		if (param && cloudTypes.some((c) => c.type === param)) forced = param;
		scheduleNext(forced ? 500 : Math.random() * 20000 + 10000); // first cloud after 10-30s
		return () => clearTimeout(nextTimer);
	});
</script>

{#if debug}
	<!-- one static cloud of every type, spread across the sky, all independently clickable -->
	{#each cloudTypes as cfg, i (cfg.type)}
		{@const Cloud = cloudComponents[cfg.type]}
		<Cloud mode="static" left={`${6 + i * 13}%`} />
	{/each}
{:else if current}
	{@const Cloud = cloudComponents[current.cfg.type]}
	<Cloud mode="drift" direction={current.direction} drift={current.drift} ondone={onDone} />
{/if}
