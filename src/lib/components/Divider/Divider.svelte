<script lang="ts">
	interface Props {
		/** Orientation of the divider. Defaults to horizontal */
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	}

	let { orientation = 'horizontal', class: className = '' }: Props = $props();
</script>

{#if orientation === 'horizontal'}
	<hr class="akui-divider akui-divider-horizontal {className}" />
{:else}
	<div
		role="separator"
		aria-orientation="vertical"
		class="akui-divider akui-divider-vertical {className}"
	></div>
{/if}

<style>
	.akui-divider {
		margin: 0;
		padding: 0;
		border: none;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.akui-divider-horizontal {
		width: 100%;
		height: 2px; /* 1px top + 1px bottom */
	}

	.akui-divider-vertical {
		height: 100%;
		width: 2px; /* 1px left + 1px right */
		display: inline-block;
		vertical-align: middle;
	}

	/* Dark mode (engraved effect: darker on top/left, lighter on bottom/right) */
	:global([data-theme='dark']) .akui-divider-horizontal {
		border-top: 1px solid rgba(0, 0, 0, 0.8);
		border-bottom: 1px solid var(--akui-bg-button);
	}

	:global([data-theme='dark']) .akui-divider-vertical {
		border-left: 1px solid rgba(0, 0, 0, 0.8);
		border-right: 1px solid var(--akui-bg-button);
	}

	/* Light mode (reversed: darker on top, lighter on bottom to retain engraved effect) */
	:global([data-theme='light']) .akui-divider-horizontal,
	:root .akui-divider-horizontal {
		border-top: 1px solid var(--akui-border-input);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	:global([data-theme='light']) .akui-divider-vertical,
	:root .akui-divider-vertical {
		border-left: 1px solid var(--akui-border-input);
		border-right: 1px solid rgba(0, 0, 0, 0.1);
	}
</style>
