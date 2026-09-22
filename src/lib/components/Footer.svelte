<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="relative z-10 bg-night-900/80 backdrop-blur-md border-t border-gold-500/20 mt-auto">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
			<!-- FDF Landsdel 4 -->
			<div>
				<a
					href="https://fdf.dk/landsdel4/"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-block hover:opacity-80 transition-opacity"
				>
					<img
						src="/svg/FDF_Skjold_Natblaa_Med_Outline_CMYK.svg"
						alt="FDF Landsdel 4"
						class="h-16 w-auto mb-4"
					/>
				</a>
				<p class="text-star-white/50 text-sm">
					Nyhedsnat er et arrangement i FDF Landsdel 4.
				</p>
				<p class="text-star-white/50 text-sm mt-3">
					6.–7. november 2026<br />
					Beder Skole, Skoleparken 6, 8330 Beder
				</p>
			</div>

			<!-- Quick links -->
			<div>
				<h4 class="text-star-white font-bold mb-4">Sider</h4>
				<nav class="flex flex-col gap-2">
					<a href="/tilmelding" class="text-star-white/60 hover:text-gold-400 transition-colors text-sm">
						Tilmelding
					</a>
					<a href="/program" class="text-star-white/60 hover:text-gold-400 transition-colors text-sm">
						Program
					</a>
					<a href="/praktisk" class="text-star-white/60 hover:text-gold-400 transition-colors text-sm">
						Praktisk info
					</a>
					<a href="/redaktion" class="text-star-white/60 hover:text-gold-400 transition-colors text-sm">
						Lav avis
					</a>
					<a href="/faq" class="text-star-white/60 hover:text-gold-400 transition-colors text-sm">
						FAQ
					</a>
					<a
						href="https://avismaskinen.dk"
						target="_blank"
						rel="noopener noreferrer"
						class="text-star-white/60 hover:text-gold-400 transition-colors text-sm"
					>
						Aviserne på Avismaskinen
					</a>
				</nav>
			</div>

			<!-- Contact -->
			<div>
				<h4 class="text-star-white font-bold mb-4">Kontakt</h4>
				<a
					href="mailto:info@nyhedsnat.dk"
					class="text-gold-400 hover:text-gold-300 transition-colors"
				>
					info@nyhedsnat.dk
				</a>
				<p class="text-star-white/50 text-sm mt-4">
					Nyhedsnat planlægges og afvikles af et udvalg i FDF Landsdel 4.
				</p>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="border-t border-gold-500/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
			<p class="text-star-white/40 text-sm">&copy; {currentYear} NyhedsNat - FDF Landsdel 4</p>
		</div>
	</div>
</footer>
