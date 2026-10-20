<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component` here: each story renders DrawingFreehand itself. The Storybook decorator
	// already provides UIRoot, so the theme toolbar drives the stroke and background colours.
	const { Story } = defineMeta({
		title: 'Components/DrawingFreehand',
		parameters: { layout: 'fullscreen' }
	});
</script>

<script lang="ts">
	import DrawingFreehand from './DrawingFreehand.svelte';
	import type { ToolId } from './tools/types';
	import excalidrawSvg from './svgImport/__fixtures__/excalidraw-shapes.svg?raw';
	import nestedSvg from './svgImport/__fixtures__/nested-attributes.svg?raw';
	import inkscapeSvg from './svgImport/__fixtures__/inkscape-styled.svg?raw';

	let tool = $state<ToolId>('pen');

	/** A small saved drawing (a pointed hat) to show that an existing SVG loads for editing. */
	const PRELOADED_SVG =
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" class="supports-dark-mode" fill="#1e1e1e"><path id="gnome-hat" d="M20.00,80.00 Q60.00,0.00 100.00,80.00 T98.00,84.00 62.00,70.00 22.00,84.00 Z"/></svg>';
</script>

<Story name="Interactive">
	{#snippet children()}
		<div style="height: 100dvh;">
			<DrawingFreehand bind:tool />
		</div>
	{/snippet}
</Story>

<!-- Shapes from other apps load as erasable outlines. Try the eraser and a dark theme. -->
<Story name="Imported: Excalidraw-style">
	{#snippet children()}
		<div style="height: 100dvh;">
			<DrawingFreehand svg={excalidrawSvg} />
		</div>
	{/snippet}
</Story>

<Story name="Imported: nested transforms and shapes">
	{#snippet children()}
		<div style="height: 100dvh;">
			<DrawingFreehand svg={nestedSvg} />
		</div>
	{/snippet}
</Story>

<!-- CSS styles are not read, so the geometry loads but the colours fall back to the ink. -->
<Story name="Imported: Inkscape (styles ignored)">
	{#snippet children()}
		<div style="height: 100dvh;">
			<DrawingFreehand svg={inkscapeSvg} />
		</div>
	{/snippet}
</Story>

<Story name="Preloaded">
	{#snippet children()}
		<div style="height: 100dvh;">
			<DrawingFreehand svg={PRELOADED_SVG} />
		</div>
	{/snippet}
</Story>
