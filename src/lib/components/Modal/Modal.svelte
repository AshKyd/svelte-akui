<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { motion } from '../../hooks/reducedMotion.svelte.js';
	import Icon from '../Icon/Icon.svelte';
	import { Glow } from '../Glow/index.js';

	/**
	 * @component Modal
	 * An accessible modal component using the native HTML <dialog> element.
	 * Pass `inline` to render the card in page flow instead (no dialog, backdrop or Esc handling).
	 */

	interface Props {
		/** Optional title for the modal. */
		title?: string;
		/** Optional icon name (Bootstrap Icon) to display next to the title. */
		icon?: string;
		/** Optional snippet for a custom icon. Overrides the icon prop. */
		iconSnippet?: import('svelte').Snippet;
		/** Callback when the modal requests to close. */
		onClose: () => void;
		/** Whether to show the close button in the header. Defaults to true. */
		showCloseButton?: boolean;
		/** Footer snippet for action buttons. */
		footer?: import('svelte').Snippet;
		/** Default slot for modal content. */
		children?: import('svelte').Snippet;
		/** Whether the modal should be fullscreen on mobile devices. Defaults to false. */
		fullscreenOnMobile?: boolean;
		/** Optional minimum width of the modal on desktop. */
		minWidth?: string;
		/** Optional minimum height of the modal on desktop. */
		minHeight?: string;
		/** Render the card in normal page flow, without the native <dialog>, backdrop or Esc handling. Useful for theme testing. */
		inline?: boolean;
	}

	let {
		title,
		icon,
		iconSnippet,
		onClose,
		showCloseButton = true,
		footer,
		children,
		fullscreenOnMobile = false,
		minWidth,
		minHeight,
		inline = false
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	// Inline cards have no dialog to open, so they are visible from the start.
	// svelte-ignore state_referenced_locally
	let visible = $state(inline);

	onMount(() => {
		if (inline || !dialog) return;
		dialog.showModal();
		visible = true;

		// Handle ESC key via native 'cancel' event
		const handleCancel = (e: Event) => {
			e.preventDefault();
			requestClose();
		};

		dialog.addEventListener('cancel', handleCancel);
		return () => dialog?.removeEventListener('cancel', handleCancel);
	});

	function requestClose() {
		visible = false;
		// Wait for transition to finish
		setTimeout(() => {
			if (dialog?.open) dialog.close();
			onClose();
		}, 200); // Matches transition duration
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialog) {
			requestClose();
		}
	}

	const hasHeader = $derived.by(() => {
		return Boolean(title || icon || iconSnippet || showCloseButton);
	});
</script>

