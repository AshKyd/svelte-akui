<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** Svelte snippet for the left-aligned navigation (e.g. menu button). */
		navigation?: Snippet;
		/** Svelte snippet for the app brand/title/logo. */
		title?: Snippet;
		/** Svelte snippet for header actions (right-aligned). */
		actions?: Snippet;
		/** Whether the header is pinned/sticky to the top of the viewport. */
		pinned?: boolean;
		/** Called when the empty background area is clicked (e.g. the gap between the title and actions) — not the navigation, title or actions content itself. */
		onclick?: () => void;
		/** Additional CSS classes for the header. */
		class?: string;
	}

	let {
		navigation,
		title,
		actions,
		pinned = true,
		onclick,
		class: className = ''
	}: Props = $props();

	// Fires onclick only for a direct hit on the empty background, not a bubble from
	// interactive content inside the navigation/title/actions snippets.
	function handleBackgroundClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onclick?.();
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<header class="akui-header {className}" class:pinned onclick={handleBackgroundClick}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="akui-header-left" onclick={handleBackgroundClick}>
		{#if navigation}
			<div class="akui-header-navigation">
				{@render navigation()}
			</div>
		{/if}

		{#if title}
			<div class="akui-header-title">
				{@render title()}
			</div>
		{/if}
	</div>

	{#if actions}
		<div class="akui-header-actions">
			{@render actions()}
		</div>
	{/if}
</header>

<style>
	.akui-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 4rem;
		padding: 0 var(--akui-space-m);
		background-color: var(--akui-bg);
		color: var(--akui-fg);
		border-bottom: 1px solid var(--akui-border-input);
		box-sizing: border-box;
		width: 100%;
		position: relative;
		flex-shrink: 0;
	}

	.akui-header.pinned {
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.akui-header-left {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
		min-width: 0;
		flex: 1;
		overflow: hidden;
	}

	.akui-header-title {
		font-weight: 600;
		font-size: 1.125rem;
		display: flex;
		align-items: center;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.akui-header-actions {
		display: flex;
		align-items: center;
		gap: var(--akui-space-s);
	}

	@media (max-width: 768px) {
		.akui-header {
			height: 3.5rem;
			padding: 0 var(--akui-space-s);
		}
	}
</style>
