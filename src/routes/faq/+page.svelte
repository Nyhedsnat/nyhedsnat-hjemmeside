<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';

	type FaqItem = {
		question: string;
		answer: string;
		link?: { href: string; label: string };
	};

	const faqSections: { title: string; items: FaqItem[] }[] = [
		{
			title: 'Om arrangementet',
			items: [
				{
					question: 'Hvem planlægger?',
					answer: `Nyhedsnat planlægges og afvikles af et landsdelsudvalg, som står for selve arrangementet. Udvalget sætter rammerne og deltager aktivt i planlægningen.

Derudover arbejder vi på at samle en gruppe seniorer, som er med til at planlægge hændelser på forhånd. Planlægningen foregår sammen med udvalget, som faciliterer processen og sikrer overblik og sammenhæng. Det giver mulighed for at tage ansvar, tænke og prøve kræfter med planlægning i praksis. En slags lederuddannelse i forklædning.

De seniorer, der tilmelder sig og møder op på dagen, er med til at afvikle hændelser, få roller og skabe oplevelser for deltagerne. Alle bidrager, men på forskellige niveauer af ansvar.

Har du som senior lyst til at være med i planlægningen på forhånd, så hører vi meget gerne fra dig via info@nyhedsnat.dk`
				},

				{
					question: 'Hvad er konceptet i Nyhedsnat?',
					answer: `Nyhedsnat er en fælles leg, hvor deltagerne træder ind i en journalistisk verden.

Væbnere og seniorvæbnere er journalister, som rykker ud til hændelser, stiller spørgsmål og formidler, hvad der er sket. Seniorerne spiller roller og skaber de hændelser, som redaktionerne skal dække.

Det betyder, at hele arrangementet foregår som en levende fortælling, hvor deltagerne både oplever og skaber indhold undervejs.

Journalistikken er ikke et mål i sig selv, men en ramme, der giver legen retning og gør det muligt at arbejde sammen om en fælles opgave.`
				},
				{
					question: 'Er det rollespil, konkurrence eller noget helt tredje?',
					answer: `Det er en blanding.

Der er elementer af rollespil, fordi seniorerne spiller roller, og deltagerne indgår i en fælles fortælling.

Der er elementer af konkurrence, fordi redaktionerne laver aviser og kan vinde priser.

Men først og fremmest er det en leg, hvor det vigtigste er at deltage, have det sjovt og lege med.`
				},
				{
					question: 'Er hændelser virkelige?',
					answer: `Nej. Alle hændelser er fiktive, men ofte inspireret af aktuelle begivenheder.

Det gør dem genkendelige og sjove at arbejde med, samtidig med at de er tydeligt adskilt fra virkeligheden.`
				}
			]
		},
		{
			title: 'For seniorer',
			items: [
				{
					question: 'Hvordan deltager man som senior?',
					answer: `Alle hændelser planlægges af seniorer.
Som senior kan man enten være med til planlægningen eller udelukkende deltage i NyhedsNat på selve dagen.

Det vil sige, at der er to måder at være senior på:

Planlægger
Som planlægger deltager man i Arrangøruddannelse & planlægningsweekend for seniorer og er med til at udvikle hændelser.
Arrangøruddannelse & planlægningsweekend for seniorer er både et kursus og en workshop, hvor vi arbejder med idéer, roller og afvikling.
Tilmeldingsfristen er en uge før Arrangøruddannelse & planlægningsweekend for seniorer. Se mere under tilmelding.

Deltager
Som seniordeltager får man på dagen tildelt en rolle og indgår i afviklingen af hændelserne.
Tilmelding sker med samme frist som væbnerne.
Seniordeltagere kan blive bedt om selv at medbringe kostume.`
				},
				{
					question: 'Hvad laver seniorerne egentlig?',
					answer: `Seniorerne spiller de roller og laver de hændelser, som redaktionerne skal dække.

Nogle seniorer er udvalgt på forhånd til at planlægge hændelser. Andre seniorer får roller tildelt på dagen og indgår i hændelsesafviklingen.

Seniorerne leger andre mennesker – og væbnere og seniorvæbnere leger journalister.`
				},
				{
					question:
						'Skal seniorer tilmelde sig både selve arrangementet og planlægningsweekenden – eller dækker planlægningsweekenden begge dele?',
					answer: `Man skal tilmelde sig begge dele. Arrangøruddannelse & planlægningsweekend for seniorer og selve Nyhedsnat er to separate tilmeldinger.

Prisen for planlægningsweekenden er høj, fordi det både er et kursus og en workshop.

I skal desuden vælge, om kredsen betaler, eller om senioren selv betaler. Hvis kredsen betaler, kan I søge kommunen om "kursustilskud", ligesom man i nogle kommuner gør ved andre kurser – og på den måde få dækket det meste af beløbet.`
				},
				{
					question: 'Skal der være en leder med til planlægningsweekenden?',
					answer: `Nej. Seniorerne kan sagtens deltage i Arrangøruddannelse & planlægningsweekend for seniorer uden en leder.

Ledere er selvfølgelig velkomne, hvis I gerne vil have en med, men det er ikke et krav.`
				}
			]
		},
		{
			title: 'For væbnere & seniorvæbnere',
			items: [
				{
					question: 'Hvordan deltager man som væbner eller seniorvæbner?',
					answer: `Væbnere og seniorvæbnere deltager i Nyhedsnat som en del af en redaktion.

En redaktion:
• Består af 4-7 deltagere
• Har minimum én leder
• Har base i fælles hal sammen med de andre redaktioner

Som redaktion oplever man hændelser, stiller spørgsmål og arbejder sammen om at lave en avis frem mod deadline næste morgen. Kun halvdelen af redaktionen er ude ad gangen, mens resten arbejder videre hjemme på basen.

Kredse kan slå sig sammen, hvis man ikke selv har deltagere nok til en hel redaktion.`
				},
				{
					question: 'Hvad mener vi med en avis?',
					answer: `Ikke en tung avis med lange artikler.

Aviserne er digitale og består af korte, klikbare nyheder – fyldt med horoskoper, quizzer, billeder, videoer og andet kreativt indhold.

Det handler ikke om tung journalistik, men om at lave noget, det er sjovt at klikke sig igennem.

Se et eksempel på en avis her:`,
					link: { href: 'https://demo.avismaskinen.dk/', label: 'demo.avismaskinen.dk' }
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
					question: 'Skal deltagerne være gode til IT?',
					answer: `Nej. De fleste væbnere og seniorvæbnere arbejder allerede med computer i skolen.

Derudover sørger udvalget for, at der er IT-kyndige frivillige til stede hele natten, som kan hjælpe, hvis der opstår tekniske problemer.`
				},
				{
					question: 'Kan mine væbnere finde ud af det her?',
					answer: `Ja. Erfaringen er, at væbnere hurtigt finder ind i legen.

Rammerne er tydelige, opgaverne er konkrete, og der er voksne og seniorer omkring dem hele tiden. Det er ikke en konkurrence i at være dygtigst – men i at være kreativ og have det sjovt sammen.`
				}
			]
		},
		{
			title: 'For ledere',
			items: [
				{
					question: `Skal man være vågen hele natten?`,
					answer: `Redaktionerne er kun ude til hændelser i perioder. Resten af tiden er man på basen, hvor der er ro til at skrive avis og arbejde med fotos og reels.
						
Man skiftes i redaktionen, så ikke alle er ude samtidig, og der er lagt pauser ind i programmet. Det betyder, at man kan nå at skrive sin avis mellem hændelser.

Hvornår man går i seng, er op til den enkelte redaktion (læs: mest lederne).`
				},
				{
					question: 'Hvad skal vi selv lægge oveni prisen?',
					answer: `Indbydelsen er en skabelon, hvor I selv sætter prisen og et mødested.

Deltagergebyret er 125 kr. Oveni lægger I kredsens egne udgifter:

• Kørsel til og fra arrangementet
• Kørsel under arrangementet – forvent 50-100 km pr. redaktion
• Aftensmad, hvis I spiser sammen i kredsen. I kan selv vælge, om I spiser inden I kører hjemmefra, eller når I kommer hjem igen

Derfor er det lettest at tilmelde samlet i kredsen, så I kan lægge det hele sammen til én pris.`
				},
				{
					question: 'Skal lederne være "på" hele natten?',
					answer: `Nej. Arrangementet er tilrettelagt, så lederne ikke skal være aktive hele tiden.

Kortagekørsel og praktisk koordinering styres centralt, og ledere kører kun ca. til hver anden hændelse. Som leder er der god tid til både at være en del af redaktionen, drikke kaffe og tage pauser.

Så lederne har god tid til andre ting end at sidde bag et rat.`
				}
			]
		},
		{
			title: 'Praktik og logistik',
			items: [
				{
					question: 'Hvad koster det at deltage?',
					answer: `Det koster 125 kr. pr. deltager – både for væbnere, seniorvæbnere og seniorer. Tilmelding foregår kredsvis.

I prisen indgår natmad fra fredag til lørdag og morgenmad lørdag morgen.

Oveni kommer kredsens egne udgifter til kørsel og eventuel fællesspisning. Dem sætter kredsen selv ind i indbydelsen.`
				},
				{
					question: 'Hvordan foregår transporten til hændelser?',
					answer: `Transporten foregår via et fælles kortagekørselssystem.

• To redaktioner kører sammen
• Kun halvdelen af redaktionen kører ud ad gangen
• Ledere kører kun ca. til hver anden hændelse
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
			]
		}
	];

	let openKey = $state<string | null>(null);

	function toggle(key: string) {
		openKey = openKey === key ? null : key;
	}
</script>

<svelte:head>
	<title>FAQ – NyhedsNat i Landsdel 4</title>
	<meta
		name="description"
		content="Svar på de mest stillede spørgsmål om NyhedsNat – hvem planlægger, hvordan man deltager, hvad man skal medbringe og mere."
	/>
	<link rel="canonical" href="https://nyhedsnat.dk/faq" />
	<meta property="og:url" content="https://nyhedsnat.dk/faq" />
	<meta property="og:title" content="FAQ – NyhedsNat i Landsdel 4" />
	<meta
		property="og:description"
		content="Svar på de mest stillede spørgsmål om NyhedsNat – hvem planlægger, hvordan man deltager, hvad man skal medbringe og mere."
	/>
	<meta name="twitter:title" content="FAQ – NyhedsNat i Landsdel 4" />
	<meta
		name="twitter:description"
		content="Svar på de mest stillede spørgsmål om NyhedsNat – hvem planlægger, hvordan man deltager, hvad man skal medbringe og mere."
	/>
</svelte:head>

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
		<div class="space-y-10">
			{#each faqSections as section, sectionIndex}
				<section>
					<h2 class="mb-4 text-2xl font-bold text-gold-400">{section.title}</h2>
					<div class="space-y-4">
						{#each section.items as faq, index}
							{@const key = `${sectionIndex}-${index}`}
							<div class="card-dark overflow-hidden rounded-2xl">
								<button
									onclick={() => toggle(key)}
									class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-night-700/30"
								>
									<h3 class="pr-4 text-lg font-medium text-star-white">{faq.question}</h3>
									<div
										class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 transition-transform duration-300"
										class:rotate-180={openKey === key}
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

								{#if openKey === key}
									<div class="animate-fadeIn px-6 pb-6">
										<div class="border-t border-gold-500/20 pt-4">
											<p class="leading-relaxed whitespace-pre-line text-star-white/70">
												{faq.answer}
											</p>
											{#if faq.link}
												<a
													href={faq.link.href}
													target="_blank"
													rel="noopener noreferrer"
													class="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-500/10"
												>
													<span aria-hidden="true">🗞️</span>
													{faq.link.label}
												</a>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>

		<!-- Contact CTA -->
		<div class="card-dark mt-16 rounded-2xl p-8 text-center">
			<h2 class="mb-4 text-2xl font-bold text-star-white">Har du flere spørgsmål?</h2>
			<p class="mb-6 text-star-white/60">Vi er altid klar til at hjælpe.</p>
			<JoinButton href="/kontakt">Kontakt os</JoinButton>
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
