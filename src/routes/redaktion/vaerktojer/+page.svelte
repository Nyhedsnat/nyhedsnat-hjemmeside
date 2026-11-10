<svelte:head>
	<title>Anbefalede værktøjer - NyhedsNat</title>
	<meta
		name="description"
		content="Anbefalede værktøjer til jeres avis under NyhedsNat - billedredigering, layout, logo og video. I er frie i valget; kravet er blot, at avisen laves i Avismaskinen."
	/>
	<link rel="canonical" href="https://nyhedsnat.dk/redaktion/vaerktojer" />
	<!-- Open Graph -->
	<meta property="og:url" content="https://nyhedsnat.dk/redaktion/vaerktojer" />
	<meta property="og:title" content="Anbefalede værktøjer - NyhedsNat" />
	<meta
		property="og:description"
		content="Anbefalede værktøjer til jeres avis under NyhedsNat - billedredigering, layout, logo og video. I er frie i valget; kravet er blot, at avisen laves i Avismaskinen."
	/>
	<!-- Twitter Card -->
	<meta name="twitter:title" content="Anbefalede værktøjer - NyhedsNat" />
	<meta
		name="twitter:description"
		content="Anbefalede værktøjer til jeres avis under NyhedsNat - billedredigering, layout, logo og video. I er frie i valget; kravet er blot, at avisen laves i Avismaskinen."
	/>
</svelte:head>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	let uvrGuide: HTMLDialogElement;
</script>

