<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import RelativeTime from '../../RelativeTime/RelativeTime.svelte';
	import { THREAD_ITEM_CONTEXT, type ThreadItemState } from '../threadItemContext.js';

	interface Props {
		/** Display name of the author. */
		name: string;
		/** Handle shown beside the name, e.g. `@bramble`. */
		username?: string;
		/** When the message was posted. Rendered with `RelativeTime`. */
		date?: Date | number | string;
		/** Extra controls on the right of the header row, e.g. a menu button. */
		headerControls?: Snippet;
		/** The message contents. */
		children?: Snippet;
		/** Interaction controls under the contents, e.g. reply and like buttons. */
		controls?: Snippet;
	}

	let { name, username, date, headerControls, children, controls }: Props = $props();

	// Set by the enclosing `ThreadItem`. Absent when a `Message` is used on its own.
	const itemState = getContext<ThreadItemState | undefined>(THREAD_ITEM_CONTEXT);
	const collapsed = $derived(itemState?.collapsed ?? false);
</script>

<article class="akui-message">
	<!-- A grid of its own, so the contents below can't widen the header's columns. -->
	<div class="akui-message-header">
		<span class="akui-message-name" title={name}>{name}</span>
		<span class="akui-message-username" title={username}>{username}</span>
		<span class="akui-message-date">
			{#if date !== undefined}<RelativeTime {date} />{/if}
		</span>
		<span class="akui-message-header-controls">{@render headerControls?.()}</span>
	</div>

	<!--
		Everything below the header row. When the enclosing `ThreadItem` is collapsed it shrinks to
		nothing and fades out, and `inert` keeps its controls out of the tab order.
	-->
	{#if children || controls}
		<div class={['akui-message-extra', collapsed && 'collapsed']} inert={collapsed}>
			<div class="akui-message-extra-inner">
				{#if children}
					<div class="akui-message-contents">{@render children()}</div>
				{/if}
				{#if controls}
					<div class="akui-message-controls">{@render controls()}</div>
				{/if}
			</div>
		</div>
	{/if}
</article>

<style>
	.akui-message {
		min-width: 0;
		font-size: var(--akui-thread-font-size, 0.875rem);
		/* Half the avatar, so the header row plus the first line of contents are as tall as the avatar beside them. */
		line-height: calc(var(--akui-thread-avatar, 2.25rem) / 2);
		color: var(--akui-fg);
	}

	/* Name and username shrink (with ellipsis) before the date or controls do. */
	.akui-message-header {
		display: grid;
		grid-template-columns: minmax(0, max-content) minmax(0, max-content) auto 1fr;
		align-items: center;
		column-gap: var(--akui-space-s);
	}

	.akui-message-name,
	.akui-message-username {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.akui-message-name {
		font-weight: 600;
	}

	.akui-message-username,
	.akui-message-date {
		font-size: 0.9em;
		color: var(--akui-fg-secondary);
	}

	.akui-message-date {
		white-space: nowrap;
	}

	.akui-message-header-controls {
		justify-self: end;
		display: inline-flex;
		align-items: center;
		gap: var(--akui-space-xs);
	}

	/* 0fr to 1fr animates the height without knowing it. The gap lives inside so it collapses too. */
	.akui-message-extra {
		display: grid;
		grid-template-rows: 1fr;
		transition:
			grid-template-rows 0.2s ease,
			opacity 0.2s ease,
			visibility 0s;
	}

	/* `visibility` flips after the animation, so nothing hidden can show through. */
	.akui-message-extra.collapsed {
		grid-template-rows: 0fr;
		opacity: 0;
		visibility: hidden;
		transition-delay: 0s, 0s, 0.2s;
	}

	.akui-message-extra-inner {
		display: grid;
		row-gap: calc(var(--akui-thread-spacing, 0.5rem) / 2);
		min-height: 0;
		padding-top: 0;
		overflow: hidden;
	}

	.akui-message-contents,
	.akui-message-controls {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.akui-message-controls {
		display: flex;
		align-items: center;
		gap: var(--akui-space-xs);
	}
</style>
