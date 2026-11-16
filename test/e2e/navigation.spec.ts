import { expect, test } from '@playwright/test';

test('navigates between pages from the header', async ({ page, isMobile }) => {
	await page.goto('/');
	const header = page.locator('header');

	if (isMobile) {
		const toggle = header.getByRole('button', { name: 'Toggle menu' });
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	}

	await header.getByRole('link', { name: 'FAQ', exact: true }).filter({ visible: true }).click();
	await expect(page).toHaveURL(/\/faq$/);
	await expect(page.locator('h1')).toBeVisible();

	if (isMobile) {
		// Menu closes after navigating.
		await expect(header.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute('aria-expanded', 'false');
	}
});

test('social links open Instagram and Facebook in a new tab', async ({ page }) => {
	await page.goto('/kontakt');
	for (const [name, url] of [
		['NyhedsNat på Instagram', 'https://www.instagram.com/nyhedsnat/'],
		['NyhedsNat på Facebook', 'https://www.facebook.com/profile.php?id=61594900765016']
	]) {
		const link = page.locator('main').getByRole('link', { name }).first();
		await expect(link).toHaveAttribute('href', url);
		await expect(link).toHaveAttribute('target', '_blank');
		await expect(link).toHaveAttribute('rel', /noopener/);
	}
});
