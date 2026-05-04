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

<script lang="ts">
	import JoinButton from '$lib/components/JoinButton.svelte';
</script>

<div class="min-h-screen px-4 py-12">
	<div class="max-w-6xl mx-auto">
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
				<div class="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-6 bottom-6 w-1 bg-gold-500/35"></div>

				<!-- Timeline Items -->
				{#each [
					{ time: '18:30–19:15', title: 'Deltagerankomst', icon: '🚗' },
					{ time: '19:30', title: 'Fælles Velkomst', icon: '👋' },
					{ time: '20:30–01:00', title: 'Hændelser', icon: '💥' },
					{ time: '01:00', title: 'Natmad', icon: '🍕' },
					{ time: '', title: 'Sove eller arbejde på aviser', icon: '😴' },
					{ time: '04:00', title: 'Deadline for Aflevering af aviser, reel og pressefoto', icon: '📰' },
					{ time: '', title: 'Sove', icon: '😴' },
					{ time: '08:30', title: 'Morgenmad', icon: '🥐' },
					{ time: '09:30 - 10:00', title: 'Afstemning om pressefoto, og reel Oprydning og video fra events', icon: '🧹' },
					{ time: '10:00', title: 'Kåring af vindere', icon: '🏆' },
					{ time: '11:00', title: 'Tak for i dag', icon: '👋' }
				] as item, i}
					<div class="relative pb-8 md:pb-4 last:pb-0">
						<div class="relative flex items-start gap-6 md:gap-0 md:block">
							<!-- Dot -->
							<div class="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-night-800 border-2 border-gold-500/50 flex items-center justify-center text-2xl md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
								{item.icon}
							</div>

							<!-- Content -->
							<div class="flex-1 md:w-[calc(50%-2.5rem)] md:ml-0 md:mr-0 card-dark rounded-xl p-4 md:p-4 hover:border-gold-500/40 transition-colors {i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}">
								<span class="text-gold-400 font-mono font-bold text-lg">{item.time}</span>
								<h3 class="text-xl font-bold text-star-white mt-2">{item.title}</h3>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quick info -->
		<div class="card-dark rounded-2xl p-8 text-center">
			<h2 class="text-2xl font-bold text-star-white mb-4">En hel nat med oplevelser</h2>
			<p class="text-star-white/60 mb-6">
				Fra ankomst fredag aften til kåring lørdag formiddag er der maks gang i den og masser af avisskriveri.
			</p>
			<JoinButton href="/tilmelding">Tilmeld jer nu</JoinButton>
		</div>

	</div>
</div>
