<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION, ANIMATION_EASING } from '../../constants.js';
	import { ControlGroup } from '../Control/index.js';
	import { Glow } from '../Glow/index.js';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div
	class="akui-desktop-menu-layer {className}"
	transition:fade={{ duration: ANIMATION_DURATION, easing: ANIMATION_EASING }}
>
	<div class="akui-menu-card">
		<Glow />
		<ControlGroup role="menu" class="akui-menu-scroll-area">
			{@render children()}
		</ControlGroup>
	</div>
</div>

<style>
	.akui-desktop-menu-layer {
		z-index: 1001;
		pointer-events: auto;
	}

	.akui-menu-card {
		position: relative;
		background: var(--akui-bg, #ffffff);
		color: var(--akui-fg, #000000);
		border: 1px solid var(--akui-border-input, rgba(0, 0, 0, 0.1));
		border-radius: 0.75rem;
		box-shadow:
			var(--akui-shadow-subtle),
			0 1px 3px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-width: 180px;
		max-width: 320px;
		backdrop-filter: blur(8px);
	}

	.akui-menu-scroll-area {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		max-height: calc(100vh - 32px);
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
