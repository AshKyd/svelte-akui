<script lang="ts">
	import { type Snippet } from 'svelte';
	import './input.css';

	interface Props {
		/** The input element to wrap. Should be a TextInput or similar. */
		children: Snippet;
		/** Optional icon or button to render on the left. */
		left?: Snippet;
		/** Optional icon or button to render on the right. */
		right?: Snippet;
		/** Sizing context ('small', 'medium', 'large'). */
		size?: 'small' | 'medium' | 'large';
		/** Additional CSS classes for the wrapper. */
		class?: string;
	}

	let {
		children,
		left,
		right,
		size = 'medium',
		class: className = ''
	}: Props = $props();
</script>

<div class="akui-input-with-icon {size} {className}" class:has-left={!!left} class:has-right={!!right}>
	{#if left}
		<div class="akui-input-icon left">
			{@render left()}
		</div>
	{/if}

	{@render children()}

	{#if right}
		<div class="akui-input-icon right">
			{@render right()}
		</div>
	{/if}
</div>

<style>
	.akui-input-with-icon {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	.akui-input-icon {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--akui-fg-secondary);
		z-index: 2;
		pointer-events: none;
	}

	/* Allow pointer events for buttons/actions */
	:global(.akui-input-icon > button),
	:global(.akui-input-icon > a) {
		pointer-events: auto;
	}

	.left {
		left: 0.75rem;
	}

	.right {
		right: 0.75rem;
	}

	/* Adjustments for different sizes */
	.small .left { left: 0.5rem; }
	.small .right { right: 0.5rem; }
	.large .left { left: 1rem; }
	.large .right { right: 1rem; }

	/* Dynamic Padding for the inner input */
	:global(.akui-input-with-icon.has-left .akui-input-base) {
		padding-left: 2.5rem !important;
	}

	:global(.akui-input-with-icon.has-right .akui-input-base) {
		padding-right: 2.5rem !important;
	}

	/* Size-specific padding overrides */
	:global(.akui-input-with-icon.small.has-left .akui-input-base) { padding-left: 2rem !important; }
	:global(.akui-input-with-icon.small.has-right .akui-input-base) { padding-right: 2rem !important; }
	:global(.akui-input-with-icon.large.has-left .akui-input-base) { padding-left: 3rem !important; }
	:global(.akui-input-with-icon.large.has-right .akui-input-base) { padding-right: 3rem !important; }
</style>
