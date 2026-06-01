<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '../Icon/Icon.svelte';
	import Loader from '../Loader/Loader.svelte';
	import { Glow } from '../Glow/index.js';

	interface Props {
		/** Desktop background image URL */
		backgroundImage?: string;
		/** Dark mode desktop background image URL */
		darkBackgroundImage?: string;
		/** Mobile background image URL (falls back to backgroundImage) */
		mobileBackgroundImage?: string;
		/** Dark mode mobile background image URL */
		darkMobileBackgroundImage?: string;
		/** Minimum pixels to reserve above the panel on mobile viewports (default: 120) */
		mobileReservePixels?: number;
		/** Loading state: slides form out to the left and runs a spinner */
		loading?: boolean;
		/** Optional URL for the back button */
		backTo?: string;
		/** Key representing the current view state (e.g. 'login', 'register'). Triggers slide animations. */
		viewState?: string;
		/** Physical direction the slide animation should flow (default: 'up') */
		slideDirection?: 'left' | 'right' | 'up' | 'down' | 'none';
		/** Animation timing customization */
		transitionParams?: {
			duration?: number;
			delay?: number;
		};
		/** Child content (form, buttons, etc.) */
		children: Snippet;
	}

	let {
		backgroundImage,
		darkBackgroundImage,
		mobileBackgroundImage,
		darkMobileBackgroundImage,
		mobileReservePixels = 120,
		loading = false,
		backTo,
		viewState = 'login',
		slideDirection = 'up',
		transitionParams = {},
		children
	}: Props = $props();

	let measuredHeight = $state(0);

	// Custom transition function that supports sliding based on physical direction
	function slideTransition(
		node: HTMLElement,
		{ direction = 'up', type = 'in', duration = 300, delay = 0 } = {}
	) {
		const prefersReducedMotion = typeof window !== 'undefined'
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

		if (prefersReducedMotion || direction === 'none') {
			return {
				delay,
				duration,
				easing: cubicOut,
				css: (t: number) => `opacity: ${t};`
			};
		}

		let x = '';
		let y = '';

		if (direction === 'left') {
			x = type === 'in' ? '100%' : '-100%';
		} else if (direction === 'right') {
			x = type === 'in' ? '-100%' : '100%';
		} else if (direction === 'up') {
			y = type === 'in' ? '100%' : '100%';
		} else if (direction === 'down') {
			y = type === 'in' ? '-100%' : '-100%';
		}

		return {
			delay,
			duration,
			easing: cubicOut,
			css: (t: number, u: number) => {
				const currentX = x ? `calc(${u} * ${x})` : '0px';
				const currentY = y ? `calc(${u} * ${y})` : '0px';
				return `
					transform: translate3d(${currentX}, ${currentY}, 0);
				`;
			}
		};
	}
</script>

<div
	class="akui-auth-shell-wrapper"
	style="
		--desktop-bg: {backgroundImage ? `url(${backgroundImage})` : 'none'};
		--dark-desktop-bg: {darkBackgroundImage ? `url(${darkBackgroundImage})` : backgroundImage ? `url(${backgroundImage})` : 'none'};
		--mobile-bg: {mobileBackgroundImage ? `url(${mobileBackgroundImage})` : backgroundImage ? `url(${backgroundImage})` : 'none'};
		--dark-mobile-bg: {darkMobileBackgroundImage ? `url(${darkMobileBackgroundImage})` : darkBackgroundImage ? `url(${darkBackgroundImage})` : mobileBackgroundImage ? `url(${mobileBackgroundImage})` : backgroundImage ? `url(${backgroundImage})` : 'none'};
		--mobile-reserve: {mobileReservePixels}px;
	"
