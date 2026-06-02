<script lang="ts">
	import { createTooltip } from '../Tooltip/tooltip.svelte.js';
	import Tooltip from '../Tooltip/Tooltip.svelte';
	import Glow from '../Glow/Glow.svelte';

	interface BoxProps {
		complete: boolean;
		colour: string;
		label?: string;
		size: number;
	}

	let {
		complete,
		colour,
		label,
		size
	}: BoxProps = $props();

	const tooltip = createTooltip({ position: 'top', offset: 6 });

	// Map predefined color names to CSS variables/values
	const completeColor = $derived.by(() => {
		if (!colour) return 'var(--akui-bg-accent)';
		if (colour === 'accent') return 'var(--akui-bg-accent)';
		if (['blue', 'green', 'orange', 'pink', 'purple', 'amber'].includes(colour)) {
			return `var(--akui-color-${colour}-fg)`;
		}
		return colour; // support custom hex/rgb colors
	});
</script>

<div
	class="akui-progress-box"
	class:complete
	style="
		width: {size}px;
		height: {size}px;
		--box-color: {completeColor};
	"
	{...tooltip.handlers}
>
	{#if complete}
		<Glow />
	{/if}
</div>

{#if label && tooltip.visible}
	<Tooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y} position={tooltip.position}>
		<div class="akui-progress-tooltip-content">
			{label}
		</div>
	</Tooltip>
{/if}

<style>
	.akui-progress-box {
		border-radius: var(--akui-radius-s, 4px);
		background-color: var(--akui-bg-secondary);
		border: 1px solid var(--akui-border-input);
		transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
		position: relative;
		box-sizing: border-box;
	}

	.akui-progress-box.complete {
		background-color: var(--box-color);
		border-color: var(--box-color);
	}

	.akui-progress-tooltip-content {
		padding: 4px 8px;
		font-size: 0.8rem;
		font-weight: 500;
	}
</style>
