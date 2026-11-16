import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { eggFor, vehicleTypes } from '../../src/lib/vehicles';

describe('vehicleTypes', () => {
	it.each(vehicleTypes.map((v) => [v.src, v]))('%s has a valid config', (src, v) => {
		expect(existsSync(`static${src}`), `missing file static${src}`).toBe(true);
		expect(v.weight).toBeGreaterThan(0);
		expect(v.minDuration).toBeLessThan(v.maxDuration);
	});

	it('has no duplicate vehicles', () => {
		expect(new Set(vehicleTypes.map((v) => v.src)).size).toBe(vehicleTypes.length);
	});
});

describe('eggFor', () => {
	it.each(vehicleTypes.map((v) => v.src))('%s has a click easter egg', (src) => {
		const egg = eggFor(src);
		expect(egg).not.toBeNull();
		expect(egg!.durationMs).toBeGreaterThan(0);
	});

	it('returns null for unknown vehicles', () => {
		expect(eggFor('/svg/unknown.svg')).toBeNull();
	});
});
