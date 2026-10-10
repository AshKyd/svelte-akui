<script lang="ts">
	import { type Snippet } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import Button from '../Button/Button.svelte';
	import Icon from '../Icon/Icon.svelte';
	import { surfaceStyle, type SurfaceStyle } from '../../utils/surface.js';

	interface Props {
		/** Whether searching mode is currently active. */
		isSearching?: boolean;
		/** The current active search query string. */
		searchQuery?: string;
		/** Placeholder text displayed inside the search input. */
		placeholder?: string;
		/** Debounce delay in milliseconds before updating searchQuery. Defaults to 200ms. */
		debounce?: number;
		/** Mode of display: 'takeover' overlays the parent header with an animation, 'inline' displays as a standard element. */
		mode?: 'takeover' | 'inline';
		/** Optional custom snippet to render on the leading side of the input. Defaults to a search icon. */
		prefix?: Snippet;
		/** Optional custom snippet to render between the input and the close button. */
		suffix?: Snippet;
		/** Callback triggered whenever the debounced search query changes. */
		onsearch?: (query: string) => void;
		/** Callback triggered when search mode is activated or deactivated. */
		onsearchtoggle?: (isSearching: boolean) => void;
		/**
		 * Overrides the bar's background, text colour and border colour. `backdropFilter` is ignored:
		 * a blur nested inside the Header's own blur would only see the Header, not what is behind it.
		 * In 'takeover' mode the bar is drawn over the Header's content, so with a translucent `background` the consumer must hide that content while searching.
		 */
		surface?: SurfaceStyle;
		/** Additional CSS classes for the container. */
		class?: string;
	}

	let {
		isSearching = $bindable(false),
		searchQuery = $bindable(''),
		placeholder = 'Search...',
		debounce = 200,
		mode = 'takeover',
		prefix,
		suffix,
		onsearch,
		onsearchtoggle,
		surface,
		class: className = ''
	}: Props = $props();

	const barStyle = $derived(surfaceStyle('header-search', { ...surface, backdropFilter: undefined }));

	let inputElement = $state<HTMLInputElement | null>(null);
	let localValue = $state(searchQuery);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		localValue = searchQuery;
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		localValue = target.value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchQuery = localValue;
			onsearch?.(localValue);
		}, debounce);
	}

	function deactivateSearch() {
		localValue = '';
		searchQuery = '';
		isSearching = false;
		onsearch?.('');
		onsearchtoggle?.(false);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			deactivateSearch();
		}
	}

	$effect(() => {
		if (isSearching) {
			inputElement?.focus();
		}
	});

	function clipSearchTakeover(node: HTMLElement, { duration = 280 } = {}) {
		if (mode !== 'takeover') {
			return { duration: 0, css: () => '' };
		}
		return {
			duration,
			css: (t: number) => {
				const eased = cubicInOut(t);
				return `clip-path: circle(${eased * 150}% at calc(100% - 40px) 50%);`;
			}
		};
	}
</script>

{#if isSearching || mode === 'inline'}
	<div
		class="akui-header-search {mode} {className}"
		style={barStyle}
		transition:clipSearchTakeover
		role="search"
	>
		<div class="akui-header-search-inner">
			{#if prefix}
				{@render prefix()}
			{:else}
				<div class="akui-header-search-icon">
					<Icon name="search" size={16} />
				</div>
			{/if}

			<input
				bind:this={inputElement}
				type="text"
				{placeholder}
				value={localValue}
				oninput={handleInput}
				onkeydown={handleKeydown}
				class="akui-header-search-input bespoke"
				aria-label={placeholder}
			/>

			{#if suffix}
				<div class="akui-header-search-suffix">
					{@render suffix()}
				</div>
			{/if}

			<Button
				variant="ghost"
				icon="x-lg"
				iconPosition="only"
				onclick={deactivateSearch}
				aria-label="Close search"
				class="akui-header-search-close"
			/>
		</div>
	</div>
{/if}

<style>
	.akui-header-search {
		background-color: var(--akui-header-search-bg, var(--akui-bg-surface));
		color: var(--akui-header-search-fg, var(--akui-fg));
		box-sizing: border-box;
	}

	.akui-header-search.takeover {
		position: absolute;
		inset: 0;
		border-bottom: 1px solid var(--akui-header-search-border, var(--akui-border-input));
		z-index: 10;
		display: flex;
		align-items: center;
	}

	.akui-header-search.inline {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.akui-header-search-inner {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
		gap: var(--akui-space-s);
		padding: 0 var(--akui-space-m);
		box-sizing: border-box;
	}

	.akui-header-search-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--akui-fg-secondary);
		opacity: 0.7;
		flex-shrink: 0;
	}

	.akui-header-search-input {
		flex: 1;
		min-width: 0;
		border: none !important;
		background: transparent !important;
		color: var(--akui-header-search-fg, var(--akui-fg)) !important;
		font-size: 1rem;
		height: 100%;
		outline: none !important;
		box-shadow: none !important;
		padding: 0;
	}

	.akui-header-search-input:focus,
	.akui-header-search-input:focus-visible {
		outline: none !important;
		border: none !important;
		box-shadow: none !important;
	}

	.akui-header-search-input::placeholder {
		color: var(--akui-fg-secondary);
		opacity: 0.7;
	}

	.akui-header-search-suffix {
		display: flex;
		align-items: center;
		gap: var(--akui-space-xs);
		flex-shrink: 0;
	}

	:global(.akui-header-search-close) {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	/* Background removed from this dark override: it re-applied --akui-bg and defeated `surface`. */
	:global([data-theme='dark']) .akui-header-search {
		border-bottom-color: var(--akui-header-search-border, rgba(255, 255, 255, 0.05));
	}
</style>
