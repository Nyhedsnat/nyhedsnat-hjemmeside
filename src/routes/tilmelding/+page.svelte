<svelte:head>
	<title>Tilmelding & indbydelse – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4 den 12.–13. november 2027." />
	<link rel="canonical" href="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:url" content="https://nyhedsnat.dk/tilmelding" />
	<meta property="og:title" content="Tilmelding & indbydelse – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4 den 12.–13. november 2027." />
	<meta name="twitter:title" content="Tilmelding & indbydelse – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Download indbydelser og tilmeld jeres redaktion til NyhedsNat i Landsdel 4 den 12.–13. november 2027." />
</svelte:head>

<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';
	import { planningState, type SignupState } from '$lib';

	const nyhedsnatState = 'upcoming' as SignupState;
	const nyhedsnatSignupUrl = 'https://medlem.fdf.dk/event/id/7776/register';
	const planningSignupUrl = 'https://medlem.fdf.dk/event/id/8013/register';
	// ponytail: null = dato ikke kendt endnu → generisk tekst, frist skjules
	const signupOpensText: string | null = null;
	const nyhedsnatSignupDeadline: string | null = null;
	const planningSignupDeadlineText: string | null = null;
	const nyhedsnatLocation = 'Skole annonceres i uge 40';
	const planningLocation = 'Annonceres senere';
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

		<section class="card-dark rounded-2xl p-8 md:p-10 mb-10 {nyhedsnatState === 'closed' ? 'border-red-400/40' : ''} {nyhedsnatState === 'held' ? 'opacity-60 grayscale' : ''}">
			<div class="flex flex-col-reverse items-start gap-3 mb-4 sm:flex-row sm:justify-between sm:gap-4">
				<h2 class="min-w-0 text-2xl font-bold text-star-white hyphens-auto">Tilmelding til NyhedsNat</h2>
				{#if nyhedsnatState === 'closed'}
					<span class="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
						<span>🔒</span> Tilmeldingen er lukket
					</span>
				{:else if nyhedsnatState === 'held'}
					<span class="inline-flex shrink-0 items-center rounded-full border border-star-white/20 bg-star-white/5 px-3 py-1 text-sm font-semibold text-star-white/60">
						Afholdt
					</span>
				{/if}
			</div>
			<p class="text-star-white/70 mb-5">
				<span class="font-semibold text-star-white">Sted: {nyhedsnatLocation}.</span>
				Datoen er 12.–13. november 2027.
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
				<div class="rounded-xl border-2 border-star-white/20 bg-star-white/5 p-5">
					<p class="text-star-white/80 font-bold text-lg">NyhedsNat er afholdt for i år.</p>
					<p class="text-star-white/70 text-sm mt-1">Ny dato meldes ud snarest.</p>
				</div>
			{:else}
				{#if nyhedsnatState === 'open'}
					<JoinButton href={nyhedsnatSignupUrl} className="mb-4">Tilmeld NyhedsNat</JoinButton>
				{:else}
					<p class="inline-flex items-center rounded-full border border-gold-400/40 bg-gold-500/10 px-4 py-2 text-gold-300 font-bold mb-4">
						{signupOpensText ? `Tilmeldingen åbner ${signupOpensText}` : 'Tilmeldingen er ikke åben endnu'}
					</p>
				{/if}
				{#if nyhedsnatSignupDeadline}<p class="text-star-white/65 mb-6">Tilmeldingsfrist: {nyhedsnatSignupDeadline}</p>{/if}
			{/if}

			<div class="border-t{nyhedsnatState === 'held' || nyhedsnatState === 'upcoming' ? ' hidden' : ''} border-star-white/10 pt-6">
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
					ind, inden I sender den videre. Selve NyhedsNat foregår på en skole, som annonceres i uge 40.
				</p>
			</div>
		</section>

		<section class="card-dark rounded-2xl p-8 md:p-10 mb-12 {planningState === 'closed' ? 'border-red-400/40' : ''} {planningState === 'held' ? 'opacity-60 grayscale' : ''}">
			<div class="flex flex-col-reverse items-start gap-3 mb-4 sm:flex-row sm:justify-between sm:gap-4">
				<h2 class="min-w-0 text-2xl font-bold text-star-white hyphens-auto">Tilmelding til Arrangøruddannelse & planlægningsweekend for seniorer</h2>
				{#if planningState === 'closed'}
					<span class="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
						<span>🔒</span> Tilmeldingen er lukket
					</span>
				{:else if planningState === 'held'}
					<span class="inline-flex shrink-0 items-center rounded-full border border-star-white/20 bg-star-white/5 px-3 py-1 text-sm font-semibold text-star-white/60">
						Afholdt
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
						{signupOpensText ? `Tilmeldingen åbner ${signupOpensText}` : 'Tilmeldingen er ikke åben endnu'}
					</p>
				{/if}
				{#if planningSignupDeadlineText}<p class="text-star-white/65 mb-6">Tilmeldingsfrist: {planningSignupDeadlineText}</p>{/if}

				<div class="border-t{planningState === 'upcoming' ? ' hidden' : ''} border-star-white/10 pt-6">
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
				<div class="rounded-xl border-2 border-star-white/20 bg-star-white/5 p-5">
					<p class="text-star-white/80 font-bold text-lg">Arrangøruddannelse & planlægningsweekend for seniorer er afholdt for i år.</p>
					<p class="text-star-white/70 text-sm mt-1">Ny dato meldes ud snarest.</p>
				</div>
			{/if}
		</section>

	</div>
</div>
