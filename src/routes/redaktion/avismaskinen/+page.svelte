<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';

	const demoUrl = 'https://demo.avismaskinen.dk';
	const kioskUrl = 'https://avismaskinen.dk';
	const description =
		'Avismaskinen er det digitale værktøj, redaktionerne bygger deres avis i til NyhedsNat. Sådan opretter I jeres avis ved skranken og logger ind med holdkoden.';
</script>

<svelte:head>
	<title>Avismaskinen – NyhedsNat</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="https://nyhedsnat.dk/redaktion/avismaskinen" />
	<!-- Open Graph -->
	<meta property="og:url" content="https://nyhedsnat.dk/redaktion/avismaskinen" />
	<meta property="og:title" content="Avismaskinen – NyhedsNat" />
	<meta property="og:description" content={description} />
	<!-- Twitter Card -->
	<meta name="twitter:title" content="Avismaskinen – NyhedsNat" />
	<meta name="twitter:description" content={description} />
</svelte:head>

{#snippet step(n: number)}
	<span
		class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-sm font-bold text-gold-300"
		>{n}</span
	>
{/snippet}

<div class="space-y-8">
	<section class="space-y-4 text-star-white/75">
		<p>
			Avismaskinen er det værktøj, I bygger jeres avis i. Avisen er digital, så den er lavet til at
			blive læst på en telefon – ikke printet ud.
		</p>
		<p>
			En avis består af korte, klikbare nyheder med billeder og video. Der er også plads til alt det
			andet: horoskoper, quizzer, afstemninger, opskrifter, anmeldelser og hvad I ellers finder på.
			Det behøver ikke være tung journalistik – det skal være sjovt at klikke sig igennem.
		</p>

		<div class="flex flex-wrap gap-3">
			<JoinButton href={demoUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
				Se demoavisen
			</JoinButton>
			<JoinButton href={kioskUrl} variant="secondary" target="_blank" rel="noopener noreferrer">
				Alle aviserne på Avismaskinen
			</JoinButton>
		</div>
	</section>

	<section class="card-dark rounded-2xl border border-gold-500/20 p-6 md:p-8">
		<h2 class="mb-4 flex items-center gap-3 text-2xl font-bold text-star-white">
			<span class="text-3xl">📰</span>
			Jeres egen avis
		</h2>
		<div class="space-y-4 text-star-white/75">
			<p>
				Når I kommer, går I op til skranken og skriver jeres redaktion ind. Så opretter I jeres avis
				på stedet, og der står en voksen klar til at hjælpe.
			</p>
			<p>
				Jeres avis får sin egen adresse, fx
				<span class="font-semibold text-gold-300">cykelbud.avismaskinen.dk</span>. Ved skranken får
				I også en QR-kode, som fører lige til login.
			</p>
		</div>
	</section>

	<section class="card-dark rounded-2xl border border-gold-500/20 p-6 md:p-8">
		<h2 class="mb-4 flex items-center gap-3 text-2xl font-bold text-star-white">
			<span class="text-3xl">🔑</span>
			Sådan logger I ind
		</h2>
		<p class="mb-6 text-star-white/75">
			I skal ikke huske et brugernavn eller en adgangskode. Hele holdet deler én
			<span class="font-semibold text-star-white">holdkode</span> – fire bogstaver og to tal, fx
			<span class="font-semibold text-gold-300">HEST-42</span>. Jeres leder får koden på SMS, så
			snart avisen er oprettet.
		</p>
		<ol class="space-y-4 text-star-white/75">
			<li class="flex gap-4">
				{@render step(1)}
				<span
					>Gå til <a
						href={kioskUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold text-gold-300 underline-offset-2 hover:underline">avismaskinen.dk</a
					>, og tryk på jeres avis.</span
				>
			</li>
			<li class="flex gap-4">
				{@render step(2)}
				<span
					>Tryk på <span class="font-semibold text-star-white">"Log ind"</span> øverst til
					venstre.</span
				>
			</li>
			<li class="flex gap-4">
				{@render step(3)}
				<span>Skriv holdkoden. Jeres leder har den.</span>
			</li>
			<li class="flex gap-4">
				{@render step(4)}
				<span>Tryk på dit eget navn.</span>
			</li>
			<li class="flex gap-4">
				{@render step(5)}
				<span
					>Tryk på <span class="font-semibold text-star-white">"Gå til redaktionen"</span>.</span
				>
			</li>
		</ol>
		<div class="mt-6 space-y-4 text-star-white/60">
			<p>
				Har I QR-koden fra skranken, kan I også bare scanne den. Så kommer I lige til login.
			</p>
			<p>
				I logger ind én gang på hver telefon eller computer, og så holder det hele NyhedsNat. Deler
				I en computer, husker den holdkoden. Den næste skal bare trykke på sit eget navn.
			</p>
			<p>
				Har I glemt koden? Spørg jeres leder eller en fra holdet. Ved skranken kan de også sende den
				igen.
			</p>
			<p>
				Når I er logget ind, redigerer I avisen direkte – laver forsiden, skriver artikler, lægger
				billeder og video ind og gør avisen klar til aflevering.
			</p>
		</div>
	</section>
</div>
