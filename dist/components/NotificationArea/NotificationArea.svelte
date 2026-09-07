<script lang="ts">
	import { type Snippet } from 'svelte';
	import NotificationCard from './NotificationCard.svelte';
	import { type NotificationItem } from './types.js';

	interface Props {
		/** The notifications to show, oldest first. */
		items: NotificationItem[];
		/** Remove a notification: fired on timeout, the × button, Escape, or after an action runs. */
		onDismiss?: (id: string) => void;
		/** Accessible name for the region landmark. */
		label?: string;
		/** Where the stack sits. `inline` drops it into normal flow (for embedding and stories). */
		position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';
		/** Render at most this many; older ones are hidden, not dismissed. */
		max?: number;
		/** Per-item render override — replaces the default message body. */
		children?: Snippet<[{ item: NotificationItem }]>;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes onto the region. */
		[key: string]: unknown;
	}

	let {
		items,
		onDismiss,
		label = 'Notifications',
		position = 'bottom-right',
		max,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	let region = $state<HTMLElement>();
	let hovering = $state(false);
	let focusWithin = $state(false);

	/** Freeze every timer and countdown bar while the user is reading or interacting (WCAG 2.2.1). */
	const paused = $derived(hovering || focusWithin);

	const visibleItems = $derived(max && max > 0 ? items.slice(-max) : items);

	// A live region kept in the DOM at all times so screen readers pick up later additions
	// (WCAG 4.1.3). It is separate from the interactive list, which live regions expose poorly.
	let politeMessage = $state('');
	let assertiveMessage = $state('');
	let seen = new Set<string>();
	let clearTimer: ReturnType<typeof setTimeout> | undefined;

	function announcementText(item: NotificationItem): string {
		if (item.announce) return item.announce;
		const messageText = typeof item.message === 'string' ? item.message : undefined;
		return [item.title, messageText].filter(Boolean).join('. ');
	}

	$effect(() => {
		const currentIds = new Set(items.map((item) => item.id));
		seen = new Set([...seen].filter((id) => currentIds.has(id)));

		const fresh = items.filter((item) => !seen.has(item.id));
		if (fresh.length === 0) return;

		fresh.forEach((item) => seen.add(item.id));

		const urgent = fresh.filter((item) => item.variant === 'warning' || item.variant === 'error');
		const calm = fresh.filter((item) => item.variant !== 'warning' && item.variant !== 'error');
		if (urgent.length) assertiveMessage = urgent.map(announcementText).join('. ');
		if (calm.length) politeMessage = calm.map(announcementText).join('. ');

		// Blank the regions shortly after so an identical follow-up notification is re-announced.
		clearTimeout(clearTimer);
		clearTimer = setTimeout(() => {
			politeMessage = '';
			assertiveMessage = '';
		}, 1000);
	});

	// Drop the pending blank timer only when the component goes away.
	$effect(() => () => clearTimeout(clearTimer));

	function handleFocusOut(event: FocusEvent) {
		if (!region?.contains(event.relatedTarget as Node | null)) focusWithin = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-notification-id]');
		const id = card?.dataset.notificationId;
		if (!id) return;
		onDismiss?.(id);
		region?.focus();
	}
</script>

<section
	bind:this={region}
	class="akui-notification-area {position} {className}"
	role="region"
	aria-label={label}
	tabindex="-1"
	onpointerenter={() => (hovering = true)}
	onpointerleave={() => (hovering = false)}
	onfocusin={() => (focusWithin = true)}
	onfocusout={handleFocusOut}
	onkeydown={handleKeydown}
	{...rest}
>
	{#if visibleItems.length > 0}
		<!-- role="list" keeps list semantics in Safari/VoiceOver despite `list-style: none`. -->
		<ol class="akui-notification-list" role="list">
			{#each visibleItems as item (item.id)}
				<li>
					<NotificationCard
						{item}
						{paused}
						onExpire={(id) => onDismiss?.(id)}
						onDismiss={(id) => onDismiss?.(id)}
						itemSnippet={children}
					/>
				</li>
			{/each}
		</ol>
	{/if}

	<div class="akui-sr-only" role="status" aria-live="polite" aria-atomic="true">{politeMessage}</div>
	<div class="akui-sr-only" role="alert">{assertiveMessage}</div>
</section>

<style>
	.akui-notification-area {
		display: flex;
		flex-direction: column;
		max-width: min(22rem, calc(100vw - 2rem));
	}

	.akui-notification-area:focus {
		outline: none;
	}

	.akui-notification-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--akui-space-xs, 0.5rem);
	}

	.akui-notification-list li {
		display: block;
	}

	/* Fixed corner layers. The layer ignores pointer events so it never blocks the UI behind it;
	   each notification re-enables them for its own controls. */
	.akui-notification-area:not(.inline) {
		position: fixed;
		z-index: 1000;
		pointer-events: none;
	}

	.akui-notification-area:not(.inline) li {
		pointer-events: auto;
	}

	.akui-notification-area.bottom-right {
		right: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-right, 0px));
		bottom: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-bottom, 0px));
		align-items: flex-end;
	}

	.akui-notification-area.bottom-left {
		left: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-left, 0px));
		bottom: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-bottom, 0px));
		align-items: flex-start;
	}

	.akui-notification-area.top-right {
		right: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-right, 0px));
		top: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-top, 0px));
		align-items: flex-end;
	}

	.akui-notification-area.top-left {
		left: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-left, 0px));
		top: calc(var(--akui-space-m, 1rem) + env(safe-area-inset-top, 0px));
		align-items: flex-start;
	}

	/* Newest nearest the corner: for top placements a fresh push should appear at the top. */
	.akui-notification-area.top-right .akui-notification-list,
	.akui-notification-area.top-left .akui-notification-list {
		flex-direction: column-reverse;
	}

	.akui-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
