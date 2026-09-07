<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';

	const demoUrl = 'https://demo.avismaskinen.dk';
	const kioskUrl = 'https://avismaskinen.dk';
</script>

<svelte:head>
	<title>Avismaskinen – NyhedsNat</title>
	<meta
		name="description"
		content="Avismaskinen er det digitale værktøj, redaktionerne bygger deres avis i til NyhedsNat. Se demoavisen og alle aviserne på avismaskinen.dk."
	/>
	<link rel="canonical" href="https://nyhedsnat.dk/redaktion/avismaskinen" />
	<!-- Open Graph -->
	<meta property="og:url" content="https://nyhedsnat.dk/redaktion/avismaskinen" />
	<meta property="og:title" content="Avismaskinen – NyhedsNat" />
	<meta
		property="og:description"
		content="Avismaskinen er det digitale værktøj, redaktionerne bygger deres avis i til NyhedsNat. Se demoavisen og alle aviserne på avismaskinen.dk."
	/>
	<!-- Twitter Card -->
	<meta name="twitter:title" content="Avismaskinen – NyhedsNat" />
	<meta
		name="twitter:description"
		content="Avismaskinen er det digitale værktøj, redaktionerne bygger deres avis i til NyhedsNat. Se demoavisen og alle aviserne på avismaskinen.dk."
	/>
</svelte:head>

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
				Hver redaktion har sin egen avis, som er oprettet på forhånd – inden NyhedsNat går i gang.
			</p>
			<p>
				Jeres avis har sin egen adresse på avismaskinen.dk, fx
				<span class="font-semibold text-gold-300">cykelbud.avismaskinen.dk</span>. Adressen får I
				udleveret, når I ankommer.
			</p>
		</div>
	</section>

	<section class="card-dark rounded-2xl border border-gold-500/20 p-6 md:p-8">
		<h2 class="mb-4 flex items-center gap-3 text-2xl font-bold text-star-white">
			<span class="text-3xl">🔑</span>
			Sådan logger I ind
		</h2>
		<ol class="space-y-4 text-star-white/75">
			<li class="flex gap-4">
				<span
					class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-sm font-bold text-gold-300"
					>1</span
				>
				<span>Gå til jeres avis' forside, fx cykelbud.avismaskinen.dk</span>
			</li>
			<li class="flex gap-4">
				<span
					class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-sm font-bold text-gold-300"
					>2</span
				>
				<span>Tryk på <span class="font-semibold text-star-white">"Log ind"</span> øverst på siden</span>
			</li>
			<li class="flex gap-4">
				<span
					class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-sm font-bold text-gold-300"
					>3</span
				>
				<span>Log ind med det brugernavn og den adgangskode, I fik udleveret ved ankomst</span>
			</li>
		</ol>
		<p class="mt-6 text-star-white/60">
			Derefter kan I redigere avisen direkte – lave forsiden, tilføje artikler og gøre avisen klar
			til aflevering.
		</p>
	</section>
</div>
