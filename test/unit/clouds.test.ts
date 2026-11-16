import { afterEach, describe, expect, it, vi } from 'vitest';
import { cloudTypes, pickCloud } from '../../src/lib/clouds';

describe('cloudTypes', () => {
	it('weights sum to 100 so each weight reads as a percentage', () => {
		expect(cloudTypes.reduce((s, c) => s + c.weight, 0)).toBe(100);
	});

	it('has unique types and a Danish label for each', () => {
		expect(new Set(cloudTypes.map((c) => c.type)).size).toBe(cloudTypes.length);
		for (const c of cloudTypes) expect(c.label).not.toBe('');
	});
});

describe('pickCloud', () => {
	afterEach(() => vi.restoreAllMocks());

	it('picks the first cloud at the low end and the last at the high end', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);
		expect(pickCloud().type).toBe(cloudTypes[0].type);
		vi.spyOn(Math, 'random').mockReturnValue(0.9999);
		expect(pickCloud().type).toBe(cloudTypes.at(-1)!.type);
	});

	it('roughly follows the weights', () => {
		const counts: Record<string, number> = {};
		const n = 20000;
		for (let i = 0; i < n; i++) {
			const t = pickCloud().type;
			counts[t] = (counts[t] ?? 0) + 1;
		}
		for (const c of cloudTypes) expect(counts[c.type] / n).toBeCloseTo(c.weight / 100, 1);
	});
});
