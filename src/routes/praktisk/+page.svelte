<svelte:head>
	<title>Praktisk info – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Praktisk information til NyhedsNat i Landsdel 4 – overnatning, transport, madpakke, udstyr og andre vigtige detaljer for deltagere og ledere." />
	<link rel="canonical" href="https://nyhedsnat.dk/praktisk" />
	<meta property="og:site_name" content="NyhedsNat" />
	<meta property="og:locale" content="da_DK" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nyhedsnat.dk/praktisk" />
	<meta property="og:title" content="Praktisk info – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Praktisk information til NyhedsNat i Landsdel 4 – overnatning, transport, madpakke, udstyr og andre vigtige detaljer for deltagere og ledere." />
	<meta property="og:image" content="https://nyhedsnat.dk/images/logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Praktisk info – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Praktisk information til NyhedsNat i Landsdel 4 – overnatning, transport, madpakke, udstyr og andre vigtige detaljer for deltagere og ledere." />
	<meta name="twitter:image" content="https://nyhedsnat.dk/images/logo.png" />
</svelte:head>

<div class="min-h-screen px-4 py-12">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header -->
		<div class="text-center mb-16">
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-star-white mb-6">
				<span class="text-gradient-gold">Praktisk info</span>
			</h1>
			<p class="text-xl text-star-white/60 max-w-2xl mx-auto">
				For deltagere og ledere
			</p>
		</div>

		<!-- Content Sections -->
		<div class="space-y-8">
			<!-- Overnatning -->
			<section class="card-dark rounded-2xl p-8">
				<h2 class="text-2xl font-bold text-star-white mb-4 flex items-center gap-3">
					<span class="text-3xl">🏠</span>
					Overnatning
				</h2>
				<p class="text-star-white/70 leading-relaxed">
					Nyhedsnat er et indendørs arrangement med overnatning på gulv i en gymnastiksal.
				</p>
			</section>

			<!-- Pakkeliste -->
			<section class="card-dark rounded-2xl p-8">
				<h2 class="text-2xl font-bold text-star-white mb-4 flex items-center gap-3">
					<span class="text-3xl">🎒</span>
					Pakkeliste for deltagere
				</h2>
				<p class="text-star-white/70 mb-6">Deltagerne skal medbringe:</p>
				<ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each [
						'Sovepose og liggeunderlag',
						'Almindeligt lejrudstyr til indendørs overnatning',
						'FDF-skjorte',
						'Lommelygte',
						'Notesblok og skriveredskaber',
						'Mobiltelefon'
					] as item}
						<li class="flex items-center gap-3 text-star-white/80">
							<div class="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
								<svg class="w-3 h-3 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							{item}
						</li>
					{/each}
				</ul>
			</section>

			<!-- Redaktionskrav -->
			<section class="card-dark rounded-2xl p-8">
				<h2 class="text-2xl font-bold text-star-white mb-4 flex items-center gap-3">
					<span class="text-3xl">📋</span>
					Redaktioner – krav for deltagelse
				</h2>
				<p class="text-star-white/70 mb-6">Hver redaktion skal opfylde følgende krav:</p>
				<ul class="space-y-4">
					<li class="flex items-start gap-4">
						<div class="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
							<span class="text-gold-400 font-bold">1</span>
						</div>
						<div>
							<span class="text-star-white font-medium">4–7 deltagere</span>
							<span class="text-star-white/50"> (færre er ikke muligt)</span>
						</div>
					</li>
					<li class="flex items-start gap-4">
						<div class="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
							<span class="text-gold-400 font-bold">2</span>
						</div>
						<span class="text-star-white/80">Minimum én leder og en bil pr 2 redaktioner</span>
					</li>
					<li class="flex items-start gap-4">
						<div class="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
							<span class="text-gold-400 font-bold">3</span>
						</div>
						<span class="text-star-white/80">Minimum to computere (gerne flere)</span>
					</li>
				</ul>
				<p class="text-star-white/50 mt-6 text-sm border-t border-gold-500/20 pt-4">
					Kredse må gerne gå sammen om at stille en redaktion. og vi hjælper i udvalget gerne med at formidle kontakten mellem kredse.
				</p>
			</section>

			<!-- Transport -->
			<section class="card-dark rounded-2xl p-8">
				<h2 class="text-2xl font-bold text-star-white mb-4 flex items-center gap-3">
					<span class="text-3xl">🚗</span>
					Transport og kortagekørsel
				</h2>
				<p class="text-star-white/70 mb-6 leading-relaxed">
					Når redaktionerne rykker ud til hændelser, sker det via et fælles kortagekørselssystem, som arrangørerne står for.
				</p>
				<ul class="space-y-3">
					{#each [
						'Kun halvdelen af redaktionen kører ud ad gangen',
						'To redaktioner kører sammen',
						'Ledere kører kun ca. til hver anden hændelse'
					] as item}
						<li class="flex items-center gap-3 text-star-white/80">
							<span class="text-gold-400">•</span>
							{item}
						</li>
					{/each}
				</ul>
				<p class="text-star-white/60 mt-6 italic">
					Så lederne har god tid til andre ting end at sidde bag et rat.
				</p>
			</section>

			<!-- For ledere -->
			<section class="card-dark rounded-2xl p-8 border-gold-500/30">
				<h2 class="text-2xl font-bold text-star-white mb-4 flex items-center gap-3">
					<span class="text-3xl">👨‍🏫</span>
					For ledere
				</h2>
				<p class="text-star-white/70 mb-6">Som leder er din rolle:</p>
				<ul class="space-y-3 mb-6">
					{#each [
						'At være en del af redaktionen',
						'At støtte deltagerne i processen',
						'At være med i legen'
					] as item}
						<li class="flex items-center gap-3 text-star-white/80">
							<div class="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
								<svg class="w-3 h-3 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							{item}
						</li>
					{/each}
				</ul>
				<p class="text-star-white/70 leading-relaxed mb-4">
					Du forventes ikke at have særlige IT- eller journalistkompetencer. Arrangementet er tilrettelagt, så der er tid og rum til både overblik, pauser og hygge.
				</p>
				<p class="text-gold-400/80 font-medium">
					Der er IT-kyndige frivillige til stede hele natten.
				</p>
			</section>
		</div>

	</div>
</div>
