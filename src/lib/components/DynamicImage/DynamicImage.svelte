<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		/** Image source URL */
		src: string;
		/** Accessible description */
		alt?: string;
		/** 
		 * Fit mode:
		 * - 'cover': Fills container, may crop
		 * - 'contain': Shows full image, may have bars
		 * - 'auto': Smart choice based on aspect ratio difference
		 */
		fit?: 'cover' | 'contain' | 'auto';
		/** Aspect ratio difference threshold for 'auto' fit (0.0 to 1.0) */
		threshold?: number;
		/** Loading handler */
		onload?: (dims: { width: number; height: number; ratio: number }) => void;
		/** Error handler */
		onerror?: (err: any) => void;
		/** Additional CSS classes */
		class?: string;
		/** Style overrides */
		style?: string;
	}

	let {
		src,
		alt = '',
		fit = 'auto',
		threshold = 0.15,
		onload,
		onerror,
		class: className = '',
		style = ''
	}: Props = $props();

	let isLoaded = $state(false);
	let error = $state(false);
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
	let containerWidth = $state(0);
	let containerHeight = $state(0);

	const naturalRatio = $derived(naturalHeight > 0 ? naturalWidth / naturalHeight : 0);
	const containerRatio = $derived(containerHeight > 0 ? containerWidth / containerHeight : 0);

	const computedFit = $derived.by(() => {
		if (fit !== 'auto') return fit;
		if (naturalRatio === 0 || containerRatio === 0) return 'cover';

		// If the difference in aspect ratio is small, use cover for a better look
		const diff = Math.abs(naturalRatio - containerRatio);
		return diff <= threshold ? 'cover' : 'contain';
	});

	function handleLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		naturalWidth = img.naturalWidth;
		naturalHeight = img.naturalHeight;
		isLoaded = true;
		error = false;
		
		onload?.({
			width: naturalWidth,
			height: naturalHeight,
			ratio: naturalRatio
		});
	}

	function handleError(err: any) {
		error = true;
		isLoaded = false;
		onerror?.(err);
	}
</script>

<div 
	class="akui-dynamic-image-container {className}" 
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
	{style}
>
	<!-- Placeholder Background -->
	<div class="akui-dynamic-image-placeholder" class:error>
		{#if error}
			<div class="akui-dynamic-image-error-icon">⚠️</div>
		{/if}
	</div>

	{#if src && !error}
		<img
			{src}
			{alt}
			class="akui-dynamic-image"
			class:loaded={isLoaded}
			style:object-fit={computedFit}
			onload={handleLoad}
			onerror={handleError}
			transition:fade={{ duration: 300 }}
			loading="lazy"
		/>
	{/if}
</div>

<style>
	.akui-dynamic-image-container {
		position: relative;
		overflow: hidden;
		background-color: var(--akui-bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.akui-dynamic-image-placeholder {
		position: absolute;
		inset: 0;
		background-color: var(--akui-bg-secondary);
	}

	.akui-dynamic-image-placeholder.error {
		background-color: var(--akui-bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.akui-dynamic-image-error-icon {
		opacity: 0.5;
		font-size: 24px;
	}

	.akui-dynamic-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.3s ease;
		background-color: transparent;
	}

	.akui-dynamic-image.loaded {
		opacity: 1;
	}
</style>
