// Prerendered sitemap for the static (Cloudflare) build. Lists every indexable page so search
// engines discover them all; `/animation-test` is deliberately left out (it is `noindex`).
// Discovered by crawlers via the `Sitemap:` line in static/robots.txt.
export const prerender = true;

const ORIGIN = 'https://nyhedsnat.dk';

const PATHS = [
	'/',
	'/tilmelding',
	'/program',
	'/praktisk',
	'/faq',
	'/kontakt',
	'/redaktion',
	'/redaktion/avismaskinen',
	'/redaktion/regler',
	'/redaktion/vaerktojer'
];

export function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PATHS.map((path) => `\t<url><loc>${ORIGIN}${path}</loc></url>`).join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