<div class="space-y-10 text-star-white/80">
	<section class="space-y-4">
		<h2 class="text-xl text-star-white font-extrabold italic">Redigering af billeder</h2>
		<div class="space-y-2 text-star-white/75">
			<p>Hvis du vil redigere et billede er her nogen værktøjer du kan bruge til det.</p>
		</div>
		<p class="text-sm font-semibold text-gold-400">Hvad vælger jeg? Hvis I er i tvivl, så brug Canva. Det er nok til næsten alt.</p>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Canva</h3>
				<p class="mt-1 text-sm">God hvis I vil: hurtigt lave artikler og layout.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I bare vil i gang uden at tænke.</p>
				<a href="https://www.canva.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn Canva</a>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Photopea</h3>
				<p class="mt-1 text-sm">God hvis I vil: redigere billeder mere præcist.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I skal rette eller tilpasse billeder.</p>
				<a href="https://www.photopea.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn Photopea</a>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl text-star-white font-extrabold italic">Logo</h2>
		<div class="space-y-2 text-star-white/75">
			<p>Jeres avis skal have et logo på forsiden.</p>
			<p>Det behøver ikke være kedeligt det må gerne være sjovt og passe til jeres navn.</p>
		</div>
		<p class="text-sm font-semibold text-gold-400">Hvad vælger jeg? Start i Canva. Brug AI-logo hvis I er pressede.</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Canva</h3>
				<p class="mt-1 text-sm">God hvis I vil: lave et simpelt logo selv.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I vil styre designet.</p>
				<a href="https://www.canva.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn Canva</a>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Looka</h3>
				<p class="mt-1 text-sm">God hvis I vil: få forslag automatisk.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I ikke gider designe selv.</p>
				<a href="https://looka.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn Looka</a>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">LogoAI</h3>
				<p class="mt-1 text-sm">God hvis I vil: generere logo hurtigt.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I bare skal bruge noget hurtigt.</p>
				<a href="https://logoai.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn LogoAI</a>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Transparent Logo Maker</h3>
				<p class="mt-1 text-sm">God hvis I vil: fjerne hvid baggrund fra jeres logo.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: jeres AI-genereret logo har hvid baggrund.</p>
				<a href="https://www.smallpngtools.com/transparent-logo-maker.php" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn Transparent Logo Maker</a>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl text-star-white font-extrabold italic">Video / reels</h2>
		<div class="space-y-2 text-star-white/75">
			<p>I skal lave et reel fra en hændelse.</p>
			<p>Det vigtigste er, at den er optaget og klippet ikke at den er perfekt.</p>
		</div>
		<p class="text-sm font-semibold text-gold-400">Hvad vælger jeg? Brug CapCut hvis I er i tvivl. Det er nemmest.</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">CapCut</h3>
				<p class="mt-1 text-sm">God hvis I vil: klippe video hurtigt.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I vil lave en reel nemt.</p>
				<a href="https://www.capcut.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn CapCut</a>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Instagram editor</h3>
				<p class="mt-1 text-sm">God hvis I vil: lave reel direkte på mobilen.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I allerede bruger Instagram.</p>
				<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn Instagram</a>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">VN Video Editor</h3>
				<p class="mt-1 text-sm">God hvis I vil: have lidt mere kontrol.</p>
				<p class="mt-1 text-sm">Vælg denne hvis: I vil redigere lidt mere.</p>
				<a href="https://www.vlognow.me" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Åbn VN Video Editor</a>
			</div>
		</div>

		<!-- ponytail: listen bygger på hvad redaktionerne faktisk brugte i 2026-arkivet -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Det kan I gøre i CapCut</h3>
				<p class="mt-1 text-sm">Det brugte redaktionerne i 2026:</p>
				<ul class="mt-3 list-disc space-y-2 pl-5 text-sm">
					<li><span class="font-semibold text-star-white">Automatiske undertekster.</span> CapCut skriver det, der bliver sagt, som tekst. Så kan man følge med uden lyd.</li>
					<li><span class="font-semibold text-star-white">Store ord og effekter.</span> Sæt et vigtigt ord stort ind på skærmen, eller tilføj en effekt, fx en eksplosion.</li>
					<li><span class="font-semibold text-star-white">Fjern baggrund.</span> Klip reporteren ud, og sæt en ny baggrund bag.</li>
					<li><span class="font-semibold text-star-white">Billede i billede.</span> Vis et lille klip fra hændelsen, mens reporteren fortæller.</li>
					<li><span class="font-semibold text-star-white">Slutbillede med jeres avis.</span> Slut af med "Læs mere" og adressen på jeres avis.</li>
				</ul>
			</div>
			<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
				<h3 class="text-star-white font-extrabold italic">Gode råd, når I filmer</h3>
				<ul class="mt-3 list-disc space-y-2 pl-5 text-sm">
					<li><span class="font-semibold text-star-white">Hold telefonen lodret.</span> Et reel skal være højt og smalt.</li>
					<li><span class="font-semibold text-star-white">Brug lys.</span> Det er mørkt om natten. En lommelygte eller en anden telefons lys gør en stor forskel.</li>
					<li><span class="font-semibold text-star-white">Optag skærmen, i stedet for at filme den.</span> Skal I vise noget fra en computer eller telefon, så brug skærmoptagelse.</li>
					<li><span class="font-semibold text-star-white">Klip det kedelige væk.</span> Korte klip er sjovere at se end én lang optagelse.</li>
					<li><span class="font-semibold text-star-white">Slå CapCut-slutskiltet fra.</span> Ellers kommer CapCuts logo på til sidst. Det slår I fra i CapCuts indstillinger.</li>
				</ul>
			</div>
		</div>

		<div class="rounded-xl border border-gold-500/20 bg-night-700/30 p-4">
			<h3 class="text-star-white font-extrabold italic">Ultimate Vocal Remover</h3>
			<p class="mt-1 text-sm">God hvis I vil: gøre tale tydelig, når der er larm eller musik i baggrunden.</p>
			<p class="mt-1 text-sm">Vælg denne hvis: man ikke kan høre, hvad der bliver sagt i jeres klip.</p>
			<div class="mt-3 flex flex-wrap gap-2">
				<button type="button" onclick={() => uvrGuide.showModal()} class="rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Se guiden</button>
				<a href="https://ultimatevocalremover.com" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Hent Ultimate Vocal Remover</a>
			</div>
		</div>

		<!-- Native dialog: Esc og klik udenfor lukker den -->
		<dialog
			bind:this={uvrGuide}
			onclick={(e) => e.target === uvrGuide && uvrGuide.close()}
			class="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-card-blue p-6 text-star-white/80 backdrop:bg-night-900/80 backdrop:backdrop-blur-sm"
		>
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-xl text-star-white font-extrabold italic">Gør tale tydelig med Ultimate Vocal Remover</h3>
				<button type="button" onclick={() => uvrGuide.close()} aria-label="Luk guiden" class="shrink-0 text-gold-400 hover:text-gold-600">
					<X class="size-6" aria-hidden="true" />
				</button>
			</div>
			<p class="mt-3 text-sm">
				Kan man ikke høre, hvad der bliver sagt i jeres klip, fordi der er larm, musik eller andre
				mennesker i baggrunden? Ultimate Vocal Remover kan trække stemmerne ud og skære støjen fra.
				Det er gratis, kræver ingen konto og kører på computeren (Mac og Windows).
			</p>
			<ol class="mt-4 list-decimal space-y-2 pl-5 text-sm">
				<li>Hent og installer programmet.</li>
				<li>Åbn programmet, og træk jeres videoklip ind i vinduet. Almindelige videofiler fra telefonen (.mp4 og .mov) virker.</li>
				<li>Vælg <span class="font-semibold text-star-white">Demucs</span> under "Choose Process Method".</li>
				<li>Vælg en mappe under "Select Output", og tryk <span class="font-semibold text-star-white">Start Processing</span>.</li>
				<li>Efter et par minutter ligger lyden delt op i filer i mappen. Brug filen med <span class="font-semibold text-star-white">Vocals</span> i navnet. Det er stemmerne uden støj.</li>
				<li>I CapCut: slå lyden fra på jeres klip, og læg Vocals-filen ind under i stedet.</li>
			</ol>
			<p class="mt-4 text-sm text-star-white/60">
				Virker bedst på larm og musik. Folk, der snakker tæt på mikrofonen i baggrunden, kan godt blive hængende.
			</p>
			<a href="https://ultimatevocalremover.com" target="_blank" rel="noopener noreferrer" class="mt-4 inline-block rounded-lg border border-gold-500/40 px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/10">Hent Ultimate Vocal Remover</a>
		</dialog>
	</section>
</div>
