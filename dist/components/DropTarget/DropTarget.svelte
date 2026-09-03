<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { dropTarget, type DragPayload, type DropTargetOptions } from '../../hooks/dropManager.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'ondrop' | 'ondragenter' | 'ondragleave'> {
		/** Function validating if the active drag payload can be dropped */
		canDrop?: (payload: DragPayload) => boolean;
		/** Callback invoked when a payload is dropped onto this target */
		ondrop?: (payload: DragPayload, event?: PointerEvent | DragEvent) => void;
		/** Callback invoked when a drag enters this target */
		ondragenter?: (payload: DragPayload) => void;
		/** Callback invoked when a drag leaves this target */
		ondragleave?: () => void;
		/** The content to render inside the drop target */
		children?: Snippet<[{ isOver: boolean; canDrop: boolean; isDragging: boolean; activePayload: DragPayload | null }]>;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		canDrop,
		ondrop,
		ondragenter,
		ondragleave,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	const target = dropTarget({
		get canDrop() { return canDrop; },
		get ondrop() { return ondrop; },
		get ondragenter() { return ondragenter; },
		get ondragleave() { return ondragleave; }
	});
</script>

<div
	{@attach target.attach}
	class="akui-drop-target {className}"
	class:akui-drop-target-is-dragging={target.isDragging}
	class:akui-drop-target-is-over={target.isOver}
	class:akui-drop-target-can-drop={target.isOver && target.canDrop}
	{...restProps}
>
	{@render children?.({
		isOver: target.isOver,
		canDrop: target.canDrop,
		isDragging: target.isDragging,
		activePayload: target.activePayload
	})}
</div>

<style>
	.akui-drop-target {
		position: relative;
		box-sizing: border-box;
	}
</style>
