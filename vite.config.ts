import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	function debugTrafficWarning() {
		return {
			name: 'debug-traffic-warning',
			configureServer() {
				if (String(env.PUBLIC_DEBUG_TRAFFIC ?? '').toLowerCase() === 'true') {
					const multiplier = env.PUBLIC_DEBUG_TRAFFIC_MULTIPLIER ?? '5';
					console.warn(`\n\x1b[33m[DEBUG TRAFFIC]\x1b[0m Vehicles spawn in fixed sequence at ${multiplier}× rate\n`);
				}
			}
		};
	}

	return { plugins: [tailwindcss(), sveltekit(), devtoolsJson(), debugTrafficWarning()] };
});
