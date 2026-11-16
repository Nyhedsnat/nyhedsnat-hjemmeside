import { expect, test } from '@playwright/test';
import { pages } from './pages';

test('every internal link and file on every page resolves', async ({ page, request }) => {
	const targets = new Set<string>();
	for (const { path } of pages) {
		await page.goto(path);
		const hrefs = await page.$$eval('a[href^="/"], img[src^="/"]', (els) =>
			els.map((e) => e.getAttribute('href') ?? e.getAttribute('src') ?? '')
		);
		for (const h of hrefs) targets.add(h.split('#')[0]);
	}

	const broken: string[] = [];
	for (const t of targets) {
		const res = await request.get(t);
		if (!res.ok()) broken.push(`${t} -> ${res.status()}`);
	}
	expect(broken).toEqual([]);
});

test('invitation PDFs are served as PDF', async ({ page, request }) => {
	await page.goto('/tilmelding');
	const pdfs = await page.$$eval('a[href$=".pdf"]', (els) => els.map((e) => e.getAttribute('href')!));
	expect(pdfs).toHaveLength(3);
	for (const p of pdfs) {
		const res = await request.get(p);
		expect(res.status(), p).toBe(200);
		expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
	}
});

test('sitemap.xml and robots.txt are served', async ({ request }) => {
	const sitemap = await request.get('/sitemap.xml');
	expect(sitemap.ok()).toBe(true);
	expect(await sitemap.text()).toContain('<loc>https://nyhedsnat.dk/kontakt</loc>');

	const robots = await request.get('/robots.txt');
	expect(robots.ok()).toBe(true);
	expect(await robots.text()).toContain('Sitemap: https://nyhedsnat.dk/sitemap.xml');
});
