<script lang="ts">
	export let size: 'sm' | 'lg' = 'sm';
	// ponytail: Lucide 1.x har ingen brand-ikoner, så de to logoer er inline SVG.
	const box = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
	const icon = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
	const cls = `${box} flex items-center justify-center rounded-full bg-band-red text-star-white transition-colors hover:bg-gold-500 hover:text-night-900`;
</script>

<div class="flex items-center gap-3">
	<a href="https://www.instagram.com/nyhedsnat/" target="_blank" rel="noopener noreferrer" aria-label="NyhedsNat på Instagram" class={cls}>
		<svg class={icon} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
			<rect x="2" y="2" width="20" height="20" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
		</svg>
	</a>
	<a href="https://www.facebook.com/profile.php?id=61594900765016" target="_blank" rel="noopener noreferrer" aria-label="NyhedsNat på Facebook" class={cls}>
		<svg class={icon} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.55.45-1 1-1z" />
		</svg>
	</a>
</div>
