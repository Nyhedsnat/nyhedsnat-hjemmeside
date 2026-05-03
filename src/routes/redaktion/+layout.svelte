<script lang="ts">
	import { page } from '$app/state';

	let sidebarOpen = $state(false);

	const links = [
		{ href: '/redaktion', label: 'Lav avis' },
		{ href: '/redaktion/avismaskinen', label: 'Avismaskinen' },
		{ href: '/redaktion/vaerktojer', label: 'Anbefalede værktøjer' },
		{ href: '/redaktion/regler', label: 'Regler for aviser' }
	];

	function isActive(href: string) {
		if (href === '/redaktion') return page.url.pathname === '/redaktion';
		return page.url.pathname.startsWith(href);
	}

	function getHeader(pathname: string) {
		if (pathname === '/redaktion') {
			return { title: 'Lav jeres avis', subtitle: 'Alt I skal bruge for at lave jeres avis' };
		}
		if (pathname.startsWith('/redaktion/avismaskinen')) {
			return { title: 'Avismaskinen', subtitle: 'Her bygger I jeres avis' };
		}
		if (pathname.startsWith('/redaktion/vaerktojer')) {
			return { title: 'Anbefalede værktøjer', subtitle: 'Værktøjer I kan bruge, når I laver jeres avis' };
		}
		return { title: 'Regler', subtitle: 'Krav til avisen og bedømmelse' };
	}

	const header = $derived(getHeader(page.url.pathname));
	const isRulesPage = $derived(page.url.pathname.startsWith('/redaktion/regler'));
</script>

<div class="min-h-screen px-4 py-10 md:py-11">
	<div class="mx-auto max-w-6xl">
		{#if isRulesPage}
			<div class="mb-8 text-center md:mb-10">
				<p class="mb-2 text-sm font-semibold uppercase tracking-wider text-gold-400/80">Lav avis</p>
				<h1 class="mb-3 text-3xl font-semibold tracking-tight text-star-white md:text-4xl">{header.title}</h1>
				<p class="mx-auto max-w-2xl text-lg text-star-white/60">{header.subtitle}</p>
			</div>
		{/if}

		<div class="grid items-start gap-6 md:grid-cols-[260px_1fr]">
			<div class="md:hidden">
				<button
					onclick={() => (sidebarOpen = !sidebarOpen)}
					class="w-full rounded-xl border border-gold-500/30 bg-night-800/80 px-4 py-3 text-left font-bold text-gold-400"
				>
					Menu: Lav avis
				</button>
				{#if sidebarOpen}
					<nav class="mt-3 space-y-2 rounded-xl border border-gold-500/20 bg-night-800/70 p-3">
						{#each links as link}
							<a
								href={link.href}
								onclick={() => (sidebarOpen = false)}
								class={`block rounded-lg px-3 py-2 ${
									isActive(link.href)
										? 'bg-gold-500/15 text-gold-400'
										: 'text-star-white/80 hover:bg-night-700/50 hover:text-gold-400'
								}`}
							>
								{link.label}
							</a>
						{/each}
					</nav>
				{/if}
			</div>

			<aside class="hidden self-start md:block">
				<nav class="space-y-2 rounded-2xl border border-gold-500/20 bg-night-800/70 p-4">
					{#each links as link}
						<a
							href={link.href}
							class={`block rounded-lg px-3 py-2 ${
								isActive(link.href)
									? 'bg-gold-500/15 text-gold-400 font-semibold'
									: 'text-star-white/80 hover:bg-night-700/50 hover:text-gold-400'
							}`}
						>
							{link.label}
						</a>
					{/each}
				</nav>
			</aside>

			{#if isRulesPage}
				<main>
					<slot />
				</main>
			{:else}
				<main class="card-dark rounded-2xl p-8 md:p-10">
					<div class="mb-8">
						<p class="mb-2 text-sm font-semibold uppercase tracking-wider text-gold-400/80">Lav avis</p>
						<h1 class="mb-3 text-3xl font-semibold tracking-tight text-star-white md:text-4xl">{header.title}</h1>
						<p class="max-w-2xl text-lg text-star-white/60">{header.subtitle}</p>
					</div>
					<slot />
				</main>
			{/if}
		</div>
	</div>
</div>
