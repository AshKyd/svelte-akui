import { TaskItem, type TaskItemOptions } from '@tiptap/extension-list';
import { svelteNodeView } from './svelteNodeView.svelte';
import TaskItemView from './TaskItemView.svelte';

export interface SvelteTaskItemOptions extends TaskItemOptions {
	/** Svelte context for the mounted checkbox, so it can read the same context as the editor's host. */
	context?: Map<unknown, unknown>;
}

/**
 * Tiptap's `TaskItem` with the checkbox rendered by akui's `Checkbox` component. Schema, markdown
 * and keyboard behaviour are unchanged: only the node view is replaced.
 */
export const SvelteTaskItem = TaskItem.extend<SvelteTaskItemOptions>({
	addOptions() {
		return { ...this.parent?.(), context: undefined } as SvelteTaskItemOptions;
	},

	addNodeView() {
		const { onReadOnlyChecked, a11y, context } = this.options;
		return svelteNodeView(TaskItemView, {
			tag: 'li',
			extraProps: { onReadOnlyChecked, a11y },
			context
		});
	}
});
