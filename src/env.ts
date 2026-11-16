import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_DEBUG_TRAFFIC: {
		public: true,
		schema: (v) => v,
		description: 'Set to "true" to show debug traffic (vehicles and clouds)'
	}
});
