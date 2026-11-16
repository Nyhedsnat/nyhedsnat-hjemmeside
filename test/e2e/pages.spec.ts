import { expect, test } from '@playwright/test';
import { pages } from './pages';

for (const { path, h1 } of pages) {
	test(`${path} renders without errors`, async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

		const res = await page.goto(path);
		expect(res?.status()).toBe(200);

		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
		if (h1) await expect(heading).toContainText(h1, { ignoreCase: true });

		await expect(page).toHaveTitle(/NyhedsNat/i);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://nyhedsnat.dk${path}`);
		await expect(page.locator('footer')).toBeVisible();

		// No horizontal scrolling, on any viewport.
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		expect(overflow).toBeLessThanOrEqual(1);

		expect(errors).toEqual([]);
	});
}
