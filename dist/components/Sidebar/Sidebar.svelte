<script lang="ts">
	import { type Snippet, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../../constants.js';
	import Button from '../Button/Button.svelte';
	import Icon from '../Icon/Icon.svelte';

	interface Props {
		/** Optional title to show in the sidebar header branding. */
		title?: string;
		/** Optional icon (name from icon set or absolute URL) to show in the sidebar header. */
		icon?: string;
		/** The content to be displayed in the scrollable top section of the sidebar. */
		content?: Snippet;
		/** Optional footer to be displayed at the bottom of the sidebar. */
		footer?: Snippet;
		/** Whether the sidebar drawer is open (for modal and dismissible modes). */
		isOpen?: boolean;
		/** The mode of the sidebar: permanent, modal, or dismissible. */
		mode?: 'permanent' | 'modal' | 'dismissible';
		/** Whether to show a close button at the top of the drawer. Defaults to true in modal mode, false otherwise. */
		showCloseButton?: boolean;
		/** The width of the sidebar when open. Defaults to '280px'. */
		width?: string;
		/** Additional CSS classes for the container. */
		class?: string;
	}

	let {
		title,
		icon,
		content,
		footer,
		isOpen = $bindable(true),
		mode = 'permanent',
		showCloseButton: userShowCloseButton,
		width = '280px',
		class: className = ''
	}: Props = $props();

	const showCloseButton = $derived(
		userShowCloseButton !== undefined ? userShowCloseButton : mode === 'modal'
	);

	let sidebarEl = $state<HTMLElement | null>(null);
	let lastFocusedEl: Element | null = null;

	$effect(() => {
		const isModal = mode === 'modal';
		const isDismissible = mode === 'dismissible';
		const needsFocusTrap = (isModal || isDismissible) && isOpen;

		if (needsFocusTrap) {
			// Save the currently focused element to return focus later
			lastFocusedEl = document.activeElement;
			// Move focus to the first interactive element in the sidebar
			tick().then(() => {
				const focusable = sidebarEl?.querySelector(
					'a, button, [tabindex="1"],[tabindex="0"]'
				) as HTMLElement;
				focusable?.focus();
			});
		} else if ((isModal || isDismissible) && !isOpen && lastFocusedEl instanceof HTMLElement) {
			// Restore focus when the menu closes
			lastFocusedEl.focus();
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mode === 'modal' && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if mode === 'modal' && isOpen}
	<div
		class="akui-sidebar-scrim"
		onclick={() => (isOpen = false)}
		transition:fade={{ duration: ANIMATION_DURATION }}
		aria-hidden="true"
	></div>
{/if}

<aside
	bind:this={sidebarEl}
	class="akui-sidebar {className}"
	class:is-open={isOpen}
	class:mode-permanent={mode === 'permanent'}
	class:mode-modal={mode === 'modal'}
	class:mode-dismissible={mode === 'dismissible'}
	style:--sidebar-width={width}
	inert={(mode === 'modal' || mode === 'dismissible') && !isOpen}
	role={mode === 'modal' ? 'dialog' : 'navigation'}
	aria-modal={mode === 'modal' ? 'true' : undefined}
	aria-label={mode === 'modal' ? 'Navigation Drawer' : undefined}
>
	<div class="akui-sidebar-inner" style:width>
		{#if title || icon || showCloseButton}
			<div class="akui-sidebar-header">
				<div class="akui-sidebar-brand">
					{#if icon}
						<div class="akui-sidebar-brand-icon">
							{#if icon.startsWith('http') || icon.startsWith('/') || icon.includes('.')}
								<img src={icon} alt="" class="akui-sidebar-brand-img" />
							{:else}
								<Icon name={icon} size={24} />
							{/if}
						</div>
					{/if}
					{#if title}
						<span class="akui-sidebar-brand-title">{title}</span>
					{/if}
				</div>
				{#if showCloseButton}
					<div class="akui-sidebar-close">
						<Button
							variant="ghost"
							icon="x"
							iconPosition="only"
							label="Close Drawer"
							onclick={() => (isOpen = false)}
						/>
					</div>
				{/if}
			</div>
		{/if}
		{#if content}
			<div class="akui-sidebar-content">
				{@render content()}
			</div>
		{/if}
		{#if footer}
			<div class="akui-sidebar-footer">
				{@render footer()}
			</div>
		{/if}
	</div>
</aside>

<style>
	.akui-sidebar {
		height: 100dvh;
		background: var(--akui-bg);
		border-right: 1px solid var(--akui-border-input);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.akui-sidebar-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		flex-shrink: 0;
	}

	.akui-sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--akui-space-m);
		min-height: 4rem;
		box-sizing: border-box;
		border-bottom: 1px solid var(--akui-border-input);
		gap: var(--akui-space-s);
	}

	.akui-sidebar-brand {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
		min-width: 0;
	}

	.akui-sidebar-brand-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.akui-sidebar-brand-img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.akui-sidebar-brand-title {
		font-weight: 600;
		font-size: 1.125rem;
		color: var(--akui-fg);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.akui-sidebar-close {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.akui-sidebar-content {
		flex: 1;
		overflow-y: auto;
	}

	.akui-sidebar-footer {
		padding: var(--akui-space-m);
		border-top: 1px solid var(--akui-border-input);
	}

	/* Modes */
	.akui-sidebar.mode-permanent {
		width: var(--sidebar-width);
	}

	.akui-sidebar.mode-dismissible {
		width: 0;
		border-right-width: 0;
		transition:
			width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			border-color 0.3s ease;
	}

	.akui-sidebar.mode-dismissible.is-open {
		width: var(--sidebar-width);
		border-right-width: 1px;
	}

	.akui-sidebar.mode-modal {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		width: var(--sidebar-width);
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: var(--akui-shadow-l, 0 8px 32px rgba(0, 0, 0, 0.2));
	}

	.akui-sidebar.mode-modal.is-open {
		transform: translateX(0);
	}

	/* Scrim */
	.akui-sidebar-scrim {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.4);
		z-index: 99;
	}

	:global([data-theme='dark']) .akui-sidebar {
		background: var(--akui-bg-secondary);
		border-right-color: rgba(255, 255, 255, 0.05);
	}

	:global([data-theme='dark']) .akui-sidebar-header {
		border-bottom-color: rgba(255, 255, 255, 0.05);
	}

	:global([data-theme='dark']) .akui-sidebar-footer {
		border-top-color: rgba(255, 255, 255, 0.05);
	}
</style>