>
	{#if backTo}
		<a href={backTo} class="akui-auth-back-btn" aria-label="Go back">
			<Icon name="arrow-left" size={20} />
		</a>
	{/if}

	{#if viewState && viewState !== 'blank'}
		<div
			class="akui-auth-panel"
			transition:fade={{ duration: 250, easing: cubicOut }}
		>
			<Glow />

			<div class="akui-auth-form-wrapper">
				<div 
					class="akui-auth-panel-content-wrapper" 
					style="height: {measuredHeight ? `${measuredHeight}px` : 'auto'};"
				>
					{#key viewState}
						<div
							class="akui-auth-step-content"
							bind:clientHeight={measuredHeight}
							class:loading
							in:slideTransition={{
								direction: slideDirection,
								type: 'in',
								duration: transitionParams.duration ?? 300,
								delay: transitionParams.delay ?? 0
							}}
							out:slideTransition={{
								direction: slideDirection,
								type: 'out',
								duration: transitionParams.duration ?? 250,
								delay: transitionParams.delay ?? 0
							}}
						>
							{@render children()}
						</div>
					{/key}
				</div>

				{#if loading}
					<div class="akui-auth-loading-overlay" transition:fade={{ duration: 200 }}>
						<Loader size="2rem" />
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.akui-auth-shell-wrapper {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		box-sizing: border-box;
		background-color: var(--akui-bg-secondary);
		transition: background-image 0.3s ease;
	}

	/* CSS variables for background settings */
	.akui-auth-shell-wrapper {
		background-image: var(--desktop-bg);
	}

	:global([data-theme='dark']) .akui-auth-shell-wrapper {
		background-image: var(--dark-desktop-bg, var(--desktop-bg));
	}

	.akui-auth-panel {
		position: relative;
		overflow: hidden;
		background-color: var(--akui-bg);
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
		transition:
			background-color var(--akui-transition-theme),
			border-color var(--akui-transition-theme),
			box-shadow var(--akui-transition-theme);
		box-sizing: border-box;
	}

	:global([data-theme='dark']) .akui-auth-panel {
		border-color: rgba(255, 255, 255, 0.05);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.akui-auth-back-btn {
		position: fixed;
		top: 24px;
		left: 24px;
		z-index: 100;
		color: var(--akui-fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--akui-radius-m);
		background-color: var(--akui-bg);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: var(--akui-shadow-s, 0 2px 8px rgba(0, 0, 0, 0.08));
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	:global([data-theme='dark']) .akui-auth-back-btn {
		border-color: rgba(255, 255, 255, 0.05);
	}

	.akui-auth-back-btn:hover {
		background-color: var(--akui-bg-hover);
		color: var(--akui-fg);
	}

	.akui-auth-back-btn:focus-visible {
		outline: 2px solid var(--akui-bg-accent);
		outline-offset: 2px;
	}

	.akui-auth-form-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.akui-auth-panel-content-wrapper {
		position: relative;
		width: 100%;
		transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.akui-auth-step-content {
		width: 100%;
		box-sizing: border-box;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 1;
		transform: translateX(0);
	}

	/* Absolute positioning for the outgoing element during transition */
	.akui-auth-step-content:not(:last-child) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		pointer-events: none;
	}

	.akui-auth-step-content.loading {
		transform: translateX(-50px);
		opacity: 0;
		pointer-events: none;
	}

	.akui-auth-loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		background-color: transparent;
	}

	/* Responsive layouts */
	@media (max-width: 767px) {
		.akui-auth-shell-wrapper {
			background-image: var(--mobile-bg);
			justify-content: flex-end;
			padding-top: var(--mobile-reserve);
			overflow-y: auto;
		}

		:global([data-theme='dark']) .akui-auth-shell-wrapper {
			background-image: var(--dark-mobile-bg, var(--mobile-bg));
		}

		.akui-auth-panel {
			width: 100%;
			border-radius: 36px 36px 0 0;
			border-bottom: none;
			border-left: none;
			border-right: none;
			padding: 40px 24px 32px 24px;
		}

		.akui-auth-back-btn {
			top: 12px;
			left: 12px;
		}
	}

	@media (min-width: 768px) {
		.akui-auth-shell-wrapper {
			padding: 40px;
			overflow-y: auto;
		}

		.akui-auth-panel {
			width: 440px;
			border-radius: 32px;
			box-shadow: var(--akui-shadow-l, 0 10px 30px rgba(0, 0, 0, 0.15));
			padding: 48px;
		}
	}
</style>
