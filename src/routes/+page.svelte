<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Play from '@lucide/svelte/icons/play';
	import JoinButton from '$lib/components/JoinButton.svelte';
	import { planningState } from '$lib';

	const archiveUrl = 'https://arkiv.avismaskinen.dk';
</script>

<!-- 16:9 videoplads. Med YouTube-id vises videoen, uden vises pladsholderen. -->
{#snippet videoSlot(title: string, youtubeId?: string)}
	<div class="relative aspect-video w-full overflow-hidden rounded-2xl bg-night-900/60">
		{#if youtubeId}
			<iframe
				src="https://www.youtube-nocookie.com/embed/{youtubeId}"
				{title}
				class="absolute inset-0 h-full w-full"
				allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
				referrerpolicy="strict-origin-when-cross-origin"
				loading="lazy"
			></iframe>
		{:else}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
			<span class="flex size-16 items-center justify-center rounded-full bg-gold-500">
				<Play class="ml-1 size-7 fill-current text-night-900" aria-hidden="true" />
			</span>
			<p class="font-extrabold text-star-white italic">{title}</p>
			<p class="text-sm text-star-white/60">Video kommer snart</p>
		</div>
		{/if}
	</div>
{/snippet}

<svelte:head>
	<title>NyhedsNat i Landsdel 4 – 12.–13. november 2027</title>
	<meta
		name="description"
		content="Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Det foregår 12.–13. november 2027 på en skole, som annonceres i uge 40, hvor deltagerne over en nat samles i redaktioner, oplever hændelser og laver aviser."
	/>
	<link rel="canonical" href="https://nyhedsnat.dk/" />
	<!-- Open Graph -->
	<meta property="og:url" content="https://nyhedsnat.dk/" />
	<meta property="og:title" content="NyhedsNat i Landsdel 4 – 12.–13. november 2027" />
	<meta
		property="og:description"
		content="Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Det foregår 12.–13. november 2027 på en skole, som annonceres i uge 40, hvor deltagerne over en nat samles i redaktioner, oplever hændelser og laver aviser."
	/>
	<!-- Twitter Card -->
	<meta name="twitter:title" content="NyhedsNat i Landsdel 4 – 12.–13. november 2027" />
	<meta
		name="twitter:description"
		content="Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Det foregår 12.–13. november 2027 på en skole, som annonceres i uge 40, hvor deltagerne over en nat samles i redaktioner, oplever hændelser og laver aviser."
	/>
	<!-- JSON-LD Event -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: 'NyhedsNat i Landsdel 4',
		description:
			'Nyhedsnat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i FDF Landsdel 4. Det foregår 12.–13. november 2027 på en skole, som annonceres i uge 40, hvor deltagerne over en nat samles i redaktioner, oplever hændelser og laver aviser.',
		startDate: '2027-11-12T18:00:00+01:00',
		endDate: '2027-11-13T10:00:00+01:00',
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		image: 'https://nyhedsnat.dk/images/og-image.png',
		location: {
			'@type': 'Place',
			name: 'Skole annonceres i uge 40',
			address: {
				'@type': 'PostalAddress',
				addressRegion: 'Østjylland',
				addressCountry: 'DK'
			}
		},
		organizer: {
			'@type': 'Organization',
			name: 'FDF Landsdel 4',
			url: 'https://nyhedsnat.dk',
			sameAs: ['https://fdf.dk/landsdel4/']
		},
		url: 'https://nyhedsnat.dk'
	})}<\/script>`}
</svelte:head>

<!-- Hero Section -->
<section class="relative flex items-center justify-center overflow-hidden px-4 pt-16 pb-4 md:pt-24">
	<!-- Decorative elements -->
	<div class="absolute inset-0 flex items-center justify-center opacity-10">
		<div
			class="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gold-500/30 to-transparent blur-3xl"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl text-center">
		<!-- Main heading -->
		<h1 class="mb-6 text-5xl md:text-7xl lg:text-8xl font-black italic">
			<span class="text-gradient-gold">Nyheds</span><span class="text-star-white">Nat</span>
			<br />
			<span class="text-3xl font-extrabold text-star-white md:text-4xl lg:text-5xl">i Landsdel 4</span>
		</h1>

		<!-- Date badge, with the venue as a smaller line under it -->
		<div class="mb-8 flex flex-col items-center gap-3">
			<span class="band text-xl md:text-2xl">12.–13. november 2027</span>
			<p class="text-base font-medium text-star-white/60"><MapPin class="-mt-0.5 mr-1 inline size-4" aria-hidden="true" /> Skole annonceres i uge 40</p>
		</div>

		<!-- CTA-KNAP: slået fra uden for sæsonen. Fjern kommentaren, når tilmeldingen åbner igen.
		<JoinButton href="/tilmelding">Tilmeld jer Nyhedsnat</JoinButton>
		-->
	</div>
</section>

<!-- NyhedsNat 2026: tak-video + avisarkiv -->
<section class="px-4 pt-8 pb-12">
	<div class="mx-auto max-w-4xl">
		<div class="card-dark rounded-3xl p-8 md:p-12">
			<h2 class="mb-4 text-2xl font-extrabold text-gold-500 uppercase italic md:text-3xl">Tak for NyhedsNat 2026</h2>
			<p class="mb-8 text-lg leading-relaxed text-star-white/70">
				Se hvad deltagerne lavede. Aviserne fra 2026 ligger i <a href={archiveUrl} target="_blank" rel="noopener noreferrer" class="font-semibold text-gold-500 underline underline-offset-2 hover:text-gold-600">arkivet</a>, hvis du er nysgerrig på, hvordan en avis ser ud.
			</p>

			<div class="mb-8">{@render videoSlot('Tak for NyhedsNat 2026', 'dW8_goBJ4y8')}</div>

			<JoinButton href={archiveUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
				<Newspaper class="size-5 shrink-0" aria-hidden="true" /> Se aviserne fra 2026
			</JoinButton>
		</div>
	</div>
</section>

<!-- About Section -->
<section class="px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="card-dark rounded-3xl p-8 md:p-12">
			<h2 class="mb-6 text-2xl md:text-3xl font-extrabold italic uppercase text-gold-500">
				Hvad er <span class="text-gradient-gold">Nyhedsnat</span>?
			</h2>

			<div class="space-y-6 text-lg leading-relaxed text-star-white/70">
				<p>
					NyhedsNat er et årligt arrangement for væbnere, seniorvæbnere og seniorer i Landsdel 4. Over
					en nat samles deltagere i redaktioner, oplever hændelser og laver aviser i en fælles
					legeramme.
				</p>

				<p>
					Seniorer skaber og spiller hændelserne. Væbnere og seniorvæbnere er indelt i redaktioner oplever dem og fortæller
					historien videre i deres aviser.
				</p>

				<p>
					Hele arrangementet foregår på en skole, som annonceres i uge 40. Det er indendørs med fælles base, overnatning i skolens
					gymnastiksal og afslutning næste morgen.
				</p>
			</div>

			<!-- KONCEPTVIDEO: skjult indtil videoen er klar. Fjern kommentaren for at vise den.
			<div class="mt-8">{@render videoSlot('Sådan fungerer NyhedsNat')}</div>
			-->
		</div>
	</div>
</section>

<!-- Senior Planning Weekend Section -->
<section class="px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="card-dark rounded-3xl p-8 md:p-10">
			<h2 class="mb-4 text-2xl md:text-3xl font-extrabold italic uppercase text-gold-500">
				Planlæg <span class="text-gradient-gold">NyhedsNat</span> som senior
			</h2>
			<div class="mb-7 space-y-4 text-lg leading-relaxed text-star-white/70">
				<p>Alle hændelser planlægges af seniorer.</p>
				{#if planningState === 'held'}
					<p>
						Arrangøruddannelse & planlægningsweekend for seniorer er afholdt for i år. Ny dato meldes ud snarest.
					</p>
					<p>
						Du kan stadig være med som senior på selve NyhedsNat, hvor du får en rolle og er med til at afvikle hændelserne.
					</p>
				{:else}
					<p>
						Vil du være med til at skabe oplevelsen, kan du deltage i Arrangøruddannelse & planlægningsweekend for seniorer.
						Dato meldes ud snarest.
					</p>
					<p>
						Weekenden er både et kursus og en workshop, hvor vi udvikler hændelser, arbejder med
						roller og tester idéer.
					</p>
					{#if planningState === 'upcoming'}
						<p class="font-semibold text-gold-300">Tilmeldingen er ikke åben endnu.</p>
					{:else if planningState === 'open'}
						<p class="font-semibold text-gold-300">Tilmeldingen er åben.</p>
					{:else}
						<p class="font-semibold text-red-300"><Lock class="-mt-0.5 mr-1 inline size-4" aria-hidden="true" /> Tilmeldingen er lukket.</p>
					{/if}
				{/if}
			</div>
			{#if planningState === 'open'}
				<JoinButton href="/tilmelding" className="mb-4 mr-3">Tilmeld dig weekenden</JoinButton>
			{/if}
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
					class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 transition-transform group-hover:scale-110"
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
				<h3 class="mb-3 text-xl text-star-white font-extrabold italic">Lav avis</h3>
				<p class="text-star-white/60">
					Redaktionerne skaber aviser med artikler, billeder, videoer og kreativt indhold gennem
					hele natten.
				</p>
			</div>

			<!-- Feature Card 2 -->
			<div class="card-dark group rounded-2xl p-8 transition-all duration-300 hover:scale-105">
				<div
					class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 transition-transform group-hover:scale-110"
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
				<h3 class="mb-3 text-xl text-star-white font-extrabold italic">Oplev hændelser</h3>
				<p class="text-star-white/60">
					Seniorerne skaber spændende, dramatiske og sjove hændelser, som redaktionerne skal dække.
				</p>
			</div>

			<!-- Feature Card 3 -->
			<div class="card-dark group rounded-2xl p-8 transition-all duration-300 hover:scale-105">
				<div
					class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 transition-transform group-hover:scale-110"
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
				<h3 class="mb-3 text-xl text-star-white font-extrabold italic">Fællesskab</h3>
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
		<div class="card-dark card-featured rounded-3xl p-10 md:p-16">
			<h2 class="mb-6 text-3xl md:text-4xl font-extrabold italic uppercase text-gold-500">Klar til Nyhedsnat?</h2>
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
