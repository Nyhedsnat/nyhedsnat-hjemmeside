<svelte:head>
	<title>Program – NyhedsNat i Landsdel 4</title>
	<meta name="description" content="Program for NyhedsNat i Landsdel 4 den 6.–7. november 2026 – se tidsplan for aftenen og natten." />
	<link rel="canonical" href="https://nyhedsnat.dk/program" />
	<meta property="og:site_name" content="NyhedsNat" />
	<meta property="og:locale" content="da_DK" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nyhedsnat.dk/program" />
	<meta property="og:title" content="Program – NyhedsNat i Landsdel 4" />
	<meta property="og:description" content="Program for NyhedsNat i Landsdel 4 den 6.–7. november 2026 – se tidsplan for aftenen og natten." />
	<meta property="og:image" content="https://nyhedsnat.dk/images/logo.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Program – NyhedsNat i Landsdel 4" />
	<meta name="twitter:description" content="Program for NyhedsNat i Landsdel 4 den 6.–7. november 2026 – se tidsplan for aftenen og natten." />
	<meta name="twitter:image" content="https://nyhedsnat.dk/images/logo.png" />
</svelte:head>

<div class="min-h-screen px-4 py-12">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header -->
		<div class="text-center mb-16">
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-star-white mb-6">
				<span class="text-gradient-gold">Program</span>
			</h1>
		</div>

		<!-- Timeline -->
		<div class="space-y-6 mb-12">
			<div class="relative">
				<!-- Timeline Line -->
				<div class="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gold-500/30"></div>

				<!-- Timeline Items -->
				{#each [
					{ time: '19:00–20:00', title: 'Deltagerankomst', icon: '🚗' },
					{ time: '20:00', title: 'Fælles intro', icon: '👋' },
					{ time: '20:30–01:00', title: 'Events', icon: '⚡' },
					{ time: '01:00', title: 'Natmad', icon: '🍕' },
					{ time: '', title: 'Sove eller arbejde på aviser', icon: '😴' },
					{ time: '07:00', title: 'Deadline for aflevering af aviser', icon: '📰' },
					{ time: '09:00', title: 'Morgenmad', icon: '🥐' },
					{ time: '10:00', title: 'Kåring af vindere', icon: '🏆' },
					{ time: '11:00', title: 'Tak for i dag', icon: '👋' }
				] as item, i}
					<div class="relative flex items-start gap-6 pb-8 last:pb-0">
						<!-- Dot -->
						<div class="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-night-800 border-2 border-gold-500/50 flex items-center justify-center text-2xl">
							{item.icon}
						</div>

						<!-- Content -->
						<div class="flex-1 card-dark rounded-xl p-6 hover:border-gold-500/40 transition-colors">
							<span class="text-gold-400 font-mono font-bold text-lg">{item.time}</span>
							<h3 class="text-xl font-bold text-star-white mt-2">{item.title}</h3>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quick info -->
		<div class="card-dark rounded-2xl p-8 text-center">
			<h2 class="text-2xl font-bold text-star-white mb-4">En hel nat med oplevelser</h2>
			<p class="text-star-white/60 mb-6">
				Fra ankomst fredag aften til kåring lørdag formiddag – fyldt med events, kreativitet og fællesskab.
			</p>
			<a
				href="/tilmelding"
				class="inline-block px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-night-900 font-bold rounded-full glow-gold hover:scale-105 transition-all"
			>
				Tilmeld jer nu
			</a>
		</div>

	</div>
</div>
