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
		/** Optional unique identifier for selection tracking */
		id?: string;
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
		/** Whether the item is bookmarked */
		bookmarked?: boolean;
		/** Callback when the bookmark button is clicked */
		onbookmark?: (e: MouseEvent) => void;
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
		id,
		href,
		layout = 'compact',
		ratio = '16 / 9',
		fit = 'auto',
		class: className = '',
		bookmarked = false,
		onclick,
		onbookmark
	}: Props = $props();

	const isExternal = $derived(href?.startsWith('http'));
	let isButtonFocused = $state(false);
	let isHoveringLeft = $state(false);
	let dwellTimer: ReturnType<typeof setTimeout> | null = null;

	function handlePointerMove(e: PointerEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const isLeft = x < 64;

		if (isLeft && !isHoveringLeft) {
			// Start dwell — only reveal bookmark after the cursor lingers
			if (dwellTimer === null) {
				dwellTimer = setTimeout(() => {
					isHoveringLeft = true;
					dwellTimer = null;
				}, 200);
			}
		} else if (!isLeft) {
			// Cursor moved out of zone: cancel pending dwell and hide immediately
			if (dwellTimer !== null) {
				clearTimeout(dwellTimer);
				dwellTimer = null;
			}
			isHoveringLeft = false;
		}
	}

	function handlePointerLeave() {
		if (dwellTimer !== null) {
			clearTimeout(dwellTimer);
			dwellTimer = null;
		}
		isHoveringLeft = false;
	}

	function handleClick(e: MouseEvent) {
		onclick?.(e);
	}

	function handleAuxClick(e: MouseEvent) {
		if (e.button === 1) {
			onclick?.(e);
		}
	}

	function handleBookmarkClick(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		onbookmark?.(e);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick?.(e as unknown as MouseEvent);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="akui-feed-item-row {className}"
	class:active
	class:unread
	class:hero={layout === 'hero'}
	class:bookmarked
	class:hover-left={isHoveringLeft}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onclick={!href && onclick ? handleClick : undefined}
	onkeydown={!href && onclick ? handleKeyDown : undefined}
	tabindex={!href && onclick ? 0 : undefined}
	role={!href && onclick ? 'button' : undefined}
	data-selectable
	data-id={id || href}
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
		<!-- Left icon / Favicon / Bookmark Button area -->
		{#if icon || onbookmark || bookmarked}
			<div class="akui-feed-item-row-left-aside" class:has-no-icon={!icon}>
				{#if onbookmark || bookmarked}
					<button
						type="button"
						class="akui-feed-item-row-bookmark-btn"
						class:bookmarked
						onclick={handleBookmarkClick}
						onfocus={() => (isButtonFocused = true)}
						onblur={() => (isButtonFocused = false)}
						aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
					>
						<Icon
							name={bookmarked ? 'bookmark-fill' : 'bookmark'}
							size={16}
							colour="currentColor"
						/>
					</button>
				{/if}

				{#if icon}
					<div
						class="akui-feed-item-row-icon"
						class:hidden-for-bookmark={bookmarked || isButtonFocused}
					>
						{#if typeof icon === 'string'}
							<Icon name={icon} size={16} />
						{:else}
							<div class="akui-feed-item-row-icon-inner">
								{@render icon()}
							</div>
						{/if}
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
					<h4 class="akui-feed-item-row-title">
						{#if href}
							<a
								{href}
								class="akui-feed-item-row-link"
								onclick={handleClick}
								onauxclick={handleAuxClick}
								target={isExternal ? '_blank' : undefined}
								rel={isExternal ? 'noopener noreferrer' : undefined}
								aria-current={active ? 'true' : undefined}
							>
								{title}
							</a>
						{:else}
							<span class="akui-feed-item-row-title-text">{title}</span>
						{/if}
					</h4>
				{/if}
				<span class="akui-feed-item-row-time">{time || ''}</span>
			</div>

			{#if tag}
				<h4 class="akui-feed-item-row-title">
					{#if href}
						<a
							{href}
							class="akui-feed-item-row-link"
							onclick={handleClick}
							onauxclick={handleAuxClick}
							target={isExternal ? '_blank' : undefined}
							rel={isExternal ? 'noopener noreferrer' : undefined}
							aria-current={active ? 'true' : undefined}
						>
							{title}
						</a>
					{:else}
						<span class="akui-feed-item-row-title-text">{title}</span>
					{/if}
				</h4>
			{/if}

			{#if excerpt}
				<p class="akui-feed-item-row-excerpt">{excerpt}</p>
			{/if}
		</div>

		<!-- Compact Thumbnail (Side) -->
		{#if layout === 'compact' && image}
			<div
				class="akui-feed-item-row-image"
				style:aspect-ratio={layout === 'compact' ? '1 / 1' : ratio}
			>
				{#if typeof image === 'string'}
					<DynamicImage src={image} alt="" {fit} />
				{:else}
					{@render image()}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.akui-feed-item-row {
		display: block;
		padding: var(--akui-space-m);
		text-decoration: none !important; /* Bespoke link: no underline */
		color: var(--akui-fg);
		background-color: var(--akui-bg, #ffffff);
		transition:
			background-color 0.15s ease,
			box-shadow 0.15s ease;
		outline: none;
		position: relative;
		cursor: pointer;
		user-select: none;
		scroll-margin-top: 64px;
	}

	.akui-feed-item-row::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background-color: var(--akui-bg-accent, #2563eb);
		opacity: 0;
		transition: opacity 0.15s ease;
		z-index: 2;
	}

	.akui-feed-item-row:hover::before,
	.akui-feed-item-row:focus-within::before {
		opacity: 1;
	}

	.akui-feed-item-row:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-feed-item-row.active {
		background-color: var(--akui-bg-secondary);
	}

	.akui-feed-item-row.bookmarked {
		background-color: rgba(255, 193, 7, 0.05);
	}

	:global([data-theme='dark']) .akui-feed-item-row {
		background-color: var(--akui-bg, #1a1a1a);
	}

	:global([data-theme='dark']) .akui-feed-item-row.bookmarked {
		background-color: rgba(255, 193, 7, 0.02);
	}

	.akui-feed-item-row:focus-within {
		background-color: var(--akui-bg-hover);
	}

	.akui-feed-item-row-link,
	.akui-feed-item-row-link:hover,
	.akui-feed-item-row-link:focus,
	.akui-feed-item-row-link:active,
	.akui-feed-item-row-link:visited {
		display: block;
		color: inherit;
		text-decoration: none !important;
		outline: none;
	}

	.akui-feed-item-row-link::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		transition: box-shadow 0.15s ease;
	}

	.akui-feed-item-row-link:focus-visible {
		outline: none;
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
		gap: 0;
		align-items: flex-start;
	}

	.akui-feed-item-row-left-aside {
		position: relative;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		margin-top: var(--akui-space-xs);
		margin-right: var(--akui-space-m);
		z-index: 2;
		transition:
			width 0.2s ease,
			margin-right 0.2s ease,
			opacity 0.2s ease;
	}

	.akui-feed-item-row-left-aside.has-no-icon {
		width: 0;
		margin-right: 0;
		opacity: 0;
		overflow: hidden;
	}

	.akui-feed-item-row.hover-left .akui-feed-item-row-left-aside.has-no-icon,
	.akui-feed-item-row.bookmarked .akui-feed-item-row-left-aside.has-no-icon,
	.akui-feed-item-row-left-aside.has-no-icon:has(*:focus-visible) {
		width: 16px;
		margin-right: var(--akui-space-m);
		opacity: 1;
		overflow: visible;
	}

	.akui-feed-item-row-bookmark-btn {
		position: absolute;
		left: 0;
		top: 0;
		width: 16px;
		height: 16px;
		border: none;
		background: transparent;
		color: var(--akui-fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transform: scale(0.8);
		transition:
			opacity 0.2s ease,
			transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
			color 0.15s ease;
		outline: none;
		pointer-events: none;
		padding: 0;
		--akui-gold: #b58100;
	}

	:global([data-theme='dark']) .akui-feed-item-row-bookmark-btn {
		--akui-gold: #fbbf24;
	}

	.akui-feed-item-row-bookmark-btn:hover {
		color: var(--akui-gold);
	}

	.akui-feed-item-row-bookmark-btn:focus-visible {
		outline: 2px solid var(--akui-bg-accent, #2563eb);
		outline-offset: 2px;
		border-radius: 2px;
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}

	.akui-feed-item-row-bookmark-btn:active {
		transform: scale(0.9);
	}

	.akui-feed-item-row-bookmark-btn.bookmarked {
		color: var(--akui-gold);
	}

	.akui-feed-item-row.hover-left .akui-feed-item-row-bookmark-btn,
	.akui-feed-item-row.bookmarked .akui-feed-item-row-bookmark-btn {
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}

	.akui-feed-item-row-icon {
		position: absolute;
		left: 0;
		top: 0;
		width: 16px;
		height: 16px;
		opacity: 0.7;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.akui-feed-item-row-icon.hidden-for-bookmark,
	.akui-feed-item-row.hover-left .akui-feed-item-row-icon,
	.akui-feed-item-row.bookmarked .akui-feed-item-row-icon {
		opacity: 0;
		transform: scale(0.8);
		pointer-events: none;
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
		font-size: var(--akui-font-size-xs, 0.725rem);
		color: var(--akui-fg-secondary);
		gap: var(--akui-space-m);
	}

	.akui-feed-item-row-tag {
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-right: var(--akui-space-s);
		opacity: 0.85;
	}

	.akui-feed-item-row-time {
		white-space: nowrap;
		flex-shrink: 0;
		opacity: 0.8;
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
		transition: color 0.2s ease;
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
		margin-left: var(--akui-space-m);
	}

	.akui-feed-item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
