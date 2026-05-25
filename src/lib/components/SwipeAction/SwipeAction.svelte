<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';

	interface SwipeStatus {
		/** The current swipe percentage from 0 to 1 relative to the threshold */
		percentage: number;
		/** Whether the swipe has reached or exceeded the threshold */
		thresholdReached: boolean;
	}

	interface Props {
		/** Custom snippet or Bootstrap Icon name to render when swiping right (revealing left action) */
		leftIcon?: string | Snippet<[SwipeStatus]>;
		/** Background colour of the left action area (e.g. 'var(--akui-color-green-bg)') */
		leftBackgroundColour?: string;
		/** Foreground colour of the left action area (e.g. 'var(--akui-color-green-fg)') */
		leftForegroundColour?: string;
		/** Callback triggered when the item is swiped right past the threshold and released */
		onSwipeRight?: () => void;
		/** Custom snippet or Bootstrap Icon name to render when swiping left (revealing right action) */
		rightIcon?: string | Snippet<[SwipeStatus]>;
		/** Background colour of the right action area (e.g. 'var(--akui-color-pink-bg)') */
		rightBackgroundColour?: string;
		/** Foreground colour of the right action area (e.g. 'var(--akui-color-pink-fg)') */
		rightForegroundColour?: string;
		/** Callback triggered when the item is swiped left past the threshold and released */
		onSwipeLeft?: () => void;
		/** Distance in pixels required to trigger the action */
		threshold?: number;
		/** The main content to wrap inside the swipe action row */
		children: Snippet;
	}

	let {
		leftIcon,
		leftBackgroundColour = 'var(--akui-color-green-bg, #28a745)',
		leftForegroundColour = 'var(--akui-color-green-fg, #ffffff)',
		onSwipeRight,
		rightIcon,
		rightBackgroundColour = 'var(--akui-color-pink-bg, #dc3545)',
		rightForegroundColour = 'var(--akui-color-pink-fg, #ffffff)',
		onSwipeLeft,
		threshold = 64,
		children
	}: Props = $props();

	let dragging = $state(false);
	let offset = $state(0);
	let startX = 0;
	let startY = 0;
	let isVerticalScroll = false;
	let hasCheckedDirection = false;

	// Percentage of the pull distance relative to the threshold
	const percentage = $derived(
		threshold > 0 ? Math.min(1, Math.abs(offset) / threshold) : 1
	);

	// Whether the swipe has reached the threshold
	const thresholdReached = $derived(Math.abs(offset) >= threshold);

	const currentBackgroundColour = $derived.by(() => {
		if (offset > 0) return leftBackgroundColour;
		if (offset < 0) return rightBackgroundColour;
		return 'transparent';
	});

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
		dragging = true;
		isVerticalScroll = false;
		hasCheckedDirection = false;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!dragging || e.touches.length !== 1) return;
		const touch = e.touches[0];
		const deltaX = touch.clientX - startX;
		const deltaY = touch.clientY - startY;

		if (!hasCheckedDirection) {
			// If vertical movement is greater, it is a vertical scroll, ignore swipe
			if (Math.abs(deltaY) > Math.abs(deltaX)) {
				isVerticalScroll = true;
				dragging = false;
				return;
			}
			hasCheckedDirection = true;
		}

		if (isVerticalScroll) return;

		let targetOffset = deltaX;

		// Restrict pulling in directions without actions
		if (targetOffset > 0 && !leftIcon && !onSwipeRight) {
			targetOffset = 0;
		}
		if (targetOffset < 0 && !rightIcon && !onSwipeLeft) {
			targetOffset = 0;
		}

		offset = targetOffset;
	}

	function handleTouchEnd() {
		if (!dragging) return;
		dragging = false;

		const absOffset = Math.abs(offset);
		if (absOffset >= threshold) {
			if (offset > 0 && onSwipeRight) {
				onSwipeRight();
			} else if (offset < 0 && onSwipeLeft) {
				onSwipeLeft();
			}
		}

		// Snap back to the centre
		offset = 0;
	}

	function handleTouchCancel() {
		dragging = false;
		offset = 0;
	}
</script>

<div class="akui-swipe-action">
	<div 
		class="akui-swipe-action-background" 
		style:background-color={currentBackgroundColour}
	>
		{#if offset > 0 && leftIcon}
			<div 
				class="akui-swipe-action-left" 
				style:width="{offset}px"
				style:color={leftForegroundColour}
			>
				<div class="akui-swipe-action-icon-wrapper">
					{#if typeof leftIcon === 'string'}
						<Icon name={leftIcon} size={24} colour={leftForegroundColour} />
					{:else}
						{@render leftIcon({ percentage, thresholdReached })}
					{/if}
				</div>
			</div>
		{/if}

		{#if offset < 0 && rightIcon}
			<div 
				class="akui-swipe-action-right" 
				style:width="{-offset}px"
				style:color={rightForegroundColour}
			>
				<div class="akui-swipe-action-icon-wrapper">
					{#if typeof rightIcon === 'string'}
						<Icon name={rightIcon} size={24} colour={rightForegroundColour} />
					{:else}
						{@render rightIcon({ percentage, thresholdReached })}
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<div
		class="akui-swipe-action-content"
		class:dragging
		style:transform="translate3d({offset}px, 0, 0)"
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		ontouchcancel={handleTouchCancel}
		role="presentation"
	>
		{@render children()}
	</div>
</div>

<style>
	.akui-swipe-action {
		position: relative;
		overflow: hidden;
		width: 100%;
		user-select: none;
	}

	.akui-swipe-action-background {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		pointer-events: none;
		transition: background-color 0.2s ease;
	}

	.akui-swipe-action-left {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.akui-swipe-action-right {
		height: 100%;
		margin-left: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.akui-swipe-action-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s ease-out;
		padding: 0 var(--akui-space-m, 1rem);
	}

	.akui-swipe-action-content {
		position: relative;
		z-index: 2;
		width: 100%;
		background-color: transparent;
		touch-action: pan-y;
		will-change: transform;
		transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.akui-swipe-action-content.dragging {
		transition: none;
	}
</style>
