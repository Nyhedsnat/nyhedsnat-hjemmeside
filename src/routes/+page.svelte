<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';
</script>

<svelte:head>
	<title>NyhedsNat i Landsdel 4 – 6.–7. november 2026</title>
	<meta
		name="description"
		content="Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Over en nat samles deltagere i redaktioner, oplever hændelser og laver aviser."
	/>
	<link rel="canonical" href="https://nyhedsnat.dk/" />
	<!-- Open Graph -->
	<meta property="og:site_name" content="NyhedsNat" />
	<meta property="og:locale" content="da_DK" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nyhedsnat.dk/" />
	<meta property="og:title" content="NyhedsNat i Landsdel 4 – 6.–7. november 2026" />
	<meta
		property="og:description"
		content="Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Over en nat samles deltagere i redaktioner, oplever hændelser og laver aviser."
	/>
	<meta property="og:image" content="https://nyhedsnat.dk/images/logo.png" />
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="NyhedsNat i Landsdel 4 – 6.–7. november 2026" />
	<meta
		name="twitter:description"
		content="Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Over en nat samles deltagere i redaktioner, oplever hændelser og laver aviser."
	/>
	<meta name="twitter:image" content="https://nyhedsnat.dk/images/logo.png" />
	<!-- JSON-LD Event -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: 'NyhedsNat i Landsdel 4',
		description:
			'Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Over en nat samles deltagere i redaktioner, oplever hændelser og laver aviser.',
		startDate: '2026-11-06T18:00:00+01:00',
		endDate: '2026-11-07T10:00:00+01:00',
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		organizer: { '@type': 'Organization', name: 'FDF Landsdel 4', url: 'https://nyhedsnat.dk' },
		url: 'https://nyhedsnat.dk'
	})}<\/script>`}
</svelte:head>

<!-- Hero Section -->
<section class="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
	<!-- Decorative elements -->
	<div class="absolute inset-0 flex items-center justify-center opacity-10">
		<div
			class="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gold-500/30 to-transparent blur-3xl"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl text-center">
		<!-- Main heading -->
		<h1 class="mb-4 text-4xl font-bold md:text-6xl lg:text-7xl">
			<span class="text-gradient-gold">NyhedsNat</span>
			<br />
			<span class="text-3xl text-star-white md:text-4xl lg:text-5xl">i Landsdel 4</span>
		</h1>

		<!-- Date badge -->
		<div class="mb-8 inline-block rounded-full border border-gold-500/40 bg-gold-500/20 px-6 py-3">
			<span class="text-xl font-bold text-gold-400 md:text-2xl">6.-7. november 2026</span>
		</div>

		<!-- Subtitle -->
		<p class="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-star-white/80 md:text-xl">
			NyhedsNat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i Landsdel 4. Over
			en nat samles deltagere i redaktioner, oplever hændelser og laver aviser i en fælles
			legeramme.
		</p>

		<!-- CTA Button -->
		<JoinButton href="/tilmelding">Tilmeld jer Nyhedsnat</JoinButton>
	</div>
</section>

<!-- About Section -->
<section class="px-4 pt-8 pb-12">
	<div class="mx-auto max-w-4xl">
		<div class="card-dark rounded-3xl p-8 md:p-12">
			<h2 class="mb-6 text-2xl font-bold text-star-white md:text-3xl">
				Hvad er <span class="text-gradient-gold">Nyhedsnat</span>?
			</h2>

			<div class="space-y-6 text-lg leading-relaxed text-star-white/70">
				<p>
					Seniorer skaber og spiller hændelserne. Væbnere og seniorvæbnere er indelt i redaktioner oplever dem og fortæller
					historien videre i deres aviser.
				</p>

				<p>
					Arrangementet foregår indendørs med fælles base, overnatning i gymnastiksal og afslutning
					næste morgen.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Senior Planning Weekend Section -->
<section class="px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="card-dark rounded-3xl p-8 md:p-10">
			<h2 class="mb-4 text-2xl font-bold text-star-white md:text-3xl">
				Planlæg <span class="text-gradient-gold">NyhedsNat</span> som senior
			</h2>
			<div class="mb-7 space-y-4 text-lg leading-relaxed text-star-white/70">
				<p>Alle hændelser planlægges af seniorer.</p>
				<p>
					Vil du være med til at skabe oplevelsen, kan du deltage i planlægningsweekenden den
					25.–27. september.
				</p>
				<p>
					Weekenden er både et kursus og en workshop, hvor vi udvikler hændelser, arbejder med
					roller og tester idéer.
				</p>
			</div>
			<JoinButton href="/faq" variant="secondary">Læs mere om at være senior</JoinButton>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="px-4 py-12">
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<!-- Feature Card 1 -->
			<div class="card-dark group rounded-2xl p-8 transition-all duration-300 hover:scale-105">
				<div
					class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 transition-transform group-hover:scale-110"
				>
					<svg class="h-8 w-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
						/>
					</svg>
				</div>
				<h3 class="mb-3 text-xl font-bold text-star-white">Lav avis</h3>
				<p class="text-star-white/60">
					Redaktionerne skaber aviser med artikler, billeder, videoer og kreativt indhold gennem
					hele natten.
				</p>
			</div>

			<!-- Feature Card 2 -->
			<div class="card-dark group rounded-2xl p-8 transition-all duration-300 hover:scale-105">
				<div
					class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 transition-transform group-hover:scale-110"
				>
					<svg class="h-8 w-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<h3 class="mb-3 text-xl font-bold text-star-white">Oplev hændelser</h3>
				<p class="text-star-white/60">
					Seniorerne skaber spændende, dramatiske og sjove hændelser, som redaktionerne skal dække.
				</p>
			</div>

			<!-- Feature Card 3 -->
			<div class="card-dark group rounded-2xl p-8 transition-all duration-300 hover:scale-105">
				<div
					class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 transition-transform group-hover:scale-110"
				>
					<svg class="h-8 w-8 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<h3 class="mb-3 text-xl font-bold text-star-white">Fællesskab</h3>
				<p class="text-star-white/60">
					En nat med leg, fantasi og fælles oplevelser sammen med andre fra Landsdel 4.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="px-4 py-12">
	<div class="mx-auto max-w-4xl text-center">
		<div class="card-dark rounded-3xl p-10 md:p-16">
			<h2 class="mb-6 text-3xl font-bold text-star-white md:text-4xl">Klar til Nyhedsnat?</h2>
			<p class="mb-10 text-xl text-star-white/60">
				Tilmeld jeres redaktion og vær med til årets mest spændende nat.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<JoinButton href="/tilmelding">Tilmeld jer nu</JoinButton>
				<JoinButton href="/praktisk" variant="secondary">Læs mere</JoinButton>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
</style>
