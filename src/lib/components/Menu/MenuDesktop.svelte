<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ControlGroup } from '../Control/index.ts';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div class="akui-desktop-menu-layer {className}" transition:fade={{ duration: 250 }}>
	<div class="akui-menu-card">
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
		background: var(--akui-bg, #ffffff);
		color: var(--akui-fg, #000000);
		border: 1px solid var(--akui-border, rgba(255, 255, 255, 0.1));
		border-radius: 0.75rem;
		box-shadow:
			var(--akui-shadow-shiny),
			0 10px 25px -5px rgba(0, 0, 0, 0.3);
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
