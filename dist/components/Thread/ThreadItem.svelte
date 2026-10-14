<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		THREAD_CONTEXT,
		THREAD_ITEM_CONTEXT,
		type ThreadItemState,
		type ThreadState
	} from './threadItemContext.js';
	import { motion } from '../../hooks/reducedMotion.svelte.js';
	import Icon from '../Icon/Icon.svelte';
	import Avatar, { type AvatarProps } from '../Avatar/Avatar.svelte';
	import ThreadLine from './ThreadLine.svelte';

	interface Props {
		/** Avatar props, or a snippet that renders your own. Omit for a dot (a threaded post). */
		avatar?: AvatarProps | Snippet;
		/** Offset this item under its parent, with an L-shaped line. Otherwise it sits directly below, on a straight line. */
		indent?: boolean;
		/** Whether the thread lines and the expand button can collapse this item. Defaults to the enclosing `Thread`'s `collapsible`. When off, the lines are plain decoration. */
		collapsible?: boolean;
		/** Whether this item is folded to the first row of its `Message`, hiding the rest and its replies. Clicking the line that connects to it toggles it. Ignored unless collapsible. */
		collapsed?: boolean;
		/** How many replies are hidden, for the expand button's label. Callers know their own data. */
		replyCount?: number;
		/** Label for the expand button when collapsed. Defaults to one built from `replyCount`. */
		collapsedLabel?: string;
		/** Names this item's thread line for screen readers, e.g. "reply from Mabel". Defaults to "thread". */
		lineLabel?: string;
		/** The item's `Message`. */
		children: Snippet;
		/** Nested `ThreadItem`s. */
		replies?: Snippet;
	}

	let {
		avatar,
		indent = false,
		collapsible,
		collapsed = $bindable(false),
		replyCount,
		collapsedLabel,
		lineLabel,
		children,
		replies
	}: Props = $props();

	let lineHovered = $state(false);
	let lineFocused = $state(false);

	const threadState = getContext<ThreadState | undefined>(THREAD_CONTEXT);
	const isCollapsible = $derived(collapsible ?? threadState?.collapsible ?? false);
	/** Not collapsible means never collapsed, whatever `collapsed` says. */
	const isCollapsed = $derived(isCollapsible && collapsed);

	// Lets the `Message` rendered in `children` fold itself down to its header row when collapsed.
	setContext<ThreadItemState>(THREAD_ITEM_CONTEXT, {
		get collapsed() {
			return isCollapsed;
		}
	});

	/**
	 * Distance in px from the top of whatever this item's line leads back to, to the top of this
	 * item: the previous sibling, or for a first reply the parent item. Undefined for root items.
	 * The connector uses it to reach back up to that avatar's centre. CSS can't know a sibling's
	 * height, so it's measured.
	 */
	let previousSiblingDistance = $state<number>();

	/**
	 * Whether the previous sibling is indented, so its elbow curves away from the trunk just above
	 * its avatar centre. This item's line has to start above that curve to leave no gap.
	 */
	let previousSiblingHasElbow = $state(false);

	/**
	 * Attachment that re-measures when the item above resizes (collapse, new replies, slide
	 * transitions) or when siblings are added or removed.
	 */
	function trackPreviousSibling(self: HTMLLIElement) {
		const parent = self.parentElement;
		if (!parent?.classList.contains('akui-thread-replies')) return;
		let resizeObserver: ResizeObserver | undefined;

		function track() {
			resizeObserver?.disconnect();
			const previous = self.previousElementSibling as HTMLElement | null;
			// A first reply leads back to its parent's avatar, so watch the parent's own row.
			const parentItem = parent?.parentElement;
			const parentRow = parentItem?.querySelector<HTMLElement>(':scope > .akui-thread-body');
			const watched = previous ?? parentRow;
			const above = previous ?? parentItem;
			// Bounding rects, not `offsetTop`: that rounds to whole pixels, which leaves the lines a
			// pixel out when text heights are fractional.
			const measure = () => {
				previousSiblingDistance = above
					? self.getBoundingClientRect().top - above.getBoundingClientRect().top
					: undefined;
				previousSiblingHasElbow = Boolean(previous?.classList.contains('indent'));
			};
			if (watched) {
				resizeObserver = new ResizeObserver(measure);
				resizeObserver.observe(watched);
			}
			measure();
		}

		const mutationObserver = new MutationObserver(track);
		mutationObserver.observe(parent, { childList: true });
		track();

		return () => {
			resizeObserver?.disconnect();
			mutationObserver.disconnect();
		};
	}

	const hasVisibleReplies = $derived(Boolean(replies) && !isCollapsed);
	const avatarProps = $derived(typeof avatar === 'object' ? avatar : undefined);
	const stubLabel = $derived(
		collapsedLabel ??
			(replyCount
				? `Show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
				: 'Show message')
	);

	function toggle() {
		collapsed = !collapsed;
		lineHovered = false;
	}
</script>

<li
	{@attach trackPreviousSibling}
	class={[
		'akui-thread-item',
		indent && 'indent',
		!avatar && 'has-dot',
		previousSiblingDistance !== undefined && 'has-previous',
		previousSiblingHasElbow && 'after-elbow',
		isCollapsed && 'collapsed',
		lineHovered && 'line-hover',
		lineFocused && 'line-focus'
	]}
	style:--_previous-distance={previousSiblingDistance === undefined
		? undefined
		: `${previousSiblingDistance}px`}
>
	<!-- The line running up from this item's avatar or dot (only shown for replies). It belongs to this item. Only a button when collapsible. -->
	<div class="akui-thread-connector">
		{#if isCollapsible}
			<div class="akui-thread-hit">
				<ThreadLine
					collapsed={isCollapsed}
					label={lineLabel}
					ontoggle={toggle}
					onhover={(hovered) => (lineHovered = hovered)}
					onfocusvisible={(focused) => (lineFocused = focused)}
				/>
			</div>
		{/if}
	</div>

	<div class="akui-thread-avatar-column">
		{#if isCollapsed}
			<div class="akui-thread-avatar-slot">
				<button
					type="button"
					class="akui-thread-expand"
					aria-label={stubLabel}
					title={stubLabel}
					onclick={toggle}
				>
					<Icon name="plus-lg" size={12} />
				</button>
			</div>
		{:else if typeof avatar === 'function'}
			<div class="akui-thread-avatar-slot">{@render avatar()}</div>
		{:else if avatarProps}
			<div class="akui-thread-avatar-slot"><Avatar size="var(--akui-thread-avatar)" {...avatarProps} /></div>
		{:else}
			<div class="akui-thread-avatar-slot dot"><span class="akui-thread-dot"></span></div>
		{/if}
	</div>

	<div class="akui-thread-body">
		{@render children()}
	</div>

	{#if hasVisibleReplies}
		<ul class="akui-thread-replies" transition:slide={motion({ duration: 200 })}>
			{@render replies?.()}
		</ul>
	{/if}
</li>

<style>
	/*
	 * Lines are pure CSS, centred on the avatar column, and always drawn *back* from the item
	 * that owns them: each reply's connector runs up from its own avatar or dot to the previous
	 * sibling's avatar centre (or the parent's, for the first reply). Nothing is ever drawn below
	 * an avatar by that avatar's own item, so a line can never highlight or collapse the wrong item.
	 * - direct reply: a straight line into its dot.
	 * - indented reply: an L elbow into its avatar. Because it runs up past the previous
	 *   sibling's own elbow, the parent visibly branches to each reply.
	 * Owning the whole line means clicking it collapses exactly that item.
	 * How far up to reach depends on the previous sibling's height, which CSS can't know, so the
	 * script measures it into `--_previous-distance` (see `previousSiblingDistance`).
	 * Hovering a thread line recolours only that line.
	 */
	.akui-thread-item {
		/* Nesting depth, used to stack deeper items' click areas above shallower ones. */
		--_d: calc(var(--_pd, 0) + 1);
		--_a: var(--akui-thread-avatar);
		--_w: var(--akui-thread-line-width);
		/* Half an avatar plus the gap, so a nested avatar starts just past its parent's trunk line, not past the parent's whole avatar. */
		--_indent: calc(var(--akui-thread-avatar) / 2 + var(--akui-thread-gap));
		--_line: var(--akui-thread-line-colour, var(--akui-border-input));
		--_dot: var(--akui-thread-line-colour, var(--akui-border-input));
		position: relative;
		display: grid;
		grid-template-columns: var(--_a) minmax(0, 1fr);
		column-gap: var(--akui-thread-gap);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Only this item's own connector. `--_line` is redeclared by each item, so it doesn't reach nested items. */
	.akui-thread-item.line-hover {
		--_line: var(--akui-fg-secondary);
	}

	.akui-thread-item.line-focus {
		--_line: var(--akui-bg-accent);
	}

	.akui-thread-item.indent {
		margin-left: var(--_indent);
	}

	/* Avatar column */
	.akui-thread-avatar-column {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Above this depth's click areas (2d), below the next depth's (2d + 2). */
	.akui-thread-avatar-slot {
		position: relative;
		z-index: calc(var(--_d) * 2 + 1);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--_a);
		height: var(--_a);
	}

	/* Dots must not block clicks on the thread line running through them. */
	.akui-thread-avatar-slot.dot {
		pointer-events: none;
	}

	/* Replaces the avatar or dot while collapsed. Centred on the same point, so lines still meet it. */
	.akui-thread-expand {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		border: var(--_w) solid var(--_line);
		border-radius: 50%;
		background: var(--akui-bg);
		color: var(--akui-fg-secondary);
		cursor: pointer;
		outline: none;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease,
			transform 0.1s ease;
	}

	/* No outline; keyboard focus looks like hover. */
	.akui-thread-expand:hover,
	.akui-thread-expand:focus-visible {
		border-color: var(--akui-fg-secondary);
		background: var(--akui-bg-hover);
		color: var(--akui-fg);
	}

	/* Pressed: accent fill and a small shrink. */
	.akui-thread-expand:active {
		border-color: var(--akui-bg-accent);
		background: var(--akui-bg-accent);
		color: var(--akui-fg-accent);
		transform: scale(0.88);
	}

	.akui-thread-dot {
		width: var(--akui-thread-dot);
		height: var(--akui-thread-dot);
		border-radius: 50%;
		background: var(--_dot);
	}

	/* Body */
	/* Centred on the avatar row, so a collapsed header row lines up with the expand circle. A taller expanded message fills the row anyway. */
	.akui-thread-body {
		align-self: center;
		min-width: 0;
		padding-bottom: var(--akui-thread-spacing);
		transition: padding-bottom 0.2s ease;
	}

	/* Collapsed: the `Message` folds itself down to its header row (see `THREAD_ITEM_CONTEXT`). */
	.akui-thread-item.collapsed > .akui-thread-body {
		padding-bottom: 0;
	}
	/* Replies */
	.akui-thread-replies {
		--_pd: var(--_d);
		grid-column: 1 / -1;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Connectors */

	/* Root items have no line leading to them. */
	.akui-thread-connector {
		display: none;
	}

	/*
	 * Drawn from the avatar centre above (top) down to this item's avatar centre (bottom). Until
	 * that has been measured it starts at the top of the item.
	 */
	:global(.akui-thread-replies) > .akui-thread-item > .akui-thread-connector {
		display: block;
		position: absolute;
		top: 0;
		bottom: calc(100% - var(--_a) / 2);
		left: calc(var(--_a) / 2 - var(--_w) / 2);
		width: var(--_w);
		background: var(--_line);
		pointer-events: none;
	}

	/* Indented: an L whose corner meets the avatar (or dot centre) */
	:global(.akui-thread-replies) > .akui-thread-item.indent > .akui-thread-connector {
		bottom: calc(100% - var(--_a) / 2 - var(--_w) / 2);
		left: calc(var(--_a) / 2 - var(--_w) / 2 - var(--_indent));
		width: calc(var(--_indent) - var(--_a) / 2 + var(--_w) / 2);
		box-sizing: border-box;
		background: none;
		border-left: var(--_w) solid var(--_line);
		border-bottom: var(--_w) solid var(--_line);
		border-bottom-left-radius: var(--akui-radius-m);
	}

	/* Keyboard focus: the line turns dashed. Straight lines swap their fill for a dashed border to match elbows. */
	:global(.akui-thread-replies) > .akui-thread-item.line-focus > .akui-thread-connector {
		box-sizing: border-box;
		background: none;
		border-left: var(--_w) dashed var(--_line);
	}

	:global(.akui-thread-replies) > .akui-thread-item.indent.line-focus > .akui-thread-connector {
		border-bottom-style: dashed;
	}

	/* An elbow into a dot runs on to the dot's centre, not just the edge of the avatar column. */
	:global(.akui-thread-replies) > .akui-thread-item.indent.has-dot > .akui-thread-connector {
		width: calc(var(--_indent) + var(--_w) / 2);
	}

	/*
	 * Click area: a strip centred on the connector's vertical line. The horizontal part of an
	 * elbow is not clickable. Stacked by depth so a nested item's line wins where lines overlap
	 * (a direct reply's line runs straight past the previous sibling's own replies).
	 */
	.akui-thread-hit {
		position: absolute;
		z-index: calc(var(--_d) * 2);
		top: 0;
		bottom: 0;
		left: calc((var(--_w) - 0.8rem) / 2);
		width: 0.8rem;
		pointer-events: auto;
	}

	/*
	 * An elbow is clickable along its whole L: the vertical strip plus the horizontal strip into the
	 * avatar. One button, shaped with `clip-path` so the empty corner inside the L isn't clickable.
	 * The box runs to the connector's right edge and extends below it by half the extra strip height.
	 */
	:global(.akui-thread-replies) > .akui-thread-item.indent > .akui-thread-connector > .akui-thread-hit {
		right: 0;
		bottom: calc((var(--_w) - 0.8rem) / 2);
		width: auto;
		clip-path: polygon(
			0 0,
			0.8rem 0,
			0.8rem calc(100% - 0.8rem),
			100% calc(100% - 0.8rem),
			100% 100%,
			0 100%
		);
	}

	/* Reach up to the avatar centre of the previous sibling (or the parent, for a first reply). */
	:global(.akui-thread-replies) > .akui-thread-item.has-previous > .akui-thread-connector {
		top: calc(var(--_previous-distance) * -1 + var(--_a) / 2);
	}

	/*
	 * A hovered or focused line paints above neighbouring lines, so where a later sibling's line
	 * overlaps it (the shared trunk) the highlight isn't covered. Still below click areas and avatars (2 and up).
	 */
	:global(.akui-thread-replies) > .akui-thread-item.line-hover > .akui-thread-connector,
	:global(.akui-thread-replies) > .akui-thread-item.line-focus > .akui-thread-connector {
		z-index: 1;
	}

	/* The previous sibling's elbow starts curving away one radius above its centre, so overlap that. */
	:global(.akui-thread-replies) > .akui-thread-item.has-previous.after-elbow > .akui-thread-connector {
		top: calc(var(--_previous-distance) * -1 + var(--_a) / 2 - var(--akui-radius-m));
	}
</style>
