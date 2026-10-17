import { TaskItem } from '@tiptap/extension-list';
import { svelteNodeView } from './svelteNodeView.svelte';
import TaskItemView from './TaskItemView.svelte';
/**
 * Tiptap's `TaskItem` with the checkbox rendered by akui's `Checkbox` component. Schema, markdown
 * and keyboard behaviour are unchanged: only the node view is replaced.
 */
export const SvelteTaskItem = TaskItem.extend({
    addOptions() {
        return { ...this.parent?.(), context: undefined };
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
