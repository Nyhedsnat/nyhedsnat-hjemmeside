<script lang="ts">
	export let href = '#';
	export let variant: 'cta' | 'secondary' = 'cta';
	export let className = '';

	// Designguide: cta = massiv guld, secondary = guldkant. Klasser i layout.css.
	const variants = { cta: 'btn btn-gold text-lg', secondary: 'btn btn-outline' };
</script>

<a href={href} class={`${variants[variant]} ${className}`} {...$$restProps}>
	<slot />
</a>
