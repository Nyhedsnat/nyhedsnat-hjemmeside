<svelte:head>
	<title>Tilmelding & indbydelse – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4 på Beder Skole, Skoleparken 6, 8330 Beder, den 6.–7. november 2026." />
	<link rel="canonical" href="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:url" content="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:title" content="Tilmelding & indbydelse – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4 på Beder Skole, Skoleparken 6, 8330 Beder, den 6.–7. november 2026." />
	<meta name="twitter:title" content="Tilmelding & indbydelse – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4 på Beder Skole, Skoleparken 6, 8330 Beder, den 6.–7. november 2026." />
</svelte:head>

<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';
	import { planningState, type SignupState } from '$lib';

	const nyhedsnatState = 'open' as SignupState;
	const nyhedsnatSignupUrl = 'https://medlem.fdf.dk/event/id/7776/register';
	const planningSignupUrl = 'https://medlem.fdf.dk/event/id/8013/register';
	const signupOpensText = '1. juli 2026';
	const nyhedsnatSignupDeadline = '25. oktober 2026';
	const planningSignupDeadlineText = '20. september 2026';
	const nyhedsnatLocation = 'Beder Skole, Skoleparken 6, 8330 Beder';
	const planningLocation = 'Damtoften 20, 8260 Viby J';
	const pricePerParticipant = '125 kr.';
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

		<section class="card-dark rounded-2xl p-8 md:p-10 mb-10 {nyhedsnatState === 'closed' ? 'border-red-400/40' : ''}">
			<div class="flex items-start justify-between gap-4 mb-4">
				<h2 class="text-2xl font-bold text-star-white">Tilmelding til NyhedsNat</h2>
				{#if nyhedsnatState === 'closed'}
					<span class="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
						<span>🔒</span> Tilmeldingen er lukket
					</span>
				{:else if nyhedsnatState === 'held'}
					<span class="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-3 py-1 text-sm font-semibold text-gold-300">
						<span>✅</span> Afholdt
					</span>
				{/if}
			</div>
			<p class="text-star-white/70 mb-5">
				<span class="font-semibold text-star-white">Sted: {nyhedsnatLocation}.</span>
				Datoen er 6.–7. november 2026.
			</p>
			<p class="text-star-white/70 mb-5">
				Seniorer deltager enten som planlæggere eller som seniordeltagere. Seniordeltagere får en rolle på dagen og er med til at afvikle hændelserne. De tilmeldes her sammen med redaktionerne.
			</p>
			<p class="text-star-white/70 mb-5">
				<span class="font-semibold text-star-white">Pris: {pricePerParticipant} pr. deltager.</span>
				Tilmelding foregår kredsvis, og I kan tilmelde ad så mange omgange, I har lyst til.
			</p>
			<p class="text-star-white/70 mb-5">
				I prisen indgår natmad fra fredag til lørdag og morgenmad lørdag morgen.
			</p>
			{#if nyhedsnatState === 'closed'}
				<div class="rounded-xl border-2 border-red-400/60 bg-red-500/10 p-5 mb-6">
					<p class="text-red-300 font-bold text-lg">Tilmeldingen til NyhedsNat er lukket.</p>
					<p class="text-red-200/80 text-sm mt-1">Kontakt udvalget, hvis du har spørgsmål.</p>
				</div>
			{:else if nyhedsnatState === 'held'}
				<div class="rounded-xl border-2 border-gold-400/50 bg-gold-500/10 p-5">
					<p class="text-gold-300 font-bold text-lg">NyhedsNat er afholdt for i år.</p>
					<p class="text-star-white/70 text-sm mt-1">Ny dato meldes ud snarest.</p>
				</div>
			{:else}
				{#if nyhedsnatState === 'open'}
					<JoinButton href={nyhedsnatSignupUrl} className="mb-4">Tilmeld NyhedsNat</JoinButton>
				{:else}
					<p class="inline-flex items-center rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-2 text-gold-300 font-bold mb-4">
						Tilmeldingen åbner {signupOpensText}
					</p>
				{/if}
				<p class="text-star-white/65 mb-6">Tilmeldingsfrist: {nyhedsnatSignupDeadline}</p>
			{/if}

			<div class="border-t{nyhedsnatState === 'held' ? ' hidden' : ''} border-star-white/10 pt-6">
				<p class="text-sm font-semibold uppercase tracking-wide text-star-white/40 mb-3">Indbydelser</p>
				<div class="flex flex-wrap gap-3">
					<a href="/files/Indbydelse_svæb_væb.pdf" download class="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/10">
						<span aria-hidden="true">📄</span> Væbnere & seniorvæbnere (PDF)
					</a>
					<a href="/files/Indbydelse_senior.pdf" download class="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/10">
						<span aria-hidden="true">📄</span> Seniorer (PDF)
					</a>
				</div>
				<p class="mt-4 text-sm text-star-white/50">
					Indbydelsen er en skabelon. I skal selv skrive jeres samlede pris og et mødested i kredsen
					ind, inden I sender den videre. Selve NyhedsNat foregår på Beder Skole, Skoleparken 6, 8330
					Beder.
				</p>
			</div>
		</section>

		<section class="card-dark rounded-2xl p-8 md:p-10 mb-12 {planningState === 'closed' ? 'border-red-400/40' : ''}">
			<div class="flex items-start justify-between gap-4 mb-4">
				<h2 class="text-2xl font-bold text-star-white">Tilmelding til Arrangøruddannelse & planlægningsweekend for seniorer</h2>
				{#if planningState === 'closed'}
					<span class="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
						<span>🔒</span> Tilmeldingen er lukket
					</span>
				{:else if planningState === 'held'}
					<span class="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/10 px-3 py-1 text-sm font-semibold text-gold-300">
						<span>✅</span> Afholdt
					</span>
				{/if}
			</div>

			<p class="text-star-white/70 mb-4">Arrangøruddannelse & planlægningsweekend for seniorer er for seniorer, der vil planlægge hændelser.</p>
			<p class="text-star-white/70 mb-4">Her deltager man i planlægningen og er med til at udvikle hændelser.</p>
			<p class="text-star-white/65 mb-6">Sted: {planningLocation}</p>

			{#if planningState === 'upcoming' || planningState === 'open'}
				{#if planningState === 'open'}
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
			{:else if planningState === 'closed'}
				<div class="rounded-xl border-2 border-red-400/60 bg-red-500/10 p-5">
					<p class="text-red-300 font-bold text-lg">Tilmeldingen til Arrangøruddannelse & planlægningsweekend for seniorer er lukket.</p>
					<p class="text-red-200/80 text-sm mt-1">Kontakt udvalget, hvis du har spørgsmål.</p>
				</div>
			{:else}
				<div class="rounded-xl border-2 border-gold-400/50 bg-gold-500/10 p-5">
					<p class="text-gold-300 font-bold text-lg">Arrangøruddannelse & planlægningsweekend for seniorer er afholdt for i år.</p>
					<p class="text-star-white/70 text-sm mt-1">Ny dato meldes ud snarest.</p>
				</div>
			{/if}
		</section>

	</div>
</div>
