<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';

	/**
	 * @component Modal
	 * An accessible modal component using the native HTML <dialog> element.
	 */

	interface Props {
		/** Optional title for the modal. */
		title?: string;
		/** Optional icon name (Bootstrap Icon) to display next to the title. */
		icon?: string;
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
	}

	let {
		title,
		icon,
		onClose,
		showCloseButton = true,
		footer,
		children,
		fullscreenOnMobile = false
	}: Props = $props();

	let dialog: HTMLDialogElement;
	let visible = $state(false);

	onMount(() => {
		dialog.showModal();
		visible = true;

		// Handle ESC key via native 'cancel' event
		const handleCancel = (e: Event) => {
			e.preventDefault();
			requestClose();
		};

		dialog.addEventListener('cancel', handleCancel);
		return () => dialog.removeEventListener('cancel', handleCancel);
	});

	function requestClose() {
		visible = false;
		// Wait for transition to finish
		setTimeout(() => {
			onClose();
		}, 200); // Matches transition duration
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialog) {
			requestClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="akui-modal-dialog"
	class:akui-modal-fullscreen-mobile={fullscreenOnMobile}
	onclick={handleBackdropClick}
	onclose={onClose}
>
	{#if visible}
		<div
			class="akui-modal-content"
			class:akui-modal-fullscreen-mobile={fullscreenOnMobile}
			in:scale={{ duration: 200, start: 0.95 }}
			out:scale={{ duration: 200, start: 0.95 }}
		>
			<header class="akui-modal-header">
				<div class="akui-modal-title-group">
					{#if icon}
						<Icon name={icon} size="1.125rem" class="akui-modal-icon" />
					{/if}
					{#if title}
						<h2 class="akui-modal-title">{title}</h2>
					{/if}
				</div>
				{#if showCloseButton}
					<button type="button" class="akui-modal-close" onclick={requestClose} aria-label="Close">
						<Icon name="x-lg" size="1.25em" />
					</button>
				{/if}
			</header>

			<div class="akui-modal-body">
				{@render children?.()}
			</div>

			{#if footer}
				<footer class="akui-modal-footer">
					{@render footer()}
				</footer>
			{/if}
		</div>
	{/if}
</dialog>

<style>
	.akui-modal-dialog {
		padding: 0;
		border: none;
		background: transparent;
		max-width: 90vw;
		max-height: 90vh;
		outline: none;
		overflow: visible;
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
		background: var(--akui-bg);
		color: var(--akui-fg);
		border-radius: var(--akui-radius-l);
		border: 1px solid var(--akui-border-input);
		box-shadow:
			var(--akui-glow-top),
			var(--akui-glow-bottom),
			0 20px 25px -5px rgba(0, 0, 0, 0.4),
			0 10px 10px -5px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		min-width: 320px;
		max-height: inherit; /* Inherit the dialog's max-height (90vh) */
		overflow: hidden;
		transition: var(--akui-transition-theme);
	}

	@media (max-width: 720px) {
		dialog.akui-modal-fullscreen-mobile {
			max-width: none;
			max-height: none;
		}

		.akui-modal-fullscreen-mobile {
			width: 100vw;
			height: 100vh;
			max-width: none;
			max-height: none;
			border-radius: 0;
			border: none;
		}
	}

	.akui-modal-header {
		display: flex;
		align-items: center;
		padding: var(--akui-space-m);
		border-bottom: 1px solid var(--akui-border-input);
		background: var(--akui-bg-secondary);
		gap: var(--akui-space-m);
	}

	.akui-modal-title-group {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
		flex: 1;
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
		display: flex;
		justify-content: flex-end;
		gap: var(--akui-space-s);
	}

	/* Dark mode overrides for backdrop since it doesn't inherit variables easily */
	:global([data-theme='dark']) .akui-modal-dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
	}
</style>
