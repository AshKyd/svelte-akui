<script lang="ts">
	/**
	 * @component TaskItemView
	 * The task item's checkbox and content area, rendered inside the `<li>` that `svelteNodeView`
	 * manages. Replaces the plain DOM checkbox in Tiptap's own `TaskItem` view with `Checkbox`.
	 */
	import type { Node as ProseNode } from '@tiptap/pm/model';
	import Checkbox from '../../Input/Checkbox/Checkbox.svelte';
	import type { SvelteNodeViewProps } from './svelteNodeView.svelte';
	interface Props extends SvelteNodeViewProps {
		/** Lets a read-only editor accept a tick. Return false to refuse it. Same as `TaskItem`'s option. */
		onReadOnlyChecked?: (node: ProseNode, checked: boolean) => boolean;
		/** Accessible label override, same as `TaskItem`'s `a11y` option. */
		a11y?: { checkboxLabel?: (node: ProseNode, checked: boolean) => string };
	}

	let { node, editable, updateAttributes, onReadOnlyChecked, a11y }: Props = $props();

	const checked = $derived(Boolean(node.attrs.checked));
	const label = $derived(
		a11y?.checkboxLabel?.(node, checked) ||
			`Task item checkbox for ${node.textContent || 'empty task item'}`
	);

	/** Bumped to make the checkbox re-read `checked` after a refused tick (see `readChecked`). */
	let refusals = $state(0);

	/**
	 * The checkbox is controlled: its state is only ever the document's `checked`. A one-way
	 * `checked={checked}` isn't enough. Completing a task moves its item, and ProseMirror then reuses
	 * this view for a different task. If that task has the same `checked` value as before, the prop
	 * doesn't change, so the checkbox keeps the state from the user's click and shows the wrong tick.
	 * Reading through a getter that depends on `node` re-syncs it on every node update.
	 */
	function readChecked() {
		void refusals;
		// Read `node` itself, not the `checked` derived from it: a derived only notifies when its
		// value changes, and here it is exactly the unchanged value that has gone stale.
		return Boolean(node.attrs.checked);
	}

	/** Toggles in the document when editable. A read-only editor asks `onReadOnlyChecked`, and undoes the tick if it refuses. */
	function writeChecked(nextChecked: boolean) {
		if (editable) {
			updateAttributes({ checked: nextChecked });
			return;
		}
		if (!onReadOnlyChecked?.(node, nextChecked)) refusals++;
	}
</script>

<!-- Not editable text: ProseMirror must not put the caret in here. -->
<span class="akui-task-checkbox" contenteditable="false">
	<Checkbox
		bind:checked={readChecked, writeChecked}
		disabled={!editable && !onReadOnlyChecked}
		aria-label={label}
		onmousedown={(event: MouseEvent) => event.preventDefault()}
	/>
</span>
<!-- ProseMirror renders the item's paragraph (and any nested list) in here. -->
<div data-node-view-content></div>
