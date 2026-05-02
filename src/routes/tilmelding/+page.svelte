<svelte:head>
	<title>Tilmelding – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Tilmeld jeres redaktion til NyhedsNat i Landsdel 4 den 6.–7. november 2026. Tilmelding sker samlet for hele redaktionen." />
	<link rel="canonical" href="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:site_name" content="NyhedsNat" />
	<meta property="og:locale" content="da_DK" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:title" content="Tilmelding – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Tilmeld jeres redaktion til NyhedsNat i Landsdel 4 den 6.–7. november 2026. Tilmelding sker samlet for hele redaktionen." />
	<meta property="og:image" content="https://nyhedsnat.dk/images/logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Tilmelding – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Tilmeld jeres redaktion til NyhedsNat i Landsdel 4 den 6.–7. november 2026. Tilmelding sker samlet for hele redaktionen." />
	<meta name="twitter:image" content="https://nyhedsnat.dk/images/logo.png" />
</svelte:head>

<script lang="ts">
	const signupNotOpenYet = false;
	const signupOpensText = '1. juli 2026';

	const nyhedsnatSignupDeadline = '25. oktober 2026';
	const planningSignupOpen = true;
	const planningSignupDeadlineText = '20. september 2026';
</script>

<div class="min-h-screen px-4 py-12">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header -->
		<div class="text-center mb-16">
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-star-white mb-6">
				<span class="text-gradient-gold">Tilmelding</span>
			</h1>
			<p class="text-xl text-star-white/60 max-w-2xl mx-auto">
				Tilmelding foregår samlet for hver redaktion.
			</p>
		</div>

		{#if signupNotOpenYet}
			<section class="card-dark rounded-2xl p-8 md:p-10 mb-12 border-gold-500/30">
				<h2 class="text-2xl font-bold text-star-white mb-4">Tilmeldingen er ikke åben endnu</h2>
				<p class="text-gold-400 font-semibold mb-4">Tilmeldingen åbner {signupOpensText}.</p>
				<p class="text-star-white/70 mb-3">Der bliver åbnet for tilmelding til både NyhedsNat og planlægningsweekend for seniorer.</p>
				<ul class="text-star-white/70 space-y-1">
					<li>• NyhedsNat: Tilmeldingsfrist {nyhedsnatSignupDeadline}</li>
					<li>• Planlægningsweekend: Tilmeldingsfrist {planningSignupDeadlineText}</li>
				</ul>
			</section>
		{:else}
			<!-- 1. Tilmelding til NyhedsNat -->
			<section class="card-dark rounded-2xl p-8 md:p-10 mb-10">
				<h2 class="text-2xl font-bold text-star-white mb-4">Tilmelding til NyhedsNat</h2>
				<p class="text-star-white/70 mb-4">
					Seniorer deltager enten som planlæggere eller som deltagere. Seniordeltagere tilmeldes her sammen med redaktioner.
				</p>
				<p class="text-gold-400 font-semibold mb-6">Tilmeldingsfrist: {nyhedsnatSignupDeadline}</p>

				<a
					href="/kontakt"
					class="inline-block px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-night-900 font-bold rounded-full glow-gold hover:scale-105 transition-all"
				>
					Tilmeld jeres redaktion
				</a>
			</section>

			<!-- 2. Tilmelding til planlægningsweekend -->
			<section class="card-dark rounded-2xl p-8 md:p-10 mb-12 {planningSignupOpen ? '' : 'border-red-400/40'}">
				<div class="flex items-start justify-between gap-4 mb-4">
					<h2 class="text-2xl font-bold text-star-white">Tilmelding til planlægningsweekenden for seniorer</h2>
					{#if !planningSignupOpen}
						<span class="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
							<span>🔒</span> Lukket
						</span>
					{/if}
				</div>

				<p class="text-star-white/70 mb-4">Planlægningsweekenden er for seniorer, der vil planlægge hændelser.</p>
				<p class="text-star-white/70 mb-6">Her deltager man i planlægningen og er med til at udvikle hændelser.</p>

				{#if planningSignupOpen}
					<p class="text-gold-400 font-semibold mb-6">Tilmeldingsfrist: {planningSignupDeadlineText}</p>
					<a
						href="/kontakt"
						class="inline-block px-8 py-4 border-2 border-gold-500/50 text-gold-400 font-bold rounded-full hover:bg-gold-500/10 hover:border-gold-400 transition-all"
					>
						Tilmeld dig planlægningsweekenden
					</a>
				{:else}
					<div class="rounded-xl border-2 border-red-400/60 bg-red-500/10 p-5">
						<p class="text-red-300 font-bold text-lg">Tilmeldingen til planlægningsweekenden er lukket.</p>
						<p class="text-red-200/80 text-sm mt-1">Kontakt udvalget, hvis du har spørgsmål.</p>
					</div>
				{/if}
			</section>

			<!-- Indbydelse -->
			<div class="text-center">
				<a
					href="/indbydelse"
					class="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors font-medium"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Download indbydelser til kredsen
				</a>
			</div>
		{/if}

	</div>
</div>
