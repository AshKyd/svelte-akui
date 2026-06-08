<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
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

	import { getTheme } from '../../hooks/theme.svelte.js';

	let measuredHeight = $state(0);
	let isTransitioning = $state(false);
	let wrapperEl = $state<HTMLDivElement>();
	let currentHeight = $state<string>('auto');

	// JS Preloader logic for background image
	const theme = getTheme();
	const isDark = $derived(theme.current === 'dark');

	let isMobile = $state(false);
	let visualViewportHeight = $state<string>('100dvh');

	// Adjust wrapper height to match the visual viewport (handles mobile keyboard overlays)
	$effect(() => {
		if (typeof window === 'undefined') return;

		const handleViewportChange = () => {
			if (window.visualViewport) {
				visualViewportHeight = `${window.visualViewport.height}px`;
			}
		};

		window.visualViewport?.addEventListener('resize', handleViewportChange);
		window.visualViewport?.addEventListener('scroll', handleViewportChange);
		window.addEventListener('resize', handleViewportChange);

		handleViewportChange();

		return () => {
			window.visualViewport?.removeEventListener('resize', handleViewportChange);
			window.visualViewport?.removeEventListener('scroll', handleViewportChange);
			window.removeEventListener('resize', handleViewportChange);
		};
	});

	let oldHeight = 0;

	// Capture the current height before the DOM updates to the new viewState
	$effect.pre(() => {
		const _ = viewState;
		if (wrapperEl) {
			oldHeight = wrapperEl.getBoundingClientRect().height;
		}
	});

	// Apply the height transition after the DOM has updated
	$effect(() => {
		const _ = viewState;
		if (wrapperEl && oldHeight > 0) {
			// Lock directly on the element style first (bypassing Svelte state batching)
			wrapperEl.style.height = `${oldHeight}px`;

			// Force layout reflow
			void wrapperEl.offsetHeight;

			// Set the target height to transition to
			const targetHeight = untrack(() => measuredHeight);
			if (targetHeight) {
				currentHeight = `${targetHeight}px`;
				wrapperEl.style.height = `${targetHeight}px`;
			}
		}
	});
	let bgLoaded = $state(false);

	// Derive currently active background image URL matching CSS fallback rules
	const currentBgUrl = $derived.by(() => {
		if (isMobile) {
			if (isDark) {
				return darkMobileBackgroundImage || darkBackgroundImage || mobileBackgroundImage || backgroundImage;
			}
			return mobileBackgroundImage || backgroundImage;
		} else {
			if (isDark) {
				return darkBackgroundImage || backgroundImage;
			}
			return backgroundImage;
		}
	});

	// Reset loaded state when background URL changes
	$effect(() => {
		if (currentBgUrl) {
			bgLoaded = false;
		}
	});

	// Manage media listeners
	$effect(() => {
		if (typeof window === 'undefined') return;

		const mobileQuery = window.matchMedia('(max-width: 767px)');
		isMobile = mobileQuery.matches;
		const handleMobileChange = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mobileQuery.addEventListener('change', handleMobileChange);

		return () => {
			mobileQuery.removeEventListener('change', handleMobileChange);
		};
	});

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
	class="akui-auth-shell"
	style="--mobile-reserve: {mobileReservePixels}px; --viewport-height: {visualViewportHeight};"
