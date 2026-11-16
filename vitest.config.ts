import { defineConfig } from 'vitest/config';

// ponytail: own config so unit tests don't boot the SvelteKit/Tailwind Vite plugins.
export default defineConfig({
	test: { include: ['test/unit/**/*.test.ts'] }
});
