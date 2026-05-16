<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';
	import DynamicImage from '../DynamicImage/DynamicImage.svelte';

	interface Props {
		/** The main headline of the item */
		title: string;
		/** A short summary or excerpt */
		excerpt?: string;
		/** Metadata label (e.g. feed name or category) */
		tag?: string;
		/** Timestamp or relative time string */
		time?: string;
		/** Optional icon to show on the left (icon name, URL, or snippet) */
		icon?: string | Snippet;
		/** Optional image to show (URL or snippet) */
		image?: string | Snippet;
		/** Whether the item is currently selected/active */
		active?: boolean;
		/** Whether the item is unread. Read items have dimmed titles. */
		unread?: boolean;
		/** Link destination */
		href?: string;
		/** Layout style: 'compact' (side image) or 'hero' (top image) */
		layout?: 'compact' | 'hero';
		/** Aspect ratio for the thumbnail (e.g. '16 / 9' or '1 / 1') */
		ratio?: string | number;
		/** Image fit mode: 'cover', 'contain', or 'auto' (smart) */
		fit?: 'cover' | 'contain' | 'auto';
		/** Additional CSS classes */
		class?: string;
		/** Callback when the item is clicked */
		onclick?: (e: MouseEvent) => void;
	}

	let {
		title,
		excerpt,
		tag,
		time,
		icon,
		image,
		active = false,
		unread = true,
		href,
		layout = 'compact',
		ratio = '16 / 9',
		fit = 'auto',
		class: className = '',
		onclick
	}: Props = $props();

	const isExternal = $derived(href?.startsWith('http'));
	function handleClick(e: MouseEvent) {
		onclick?.(e);
	}

	function handleAuxClick(e: MouseEvent) {
		if (e.button === 1) {
			onclick?.(e);
		}
	}
</script>

<a
	{href}
	onclick={handleClick}
	onauxclick={handleAuxClick}
	class="akui-feed-item-row {className}"
	class:active
	class:unread
	class:hero={layout === 'hero'}
	target={isExternal ? '_blank' : undefined}
	rel={isExternal ? 'noopener noreferrer' : undefined}
	aria-current={active ? 'true' : undefined}
>
	<!-- Hero Thumbnail (Top) -->
	{#if layout === 'hero' && image}
		<div class="akui-feed-item-row-hero" style:aspect-ratio={ratio}>
			{#if typeof image === 'string'}
				<DynamicImage src={image} alt="" {fit} />
			{:else}
				{@render image()}
			{/if}
		</div>
	{/if}

	<!-- Main Layout Container -->
	<div class="akui-feed-item-row-layout">
		{#if icon}
			<div class="akui-feed-item-row-icon">
				{#if typeof icon === 'string'}
					<Icon name={icon} size={16} />
				{:else}
					<div class="akui-feed-item-row-icon-inner">
						{@render icon()}
					</div>
				{/if}
			</div>
		{/if}

		<div class="akui-feed-item-row-content">
			<!-- Metadata Row (Tag/Title and Time) -->
			<div class="akui-feed-item-row-meta">
				{#if tag}
					<span class="akui-feed-item-row-tag">{tag}</span>
				{:else}
					<h4 class="akui-feed-item-row-title">{title}</h4>
				{/if}
				<span class="akui-feed-item-row-time">{time || ''}</span>
			</div>

			{#if tag}
				<h4 class="akui-feed-item-row-title">{title}</h4>
			{/if}

			{#if excerpt}
				<p class="akui-feed-item-row-excerpt">{excerpt}</p>
			{/if}
		</div>

		<!-- Compact Thumbnail (Side) -->
		{#if layout === 'compact' && image}
			<div class="akui-feed-item-row-image" style:aspect-ratio={layout === 'compact' ? '1 / 1' : ratio}>
				{#if typeof image === 'string'}
					<DynamicImage src={image} alt="" {fit} />
				{:else}
					{@render image()}
				{/if}
			</div>
		{/if}
	</div>
</a>

<style>
	.akui-feed-item-row {
		display: block;
		padding: var(--akui-space-m);
		text-decoration: none !important; /* Bespoke link: no underline */
		color: var(--akui-fg);
		background-color: transparent;
		transition: 
			background-color 0.15s ease,
			box-shadow 0.15s ease;
		outline: none;
		position: relative;
		cursor: pointer;
		user-select: none;
	}
/* ... rest of the styles ... */

	.akui-feed-item-row:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-feed-item-row.active {
		background-color: var(--akui-bg-active);
	}

	.akui-feed-item-row:focus-visible {
		box-shadow: 0 0 0 2px var(--akui-ring-color, var(--akui-fg-accent));
		z-index: 10;
	}

	.akui-feed-item-row.hero {
		padding: 0;
		overflow: hidden;
	}

	.akui-feed-item-row.hero .akui-feed-item-row-layout {
		padding: var(--akui-space-m);
	}

	.akui-feed-item-row-hero {
		width: 100%;
		background-color: var(--akui-bg-secondary);
	}

	/* Metadata row at the top */
	.akui-feed-item-row-layout {
		display: flex;
		gap: var(--akui-space-m);
		align-items: flex-start;
	}

	.akui-feed-item-row-icon {
		flex-shrink: 0;
		padding-top: var(--akui-space-xs);
		opacity: 0.7;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
	}

	.akui-feed-item-row-icon-inner {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.akui-feed-item-row-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--akui-space-xs);
	}

	.akui-feed-item-row-meta {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: var(--akui-font-size-xs);
		color: var(--akui-fg-secondary);
		gap: var(--akui-space-m);
	}

	.akui-feed-item-row-tag {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-right: var(--akui-space-s);
	}

	.akui-feed-item-row-time {
		white-space: nowrap;
		flex-shrink: 0;
	}

	.akui-feed-item-row-title {
		flex: 1;
		margin: 0;
		font-size: var(--akui-font-size-m);
		font-weight: 600;
		line-height: 1.3;
		color: var(--akui-fg-secondary);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		transition: color 0.15s ease;
	}

	.akui-feed-item-row.unread .akui-feed-item-row-title {
		color: var(--akui-fg);
	}

	.akui-feed-item-row-excerpt {
		margin: 0;
		font-size: var(--akui-font-size-s);
		color: var(--akui-fg-secondary);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.akui-feed-item-row-image {
		flex-shrink: 0;
		width: 64px;
		height: 64px;
		overflow: hidden;
		background-color: var(--akui-bg-secondary);
		margin-top: var(--akui-space-xs);
	}

	.akui-feed-item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
