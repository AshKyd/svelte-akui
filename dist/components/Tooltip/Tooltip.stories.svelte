<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tooltip from './Tooltip.svelte';
	import { createTooltip } from './index.js';
	import Button from '../Button/Button.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Small from '../Small/Small.svelte';

	const { Story } = defineMeta({
		title: 'Components/Tooltip',
		tags: ['autodocs']
	});
</script>

<Story name="Manual Props">
	<div style="padding: 60px; display: flex; justify-content: center; position: relative;">
		<Tooltip visible={true} x={200} y={40} position="bottom">
			<Padding size="s">
				<strong>Standalone Tooltip</strong>
				<Small>Rendered with manual x/y props</Small>
			</Padding>
		</Tooltip>
	</div>
</Story>

<Story name="With Construct">
	{@const tooltip = createTooltip({ position: 'top' })}
	<div style="padding: 100px; display: flex; justify-content: center;">
		<Button {...tooltip.handlers} variant="accent">Hover or Touch Me</Button>
		<Tooltip 
			visible={tooltip.visible} 
			x={tooltip.x} 
			y={tooltip.y} 
			position={tooltip.position}
		>
			<Padding size="s">
				Tooltip triggered by construct!
			</Padding>
		</Tooltip>
	</div>
</Story>

<Story name="Rich Multi-line">
	{@const tooltip = createTooltip({ position: 'bottom' })}
	<div style="padding: 100px; display: flex; justify-content: center;">
		<Button {...tooltip.handlers}>Rich Content</Button>
		<Tooltip 
			visible={tooltip.visible} 
			x={tooltip.x} 
			y={tooltip.y} 
			position={tooltip.position}
		>
			<Padding size="m">
				<div style="display: flex; flex-direction: column; gap: 8px; min-width: 150px;">
					<strong>Advanced Tooltip</strong>
					<Small>This tooltip uses glassmorphism and backdrop blur.</Small>
					<hr style="border: 0; border-top: 1px solid rgba(128,128,128,0.2); margin: 0;" />
					<Small colour="secondary">Positioning is automatic based on screen space.</Small>
				</div>
			</Padding>
		</Tooltip>
	</div>
</Story>

<Story name="Automatic Positioning">
	{@const topT = createTooltip()}
	{@const bottomT = createTooltip()}
	
	<div style="height: 300px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 20px;">
		<div>
			<Button size="small" {...topT.handlers}>Top of Container</Button>
			<Tooltip visible={topT.visible} x={topT.x} y={topT.y} position={topT.position}>
				<Padding size="s">Flipped to bottom!</Padding>
			</Tooltip>
		</div>

		<div>
			<Button size="small" {...bottomT.handlers}>Bottom of Container</Button>
			<Tooltip visible={bottomT.visible} x={bottomT.x} y={bottomT.y} position={bottomT.position}>
				<Padding size="s">Flipped up to top!</Padding>
			</Tooltip>
		</div>
	</div>
</Story>
