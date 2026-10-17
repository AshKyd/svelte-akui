import { type TaskItemOptions } from '@tiptap/extension-list';
export interface SvelteTaskItemOptions extends TaskItemOptions {
    /** Svelte context for the mounted checkbox, so it can read the same context as the editor's host. */
    context?: Map<unknown, unknown>;
}
/**
 * Tiptap's `TaskItem` with the checkbox rendered by akui's `Checkbox` component. Schema, markdown
 * and keyboard behaviour are unchanged: only the node view is replaced.
 */
export declare const SvelteTaskItem: import("@tiptap/core").Node<SvelteTaskItemOptions, any>;
