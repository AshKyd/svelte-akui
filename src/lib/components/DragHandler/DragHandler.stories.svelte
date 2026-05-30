<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/DragHandler',
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script lang="ts">
	import DragHandler from './DragHandler.svelte';

	let verticalWidth = $state(200);
	let horizontalHeight = $state(150);

	function handleVerticalDrag(detail: { deltaX: number }) {
		verticalWidth = Math.max(100, Math.min(400, verticalWidth + detail.deltaX));
	}

	function handleHorizontalDrag(detail: { deltaY: number }) {
		horizontalHeight = Math.max(80, Math.min(300, horizontalHeight + detail.deltaY));
	}
</script>

<Story name="Vertical Handler (Resizable Box)">
	<div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
		<p style="margin: 0; font-size: 0.9rem; color: var(--akui-fg-secondary);">
			Drag the handler to resize the width (min 100px, max 400px): {verticalWidth}px
		</p>
		<div
			style="display: flex; height: 200px; border: 1px solid var(--akui-border-input); border-radius: 8px; overflow: hidden;"
		>
			<div
				style="width: {verticalWidth}px; background-color: var(--akui-bg-secondary, #f3f4f6); display: flex; align-items: center; justify-content: center; transition: none;"
			>
				Main Pane
			</div>
			<DragHandler orientation="vertical" onDrag={handleVerticalDrag} />
			<div
				style="flex: 1; min-width: 150px; background-color: var(--akui-bg, #ffffff); display: flex; align-items: center; justify-content: center;"
			>
				Content
			</div>
		</div>
	</div>
</Story>

<Story name="Horizontal Handler">
	<div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
		<p style="margin: 0; font-size: 0.9rem; color: var(--akui-fg-secondary);">
			Drag the handler to resize the height (min 80px, max 300px): {horizontalHeight}px
		</p>
		<div
			style="display: flex; flex-direction: column; width: 300px; border: 1px solid var(--akui-border-input); border-radius: 8px; overflow: hidden;"
		>
			<div
				style="height: {horizontalHeight}px; background-color: var(--akui-bg-secondary, #f3f4f6); display: flex; align-items: center; justify-content: center; transition: none;"
			>
				Top Pane
			</div>
			<DragHandler orientation="horizontal" onDrag={handleHorizontalDrag} />
			<div
				style="flex: 1; min-height: 80px; background-color: var(--akui-bg, #ffffff); display: flex; align-items: center; justify-content: center; padding: 1rem;"
			>
				Bottom Content
			</div>
		</div>
	</div>
</Story>
