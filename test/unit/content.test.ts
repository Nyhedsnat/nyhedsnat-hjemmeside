import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function files(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? files(join(dir, e.name)) : /\.(svelte|ts|html)$/.test(e.name) ? [join(dir, e.name)] : []
	);
}
const sources = files('src').map((f) => ({ f, text: readFileSync(f, 'utf8') }));

describe('site content', () => {
	it('uses a short hyphen, never an en dash', () => {
		const hits = sources.filter((s) => s.text.includes('–')).map((s) => s.f);
		expect(hits).toEqual([]);
	});

	it('only links to static files that exist', () => {
		const missing = sources
			.flatMap((s) => [...s.text.matchAll(/(?:href|src)="(\/[^"#?]+\.(?:pdf|svg|png|jpe?g|webp))"/g)].map((m) => m[1]))
			.filter((p) => !existsSync(join('static', p.normalize('NFC'))) && !existsSync(join('static', p.normalize('NFD'))));
		expect(missing).toEqual([]);
	});
});
