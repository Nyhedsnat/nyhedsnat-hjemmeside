import { describe, expect, it } from 'vitest';
import { jaggedPath } from '../../src/lib/lightning';

describe('jaggedPath', () => {
	it('starts and ends at the given points with 2^gens + 1 points', () => {
		const d = jaggedPath(0, 0, 100, 200, 30, 4);
		const pts = d.replace(/^M /, '').split(' L ');
		expect(pts).toHaveLength(2 ** 4 + 1);
		expect(pts[0]).toBe('0.0 0.0');
		expect(pts.at(-1)).toBe('100.0 200.0');
	});

	it('is a straight line with zero generations', () => {
		expect(jaggedPath(1, 2, 3, 4, 10, 0)).toBe('M 1.0 2.0 L 3.0 4.0');
	});
});