>
	{#if currentBgUrl}
		<img
			src={currentBgUrl}
			alt=""
			class="akui-auth-shell__bg-img"
			class:akui-auth-shell__bg-img--loaded={bgLoaded}
			onload={() => { bgLoaded = true; }}
		/>
	{/if}

	{#if backTo}
		<a href={backTo} class="akui-auth-shell__back-btn" aria-label="Go back">
			<Icon name="arrow-left" size={20} />
		</a>
	{/if}

	{#if viewState && viewState !== 'blank'}
		<div
			class="akui-auth-shell__panel"
			transition:fade={{ duration: 250, easing: cubicOut }}
		>
			<Glow />

			<div class="akui-auth-shell__form-wrapper">
				<div 
					bind:this={wrapperEl}
					class="akui-auth-shell__panel-content-wrapper" 
					style="
						--current-height: {currentHeight};
						--height-duration: {transitionParams.duration ?? 300}ms;
					"
				>
					{#key viewState}
						<div
							class="akui-auth-shell__step-content"
							bind:clientHeight={measuredHeight}
							class:akui-auth-shell__step-content--loading={loading}
							class:akui-auth-shell__step-content--no-transition={isTransitioning}
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
							onintrostart={() => {
								isTransitioning = true;
							}}
							onintroend={() => {
								setTimeout(() => {
									isTransitioning = false;
									currentHeight = 'auto';
									if (wrapperEl) wrapperEl.style.height = '';
								}, 50);
							}}
							onoutrostart={() => {
								isTransitioning = true;
							}}
						>
							{@render children()}
						</div>
					{/key}
				</div>

				{#if loading}
					<div class="akui-auth-shell__loading-overlay" transition:fade={{ duration: 200 }}>
						<Loader size="2rem" />
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.akui-auth-shell {
		position: relative;
		height: var(--viewport-height, 100dvh);
		min-height: var(--viewport-height, 100dvh);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		background-color: var(--akui-bg-secondary);
		overflow: hidden;
	}

	.akui-auth-shell__bg-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		z-index: 0;
		opacity: 0;
		transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.akui-auth-shell__bg-img--loaded {
		opacity: 1;
	}

	.akui-auth-shell__content-container {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		align-items: center;
		justify-items: center;
		width: 100%;
		height: 100%;
		z-index: 1; /* Sit above the background fade-in layer */
	}

	.akui-auth-shell__panel {
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

	:global([data-theme='dark']) .akui-auth-shell__panel {
		border-color: rgba(255, 255, 255, 0.05);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.akui-auth-shell__back-btn {
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

	:global([data-theme='dark']) .akui-auth-shell__back-btn {
		border-color: rgba(255, 255, 255, 0.05);
	}

	.akui-auth-shell__back-btn:hover {
		background-color: var(--akui-bg-hover);
		color: var(--akui-fg);
	}

	.akui-auth-shell__back-btn:focus-visible {
		outline: 2px solid var(--akui-bg-accent);
		outline-offset: 2px;
	}

	.akui-auth-shell__form-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.akui-auth-shell__panel-content-wrapper {
		position: relative;
		width: 100%;
		height: var(--current-height, auto);
		transition: height var(--height-duration, 300ms) cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.akui-auth-shell__step-content {
		width: 100%;
		box-sizing: border-box;
		will-change: transform;
		transform: translate3d(0, 0, 0);
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 1;
	}

	.akui-auth-shell__step-content--no-transition {
		transition: none !important;
	}

	/* Absolute positioning for the outgoing element during transition */
	.akui-auth-shell__step-content:not(:last-child) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		pointer-events: none;
	}

	.akui-auth-shell__step-content--loading {
		transform: translateX(-50px);
		opacity: 0;
		pointer-events: none;
	}

	.akui-auth-shell__loading-overlay {
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
		.akui-auth-shell {
			justify-content: flex-end;
			padding-top: var(--mobile-reserve);
			overflow-y: auto;
		}

		.akui-auth-shell__panel {
			width: 100%;
			border-radius: 36px 36px 0 0;
			border-bottom: none;
			border-left: none;
			border-right: none;
			padding: 40px 24px 32px 24px;
		}

		.akui-auth-shell__back-btn {
			top: 12px;
			left: 12px;
		}
	}

	@media (min-width: 768px) {
		.akui-auth-shell {
			padding: 40px;
			overflow-y: auto;
		}

		.akui-auth-shell__panel {
			width: 440px;
			border-radius: 32px;
			box-shadow: var(--akui-shadow-l, 0 10px 30px rgba(0, 0, 0, 0.15));
			padding: 48px;
		}
	}
</style>
