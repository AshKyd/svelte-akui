<script lang="ts">
	import { createTooltip, Tooltip } from '../Tooltip/index.js';
	import Padding from '../Padding/Padding.svelte';
	import { formatRelativeTime } from './date.js';

	interface Props {
		/** The date or timestamp to display */
		date: Date | number | string;
		/** The threshold in days before falling back to short date format (default: 7) */
		thresholdDays?: number;
		/** Position of the tooltip relative to the time tag (default: 'top') */
		tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
		/** Disable the hover/focus tooltip (default: false) */
		disableTooltip?: boolean;
	}

	let {
		date,
		thresholdDays = 7,
		tooltipPosition = 'top',
		disableTooltip = false
	}: Props = $props();

	const d = $derived(new Date(date));
	const relativeText = $derived(formatRelativeTime(d, thresholdDays));

	// Format full date in system locale for the tooltip
	const fullDateText = $derived(
		d.toLocaleString(undefined, {
			dateStyle: 'full',
			timeStyle: 'short'
		})
	);

	const tooltip = createTooltip({ position: tooltipPosition });
</script>

<time
	{...!disableTooltip ? tooltip.handlers : {}}
	datetime={d.toISOString()}
	class="akui-relative-time"
	class:has-tooltip={!disableTooltip}
>
	{relativeText}
</time>

{#if !disableTooltip}
	<Tooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y} position={tooltip.position}>
		<Padding size="s">
			<span class="akui-tooltip-text">
				{fullDateText}
			</span>
		</Padding>
	</Tooltip>
{/if}

<style>
	.akui-relative-time {
		display: inline;
	}

	.akui-relative-time.has-tooltip {
		text-decoration: underline dotted rgba(128, 128, 128, 0.4);
	}

	.akui-tooltip-text {
		white-space: nowrap;
		font-size: 0.85rem;
		color: var(--akui-fg);
	}
</style>
