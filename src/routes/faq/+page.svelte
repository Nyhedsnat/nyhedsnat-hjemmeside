<svelte:head>
	<title>FAQ – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Svar på de mest stillede spørgsmål om NyhedsNat – hvem planlægger, hvordan man deltager, hvad man skal medbringe og mere." />
	<link rel="canonical" href="https://nyhedsnat.dk/faq" />
	<meta property="og:site_name" content="NyhedsNat" />
	<meta property="og:locale" content="da_DK" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nyhedsnat.dk/faq" />
	<meta property="og:title" content="FAQ – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Svar på de mest stillede spørgsmål om NyhedsNat – hvem planlægger, hvordan man deltager, hvad man skal medbringe og mere." />
	<meta property="og:image" content="https://nyhedsnat.dk/images/logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="FAQ – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Svar på de mest stillede spørgsmål om NyhedsNat – hvem planlægger, hvordan man deltager, hvad man skal medbringe og mere." />
	<meta name="twitter:image" content="https://nyhedsnat.dk/images/logo.png" />
</svelte:head>

<script lang="ts">
	const faqs = [
		{
			question: 'Hvem planlægger?',
			answer: `Nyhedsnat planlægges og afvikles af et landsdelsudvalg, som står for selve arrangementet. Udvalget sætter rammerne og deltager aktivt i planlægningen.

Derudover arbejder vi på at samle en gruppe seniorer, som er med til at planlægge events på forhånd. Planlægningen foregår sammen med udvalget, som faciliterer processen og sikrer overblik og sammenhæng. Det giver mulighed for at tage ansvar, tænke og prøve kræfter med planlægning i praksis. En slags lederuddannelse i forklædning.

De seniorer, der tilmelder sig og møder op på dagen, er med til at afvikle events, få roller og skabe oplevelser for deltagerne. Alle bidrager, men på forskellige niveauer af ansvar.

Har du som senior lyst til at være med i planlægningen på forhånd, så hører vi meget gerne fra dig via info@nyhedsnat.dk`
		},
		{
			question: 'Hvordan deltager man som væbner eller seniorvæbner?',
			answer: `Væbnere og seniorvæbnere deltager i Nyhedsnat som en del af en redaktion.

En redaktion:
• Består af 4-7 deltagere
• Har minimum én leder
• Har base i fælles hal sammen med de andre redaktioner

Som redaktion oplever man events, stiller spørgsmål og arbejder sammen om at lave en avis frem mod deadline næste morgen. Kun halvdelen af redaktionen er ude ad gangen, mens resten arbejder videre hjemme på basen.

Kredse kan slå sig sammen, hvis man ikke selv har deltagere nok til en hel redaktion.`
		},
		{
			question: 'Hvordan deltager man som senior?',
			answer: `Seniorer deltager i Nyhedsnat ved at skabe og spille de events, som redaktionerne skal opleve og dække.

Nogle seniorer udvælges på forhånd til at planlægge events. Andre seniorer får på dagen tildelt roller og indgår i afviklingen.

Som senior:
• Spiller man forskellige roller
• Er man med til at skabe oplevelser for de yngre deltagere

Det er samtidig en form for basal lederuddannelse i forklædning. Seniorerne planlægger, afvikler, improviserer og tager ansvar, mens de leger sig igennem det hele.

Seniorerne har typisk base i et kredshus i nærheden og indgår i et fælles team, hvor roller og opgaver fordeles undervejs.`
		},
		{
			question: 'Skal man være god til at skrive for at deltage?',
			answer: `Nej. Aviserne kan bestå af mange forskellige typer indhold.

Det kan fx være:
• Billeder
• Korte tekster
• Kryds og tværs
• Tegninger
• Sjove indslag
• Video

Der gives også priser for bedste pressefoto og bedste reel, så der er mange måder at bidrage på.`
		},
		{
			question: `Skal man være vågen hele natten?`,
			answer: `Redaktionerne er kun ude til events i perioder. Resten af tiden er man på basen, hvor der er ro til at skrive avis og arbejde med fotos og reels.
					
Man skiftes i redaktionen, så ikke alle er ude samtidig, og der er lagt pauser ind i programmet. Det betyder, at man kan nå at skrive sin avis mellem events.

Hvornår man går i seng, er op til den enkelte redaktion (læs: mest lederne).`
		},
		{
			question: 'Skal lederne være "på" hele natten?',
			answer: `Nej. Arrangementet er tilrettelagt, så lederne ikke skal være aktive hele tiden.

Kortagekørsel og praktisk koordinering styres centralt. Som leder er der god tid til både at være en del af redaktionen, drikke kaffe og tage pauser.`
		},
		{
			question: 'Skal deltagerne være gode til IT?',
			answer: `Nej. De fleste væbnere og seniorvæbnere arbejder allerede med computer i skolen.

Derudover sørger udvalget for, at der er IT-kyndige frivillige til stede hele natten, som kan hjælpe, hvis der opstår tekniske problemer.`
		},
		{
			question: 'Kan mine væbnere finde ud af det her?',
			answer: `Ja. Erfaringen er, at væbnere hurtigt finder ind i legen.

Rammerne er tydelige, opgaverne er konkrete, og der er voksne og seniorer omkring dem hele tiden. Det er ikke en konkurrence i at være dygtigst – men i at være kreativ og have det sjovt sammen.`
		},
		{
			question: 'Hvad laver seniorerne egentlig?',
			answer: `Seniorerne spiller de roller og laver de events, som redaktionerne skal dække.

Nogle seniorer er udvalgt på forhånd til at planlægge events. Andre seniorer får roller tildelt på dagen og indgår i eventafviklingen.

Seniorerne leger andre mennesker – og væbnere og seniorvæbnere leger journalister.`
		},
		{
			question: 'Er events virkelige?',
			answer: `Nej. Alle events er fiktive, men ofte inspireret af aktuelle begivenheder.

Det gør dem genkendelige og sjove at arbejde med, samtidig med at de er tydeligt adskilt fra virkeligheden.`
		},
		{
			question: 'Hvordan foregår transporten til events?',
			answer: `Transporten foregår via et fælles kortagekørselssystem.

• To redaktioner kører sammen
• Kun halvdelen af redaktionen kører ud ad gangen
• Arrangørerne står for koordineringen`
		},
		{
			question: 'Hvad hvis noget går galt teknisk?',
			answer: `Udvalget har sørget for, at der er IT-kyndige frivillige til stede hele natten, som kan hjælpe med:

• Computere
• Video
• Links
• Uploads`
		}
	];

	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<div class="min-h-screen px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Page Header -->
		<div class="mb-16 text-center">
			<h1 class="mb-6 text-4xl font-bold text-star-white md:text-5xl lg:text-6xl">
				<span class="text-gradient-gold">Ofte stillede spørgsmål</span>
			</h1>
			<p class="mx-auto max-w-2xl text-xl text-star-white/60">
				Find svar på de mest almindelige spørgsmål om Nyhedsnat
			</p>
		</div>

		<!-- FAQ Accordion -->
		<div class="space-y-4">
			{#each faqs as faq, index}
				<div class="card-dark overflow-hidden rounded-2xl">
					<button
						onclick={() => toggle(index)}
						class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-night-700/30"
					>
						<h3 class="pr-4 text-lg font-medium text-star-white">{faq.question}</h3>
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 transition-transform duration-300"
							class:rotate-180={openIndex === index}
						>
							<svg
								class="h-4 w-4 text-gold-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</button>

					{#if openIndex === index}
						<div class="animate-fadeIn px-6 pb-6">
							<div class="border-t border-gold-500/20 pt-4">
								<p class="leading-relaxed whitespace-pre-line text-star-white/70">{faq.answer}</p>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Contact CTA -->
		<div class="card-dark mt-16 rounded-2xl p-8 text-center">
			<h2 class="mb-4 text-2xl font-bold text-star-white">Har du flere spørgsmål?</h2>
			<p class="mb-6 text-star-white/60">Vi er altid klar til at hjælpe.</p>
			<a
				href="/kontakt"
				class="glow-gold inline-block rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-4 font-bold text-night-900 transition-all hover:scale-105"
			>
				Kontakt os
			</a>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out;
	}
</style>
