<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { THREAD_CONTEXT, type ThreadState } from './threadItemContext.js';

	interface Props {
		/** The top-level `ThreadItem`s. */
		children: Snippet;
		/** Let the thread lines and expand buttons collapse items. When off (the default), the lines are plain decoration with no interaction. Each `ThreadItem` can override it. */
		collapsible?: boolean;
		/** `small` is compact, `medium` is airy like Slack, `large` is roomy like WordPress comments. */
		size?: 'small' | 'medium' | 'large';
		/** Overrides the size's avatar diameter (and avatar column width). Any CSS length. */
		avatarSize?: string;
		/** Overrides the size's space between the avatar column and the message. Any CSS length. */
		gap?: string;
	}

	let { children, collapsible = false, size = 'medium', avatarSize, gap }: Props = $props();

	setContext<ThreadState>(THREAD_CONTEXT, {
		get collapsible() {
			return collapsible;
		}
	});
</script>

<!-- Geometry is set as CSS variables (small defaults live in theme.css) so the lines in nested `ThreadItem`s stay aligned. -->
<ul class={['akui-thread', size]} style:--akui-thread-avatar={avatarSize} style:--akui-thread-gap={gap}>
	{@render children()}
</ul>

<style>
	/* Click areas are stacked by nesting depth with z-index; isolate so those never leak above the page. */
	.akui-thread {
		isolation: isolate;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* `small` uses the theme.css defaults. */
	.akui-thread.medium {
		--akui-thread-avatar: 2.75rem;
		--akui-thread-gap: 0.75rem;
		--akui-thread-spacing: 1rem;
		--akui-thread-dot: 0.625rem;
		--akui-thread-font-size: 1rem;
	}

	.akui-thread.large {
		--akui-thread-avatar: 4rem;
		--akui-thread-gap: 1.25rem;
		--akui-thread-line-width: 3px;
		--akui-thread-spacing: 1.75rem;
		--akui-thread-dot: 0.875rem;
		--akui-thread-font-size: 1.125rem;
	}
</style>
