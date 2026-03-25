<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div class="akui-mobile-menu-layer {className}">
	<div class="akui-menu-mobile-handle"></div>
	<div class="akui-menu-content">
		{@render children()}
	</div>
</div>

<style>
	.akui-mobile-menu-layer {
		background: var(--akui-bg);
		color: var(--akui-fg);
		border-radius: var(--akui-radius-xl) var(--akui-radius-xl) 0 0;
		border-top: 1px solid var(--akui-border-input);
		padding-bottom: env(safe-area-inset-bottom, 16px);
		box-shadow: 0 -10px 40px -10px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 100%;
	}

	.akui-menu-mobile-handle {
		width: 36px;
		height: 4px;
		background: var(--akui-bg-button-hover);
		border-radius: 2px;
		margin: 12px auto 4px auto;
		flex-shrink: 0;
		opacity: 0.5;
	}

	.akui-menu-content {
		flex: 1;
		overflow-y: auto;
		max-height: 70vh;
	}
</style>
