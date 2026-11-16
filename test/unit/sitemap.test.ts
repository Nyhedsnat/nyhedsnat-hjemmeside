import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GET } from '../../src/routes/sitemap.xml/+server';

// Every folder under src/routes with a +page.svelte, as a URL path.
function pageRoutes(dir = 'src/routes', base = ''): string[] {
	const out = existsSync(join(dir, '+page.svelte')) ? [base || '/'] : [];
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		if (e.isDirectory()) out.push(...pageRoutes(join(dir, e.name), `${base}/${e.name}`));
	}
	return out;
}

describe('sitemap.xml', async () => {
	const res = GET();
	const xml = await res.text();
	const listed = [...xml.matchAll(/<loc>https:\/\/nyhedsnat\.dk([^<]*)<\/loc>/g)].map((m) => m[1]);

	it('is served as XML', () => {
		expect(res.headers.get('Content-Type')).toBe('application/xml');
		expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
	});

	it('lists every page except the noindex animation test', () => {
		const expected = pageRoutes().filter((p) => p !== '/animation-test');
		expect([...listed].sort()).toEqual(expected.sort());
	});
});
