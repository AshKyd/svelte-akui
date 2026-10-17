/**
     * @component TaskItemView
     * The task item's checkbox and content area, rendered inside the `<li>` that `svelteNodeView`
     * manages. Replaces the plain DOM checkbox in Tiptap's own `TaskItem` view with `Checkbox`.
     */
import type { Node as ProseNode } from '@tiptap/pm/model';
import type { SvelteNodeViewProps } from './svelteNodeView.svelte';
interface Props extends SvelteNodeViewProps {
    /** Lets a read-only editor accept a tick. Return false to refuse it. Same as `TaskItem`'s option. */
    onReadOnlyChecked?: (node: ProseNode, checked: boolean) => boolean;
    /** Accessible label override, same as `TaskItem`'s `a11y` option. */
    a11y?: {
        checkboxLabel?: (node: ProseNode, checked: boolean) => string;
    };
}
declare const TaskItemView: import("svelte").Component<Props, {}, "">;
type TaskItemView = ReturnType<typeof TaskItemView>;
export default TaskItemView;
