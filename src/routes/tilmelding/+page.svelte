<svelte:head>
	<title>Tilmelding & indbydelse – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4." />
	<link rel="canonical" href="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:site_name" content="NyhedsNat" />
	<meta property="og:locale" content="da_DK" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:title" content="Tilmelding & indbydelse – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4." />
	<meta property="og:image" content="https://nyhedsnat.dk/images/logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Tilmelding & indbydelse – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4." />
	<meta name="twitter:image" content="https://nyhedsnat.dk/images/logo.png" />
</svelte:head>

<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';

	const signupOpen = true;
	const planningSignupOpen = true;
	const nyhedsnatSignupUrl = 'https://medlem.fdf.dk/event/id/7776/register';
	const planningSignupUrl = 'https://medlem.fdf.dk/event/id/8013/register';
	const signupOpensText = '1. juli 2026';
	const nyhedsnatSignupDeadline = '25. oktober 2026';
	const planningSignupDeadlineText = '20. september 2026';
</script>

<div class="min-h-screen px-4 py-12">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-star-white mb-6">
				<span class="text-gradient-gold">Tilmelding & indbydelse</span>
			</h1>
			<p class="text-xl text-star-white/60 max-w-2xl mx-auto">
				Download indbydelser og tilmeld jeres redaktion samlet.
			</p>
		</div>

		<section class="card-dark rounded-2xl p-8 md:p-10 mb-10">
			<h2 class="text-2xl font-bold text-star-white mb-4">Tilmelding til NyhedsNat</h2>
			<p class="text-star-white/70 mb-5">
				Seniorer deltager enten som planlæggere eller som deltagere. Seniordeltagere tilmeldes her sammen med redaktioner.
			</p>
			{#if signupOpen}
				<JoinButton href={nyhedsnatSignupUrl} className="mb-4">Tilmeld NyhedsNat</JoinButton>
			{:else}
				<p class="inline-flex items-center rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-2 text-gold-300 font-bold mb-4">
					Tilmeldingen åbner {signupOpensText}
				</p>
			{/if}
			<p class="text-star-white/65 mb-6">Tilmeldingsfrist: {nyhedsnatSignupDeadline}</p>

			<div class="border-t border-star-white/10 pt-6">
				<p class="text-sm font-semibold uppercase tracking-wide text-star-white/40 mb-3">Indbydelser</p>
				<div class="flex flex-wrap gap-3">
					<a href="/files/Indbydelse_svæb_væb.pdf" download class="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/10">
						<span aria-hidden="true">📄</span> Væbnere & seniorvæbnere (PDF)
					</a>
					<a href="/files/Indbydelse_senior.pdf" download class="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/10">
						<span aria-hidden="true">📄</span> Seniorer (PDF)
					</a>
				</div>
			</div>
		</section>

		<section class="card-dark rounded-2xl p-8 md:p-10 mb-12 {planningSignupOpen ? '' : 'border-red-400/40'}">
			<div class="flex items-start justify-between gap-4 mb-4">
				<h2 class="text-2xl font-bold text-star-white">Tilmelding til Arrangøruddannelse & planlægningsweekend for seniorer</h2>
				{#if !planningSignupOpen}
					<span class="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
						<span>🔒</span> Lukket
					</span>
				{/if}
			</div>

			<p class="text-star-white/70 mb-4">Arrangøruddannelse & planlægningsweekend for seniorer er for seniorer, der vil planlægge hændelser.</p>
			<p class="text-star-white/70 mb-6">Her deltager man i planlægningen og er med til at udvikle hændelser.</p>

			{#if planningSignupOpen}
				{#if signupOpen}
					<JoinButton href={planningSignupUrl} variant="secondary" className="mb-4">Tilmeld dig Arrangøruddannelse & planlægningsweekend for seniorer</JoinButton>
				{:else}
					<p class="inline-flex items-center rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-2 text-gold-300 font-bold mb-4">
						Tilmeldingen åbner {signupOpensText}
					</p>
				{/if}
				<p class="text-star-white/65 mb-6">Tilmeldingsfrist: {planningSignupDeadlineText}</p>

				<div class="border-t border-star-white/10 pt-6">
					<p class="text-sm font-semibold uppercase tracking-wide text-star-white/40 mb-3">Indbydelse</p>
					<a href="/files/Indbydelse_arrangør_planlægning.pdf" download class="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/10">
						<span aria-hidden="true">📄</span> Arrangøruddannelse & planlægningsweekend (PDF)
					</a>
				</div>
			{:else}
				<div class="rounded-xl border-2 border-red-400/60 bg-red-500/10 p-5">
					<p class="text-red-300 font-bold text-lg">Tilmeldingen til Arrangøruddannelse & planlægningsweekend for seniorer er lukket.</p>
					<p class="text-red-200/80 text-sm mt-1">Kontakt udvalget, hvis du har spørgsmål.</p>
				</div>
			{/if}
		</section>

	</div>
</div>
