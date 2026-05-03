<script lang="ts">
	import { page } from '$app/state';

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/tilmelding', label: 'Tilmelding & indbydelse' },
		{ href: '/program', label: 'Program' },
		{ href: '/praktisk', label: 'Praktisk' },
		{ href: '/redaktion', label: 'Lav avis' },
		{ href: '/faq', label: 'FAQ' },
		{ href: '/kontakt', label: 'Kontakt' }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleLogoDoubleClick(e: MouseEvent) {
		e.preventDefault();
		// Trigger streamers easter egg
		window.dispatchEvent(new CustomEvent('trigger-streamers'));
	}

	function isActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}
		return page.url.pathname.startsWith(href);
	}

	function getDesktopLinkClass(href: string): string {
		const base = 'nav-link hover:text-gold-400 transition-colors font-medium text-lg';
		if (href === '/redaktion') {
			const workspace =
				'inline-flex items-center gap-2 rounded-lg border border-gold-500/25 px-3 py-1.5 hover:border-gold-500/45 hover:bg-night-700/35';
			return isActive(href)
				? `${base} ${workspace} text-gold-400 active`
				: `${base} ${workspace} text-star-white/80`;
		}
		return isActive(href) ? `${base} text-gold-400 active` : `${base} text-star-white/80`;
	}

	function getMobileLinkClass(href: string): string {
		const base =
			'block px-4 py-3 rounded-lg hover:text-gold-400 hover:bg-night-700/50 transition-all font-medium text-lg';
		if (href === '/redaktion') {
			const workspace = 'border border-gold-500/25 hover:border-gold-500/45';
			return isActive(href)
				? `${base} ${workspace} text-gold-400 bg-night-700/50`
				: `${base} ${workspace} text-star-white/80`;
		}
		return isActive(href) ? `${base} text-gold-400 bg-night-700/50` : `${base} text-star-white/80`;
	}
</script>

<header class="fixed top-0 right-0 left-0 z-50">
	<!-- Main header with large logo -->
	<div class="relative border-b border-gold-500/20 bg-night-900/90 backdrop-blur-md">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center py-3 md:py-4 md:pr-32 lg:pr-40">
				<!-- Large Logo Area (double-click for streamers!) -->
				<a href="/" class="group flex items-center gap-3" onclick={closeMobileMenu} ondblclick={handleLogoDoubleClick}>
					<img
						src="/svg/logo.svg"
						alt="NyhedsNat Logo"
						class="h-14 w-auto drop-shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-16 md:h-20 lg:h-24"
					/>
				</a>

				<!-- Desktop Navigation -->
				<div class="hidden min-w-0 flex-1 items-center md:flex">
					<nav class="ml-auto flex items-center gap-4 lg:gap-7">
						{#each navLinks.filter((link) => link.href !== '/redaktion') as link}
							<a href={link.href} class={getDesktopLinkClass(link.href)}>
								{#if link.href === '/tilmelding'}
									<span class="lg:hidden">Tilmelding</span>
									<span class="hidden lg:inline">{link.label}</span>
								{:else}
									{link.label}
								{/if}
							</a>
						{/each}
					</nav>
				</div>


				<!-- Mobile Menu Button -->
				<button
					onclick={toggleMobileMenu}
					class="ml-auto flex flex-col gap-1.5 rounded-lg p-3 transition-colors hover:bg-night-700/50 md:hidden"
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					<span
						class="block h-0.5 w-7 origin-center bg-gold-400 transition-all duration-300 {mobileMenuOpen
							? 'translate-y-2 rotate-45'
							: ''}"
					></span>
					<span
						class="block h-0.5 w-7 bg-gold-400 transition-all duration-300 {mobileMenuOpen
							? 'opacity-0'
							: ''}"
					></span>
					<span
						class="block h-0.5 w-7 origin-center bg-gold-400 transition-all duration-300 {mobileMenuOpen
							? '-translate-y-2 -rotate-45'
							: ''}"
					></span>
				</button>
			</div>
		</div>
		<div class="pointer-events-none absolute inset-y-0 right-10 hidden items-center md:flex lg:right-14">
			{#each navLinks.filter((link) => link.href === '/redaktion') as link}
				<a href={link.href} class={`${getDesktopLinkClass(link.href)} pointer-events-auto`}>
					<span aria-hidden="true">📰</span>
					{link.label}
				</a>
			{/each}
		</div>
	</div>

	<!-- Mobile Navigation Dropdown -->
	{#if mobileMenuOpen}
		<div
			class="animate-slideDown border-b border-gold-500/20 bg-night-800/95 backdrop-blur-md md:hidden"
		>
			<nav class="space-y-2 px-4 py-4">
				{#each navLinks.filter((link) => link.href !== '/redaktion') as link}
					<a href={link.href} onclick={closeMobileMenu} class={getMobileLinkClass(link.href)}>
						{link.label}
					</a>
				{/each}

				<div class="mt-3 border-t border-gold-500/20 pt-3">
					{#each navLinks.filter((link) => link.href === '/redaktion') as link}
						<a href={link.href} onclick={closeMobileMenu} class={getMobileLinkClass(link.href)}>
							<span class="mr-2" aria-hidden="true">📰</span>
							{link.label}
						</a>
					{/each}
				</div>
			</nav>
		</div>
	{/if}
</header>

<style>
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideDown {
		animation: slideDown 0.2s ease-out;
	}
</style>