{#snippet card()}
	<div
		class="akui-modal-content"
		class:akui-modal-fullscreen-mobile={fullscreenOnMobile}
		class:akui-modal-content--inline={inline}
		style:--akui-modal-min-width={minWidth}
		style:--akui-modal-min-height={minHeight}
		in:scale={motion({ duration: 200, start: 0.95 })}
		out:scale={motion({ duration: 200, start: 0.95 })}
	>
		<Glow />
		{#if hasHeader}
			<header class="akui-modal-header">
				<div class="akui-modal-title-group">
					{#if iconSnippet}
						<div class="akui-modal-icon-container">
							{@render iconSnippet()}
						</div>
					{:else if icon}
						<Icon name={icon} size="1.125rem" class="akui-modal-icon" />
					{/if}
					{#if title}
						<h2 class="akui-modal-title">{title}</h2>
					{/if}
				</div>
				{#if showCloseButton}
					<button
						type="button"
						class="akui-modal-close"
						onclick={requestClose}
						aria-label="Close"
					>
						<Icon name="x-lg" size="1.25em" />
					</button>
				{/if}
			</header>
		{/if}

		<div class="akui-modal-body">
			{@render children?.()}
		</div>

		{#if footer}
			<footer class="akui-modal-footer">
				{@render footer()}
			</footer>
		{/if}
	</div>
{/snippet}

{#if inline}
	{#if visible}
		{@render card()}
	{/if}
{:else}
	<dialog
		bind:this={dialog}
		class="akui-modal-dialog"
		class:akui-modal-fullscreen-mobile={fullscreenOnMobile}
		onclick={handleBackdropClick}
		onclose={onClose}
	>
		{#if visible}
			{@render card()}
		{/if}
	</dialog>
{/if}

<style>
	.akui-modal-dialog {
		padding: 0;
		border: none;
		background: transparent;
		max-width: 95vw;
		max-height: 90vh;
		outline: none;
		overflow: visible;
		margin: auto;
	}

	.akui-modal-dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		animation: akui-fade-in 0.2s ease-out;
	}

	@keyframes akui-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.akui-modal-content {
		position: relative;
		background: var(--akui-bg);
		color: var(--akui-fg);
		border-radius: var(--akui-radius-l);
		border: 1px solid var(--akui-border-input);
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.4),
			0 10px 10px -5px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		min-width: var(--akui-modal-min-width, 320px);
		min-height: var(--akui-modal-min-height, auto);
		max-width: 40rem;
		max-height: inherit; /* Inherit the dialog's max-height (90vh) */
		overflow: hidden;
		transition: var(--akui-transition-theme);
	}

	/* Inline cards sit in normal flow, so there is no dialog to cap their height. */
	.akui-modal-content--inline {
		max-height: none;
	}

	@media (max-width: 720px) {
		.akui-modal-content {
			min-width: 0 !important;
			min-height: 0 !important;
		}

		dialog.akui-modal-fullscreen-mobile {
			max-width: none;
			max-height: none;
			padding: 0;
			margin: 0;
			width: 100%;
			height: 100dvh;
		}

		.akui-modal-fullscreen-mobile {
			border-radius: 0;
		}

		.akui-modal-content.akui-modal-fullscreen-mobile {
			height: 100dvh;
			width: 100%;
			border: none;
			max-width: none;
		}
	}

	.akui-modal-header {
		display: flex;
		align-items: center;
		padding: var(--akui-space-m);
		border-top: none;
		border-bottom: 1px solid var(--akui-border-input);
		background: var(--akui-bg-secondary);
		border-top-left-radius: calc(var(--akui-radius-l) - 1px);
		border-top-right-radius: calc(var(--akui-radius-l) - 1px);
		gap: var(--akui-space-m);
	}

	.akui-modal-title-group {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
		flex: 1;
	}

	.akui-modal-icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
		margin-top: -1px; /* Optical adjustment */
	}

	.akui-modal-icon-container :global(img) {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	:global(.akui-modal-icon) {
		margin-top: -1px; /* Optical adjustment for better alignment with text x-height */
	}

	.akui-modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: normal;
	}

	.akui-modal-close {
		appearance: none;
		background: transparent;
		border: none;
		color: var(--akui-fg-secondary);
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: var(--akui-radius-m);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: var(--akui-transition-theme);
		padding: 0;
		flex-shrink: 0;
	}

	.akui-modal-close:hover {
		background: var(--akui-bg-button-hover);
		color: var(--akui-fg);
	}

	.akui-modal-close:active {
		background: var(--akui-bg-button-active);
		transform: translateY(1px);
	}

	.akui-modal-body {
		flex: 1;
		overflow-y: auto;
		background: var(--akui-bg);
	}

	.akui-modal-footer {
		padding: var(--akui-space-m);
		background: var(--akui-bg-secondary);
		border-top: 1px solid var(--akui-border-input);
		border-bottom-left-radius: calc(var(--akui-radius-l) - 1px);
		border-bottom-right-radius: calc(var(--akui-radius-l) - 1px);
		display: flex;
		justify-content: flex-end;
		gap: var(--akui-space-s);
	}

	/* Dark mode overrides for backdrop since it doesn't inherit variables easily */
	:global([data-theme='dark']) .akui-modal-dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
	}
</style>
