<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
	import InfoBox from '../InfoBox/InfoBox.svelte';
	import Button from '../Button/Button.svelte';
	import { resolveTimeout, type NotificationItem } from './types.js';

	interface Props {
		/** The notification to render. */
		item: NotificationItem;
		/** When true, the auto-dismiss timer and the countdown bar are frozen. */
		paused?: boolean;
		/** Called when the timer runs out. */
		onExpire: (id: string) => void;
		/** Called when the user dismisses it (× button, Escape, or after the action runs). */
		onDismiss: (id: string) => void;
		/** Per-item render override from the parent. */
		itemSnippet?: Snippet<[{ item: NotificationItem }]>;
	}

	let { item, paused = false, onExpire, onDismiss, itemSnippet }: Props = $props();

	const total = $derived(resolveTimeout(item.timeout));

	// `remaining` is deliberately a plain variable, not `$state`: only the timer effect reads and
	// writes it, and it must survive the effect re-running on every pause/resume without itself
	// retriggering that effect. `item.timeout` is set once when the notification is created and
	// never mutated, so `total` is stable for the life of this instance.
	let remaining = untrack(() => total);
	let armedAt = 0;

	$effect(() => {
		if (total <= 0 || paused) return;

		armedAt = performance.now();
		const handle = setTimeout(() => onExpire(item.id), remaining);

		return () => {
			clearTimeout(handle);
			remaining = Math.max(0, remaining - (performance.now() - armedAt));
		};
	});

	/** Run the trailing action, then dismiss regardless of whether it threw. */
	async function runAction() {
		try {
			await item.onAction?.();
		} finally {
			onDismiss(item.id);
		}
	}

	/** Same as the action: a clicked notification has done its job, so it dismisses. */
	async function runClick() {
		try {
			await item.onClick?.();
		} finally {
			onDismiss(item.id);
		}
	}
</script>

{#snippet actionButton()}
	<Button size="small" variant="ghost" onclick={runAction}>{item.actionLabel}</Button>
{/snippet}

{#snippet body()}
	{#if typeof item.message === 'string'}
		{item.message}
	{:else}
		{@render item.message()}
	{/if}
{/snippet}

<div
	class="akui-notification"
	class:clickable={!!item.onClick && !itemSnippet}
	data-notification-id={item.id}
	data-paused={paused || undefined}
	style="--akui-notification-timeout: {total}ms"
>
	<InfoBox
		tag="div"
		variant={item.variant ?? 'info'}
		title={item.title}
		icon={item.icon}
		onClose={item.dismissible === false ? undefined : () => onDismiss(item.id)}
		action={item.actionLabel ? actionButton : undefined}
	>
		{#if itemSnippet}
			{@render itemSnippet({ item })}
		{:else if item.onClick}
			<button type="button" class="akui-notification-trigger bespoke" onclick={runClick}>
				{@render body()}
			</button>
		{:else}
			{@render body()}
		{/if}
	</InfoBox>

	{#if total > 0}
		<!-- Decorative: the accessible time signal is the pause-on-hover/focus plus the dismiss button. -->
		<div class="akui-notification-countdown" aria-hidden="true">
			<div class="akui-notification-countdown-fill"></div>
		</div>
	{/if}
</div>

<style>
	.akui-notification {
		position: relative;
		overflow: hidden;
		border-radius: var(--akui-radius-m);
		background: var(--akui-bg-input);
		box-shadow: var(--akui-shadow-m, 0 4px 12px rgba(0, 0, 0, 0.15));
	}

	/* The message button stays plain text; its ::after stretches over the whole card as the target. */
	.akui-notification-trigger {
		display: block;
		width: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.akui-notification-trigger:focus-visible {
		outline: none;
	}

	/* Hover/active tint uses the variant's text colour (currentColor), so it suits every variant and theme. */
	.akui-notification-trigger::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: transparent;
		transition: background-color 0.15s ease;
	}

	.akui-notification-trigger:hover::after {
		background: color-mix(in srgb, currentColor 6%, transparent);
	}

	.akui-notification-trigger:active::after {
		background: color-mix(in srgb, currentColor 12%, transparent);
	}

	.akui-notification-trigger:focus-visible::after {
		outline: 2px solid var(--akui-ring-focus);
		outline-offset: -2px;
	}

	/* Pressed feedback on the card itself, like Button. */
	.akui-notification.clickable:has(.akui-notification-trigger:active) {
		transform: translateY(0.5px);
	}

	/* Keep the action and × buttons above the stretched click target. */
	.akui-notification.clickable :global(.akui-infobox-trailing) {
		position: relative;
		z-index: 1;
	}

	:global(html[data-reduced-motion='true']) .akui-notification-trigger::after {
		transition: none;
	}

	.akui-notification-countdown {
		position: absolute;
		inset: auto 0 0 0;
		height: 3px;
		background: rgba(0, 0, 0, 0.08);
	}

	:global([data-theme='dark']) .akui-notification-countdown {
		background: rgba(255, 255, 255, 0.1);
	}

	.akui-notification-countdown-fill {
		height: 100%;
		transform-origin: left center;
		background: var(--akui-bg-accent);
		animation: akui-notification-countdown var(--akui-notification-timeout) linear forwards;
	}

	/* Pauses in lock-step with the JS timer, which stops on the same hover/focus trigger. */
	.akui-notification[data-paused] .akui-notification-countdown-fill {
		animation-play-state: paused;
	}

	@keyframes akui-notification-countdown {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}

	/* WCAG 2.2.2: no auto-moving content. The timer still runs — a timer is not motion. */
	:global(html[data-reduced-motion='true']) .akui-notification-countdown-fill {
		animation: none !important;
		transform: scaleX(1);
		opacity: 0.35;
	}
</style>
