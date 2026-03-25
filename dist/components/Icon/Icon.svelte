<script lang="ts">
	/**
	 * @component Icon
	 * A component for rendering Bootstrap Icons with automatic code splitting.
	 */

	interface Props {
		/** The name of the Bootstrap Icon (e.g. "trash", "search") */
		name: string;
		/**
		 * Accessible label for the icon.
		 * If provided, the icon will have role="img" and aria-label.
		 * If omitted, the icon will be hidden from screen readers (decorative).
		 */
		alt?: string;
		/** Size of the icon (e.g. "1.5rem", "24px", 20) */
		size?: string | number;
		/** Colour of the icon. Defaults to "currentColor". */
		colour?: string;
		/** Additional CSS classes */
		class?: string;
		/** Spread remaining attributes to the container */
		[key: string]: unknown;
	}

	let {
		name,
		alt,
		size = '1em',
		colour = 'currentColor',
		class: className = '',
		...rest
	}: Props = $props();

	// Use a glob to ensure Vite knows which icons to bundle.
	// Root-relative path is resolved from the project root in Vite.
	const iconModules = import.meta.glob<string>('/node_modules/bootstrap-icons/icons/*.svg', {
		query: '?raw',
		import: 'default'
	});

	console.log(`[Akui] Found ${Object.keys(iconModules).length} icons in glob.`);

	let svgContent = $state<string | null>(null);

	$effect(() => {
		if (name) {
			const path = `/node_modules/bootstrap-icons/icons/${name}.svg`;
			const fallbackPath = '/node_modules/bootstrap-icons/icons/exclamation-triangle.svg';
			let loader = iconModules[path];

			if (!loader) {
				console.error(`[Akui] Icon "${name}" not found. Falling back to exclamation-triangle.`);
				loader = iconModules[fallbackPath];
			}

			if (loader) {
				(loader() as Promise<string>)
					.then((content) => {
						svgContent = content;
					})
					.catch((err) => {
						console.error(`[Akui] Error loading icon "${name}":`, err);
						svgContent = null;
					});
			} else {
				console.error(`[Akui] Critical: Default fallback icon not found at ${fallbackPath}`);
				svgContent = null;
			}
		}
	});

	// Normalize size to include units if it's a number
	let computedSize = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<span
	class="akui-icon {className}"
	role={alt ? 'img' : 'presentation'}
	aria-label={alt}
	aria-hidden={alt ? undefined : 'true'}
	style:width={computedSize}
	style:height={computedSize}
	style:color={colour}
	{...rest}
>
	{#if svgContent}
		<!-- We trust the SVG content from bootstrap-icons -->
		{@html svgContent}
	{/if}
</span>

<style>
	.akui-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		flex-shrink: 0;
	}

	.akui-icon :global(svg) {
		width: 100%;
		height: 100%;
		fill: currentColor;
	}
</style>
