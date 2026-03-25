<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div class="akui-desktop-menu-layer {className}">
	<div class="akui-menu-card">
		<div class="akui-menu-scroll-area">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.akui-menu-card {
		background: var(--akui-bg);
		color: var(--akui-fg);
		border-radius: var(--akui-radius-l);
		border: 1px solid var(--akui-border-input);
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
		min-width: 200px;
		max-width: 320px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.akui-menu-scroll-area {
		flex: 1;
		overflow-y: auto;
		max-height: calc(100vh - 32px);
	}

	/* Ensure snippet content fills area */
	.akui-menu-scroll-area :global(> *) {
		min-width: 100%;
	}
</style>
