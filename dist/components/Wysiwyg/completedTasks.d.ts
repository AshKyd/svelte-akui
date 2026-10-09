import { Plugin } from '@milkdown/kit/prose/state';
import { DecorationSet } from '@milkdown/kit/prose/view';
/**
 * Completed tasks section.
 *
 * Ticking a task item moves it to the top of its list's "completed section": the run of ticked
 * items at the end of the list. Unticking moves it to the end of the active items. The section
 * gets a header button that collapses it.
 *
 * The section is not stored anywhere: it is just where the ticked items sit in the markdown, so the
 * saved note keeps the same order. Collapsing is view-only and resets when the editor reloads.
 */
interface CompletedTasksState {
    /** Whether every completed section in this editor is collapsed. */
    collapsed: boolean;
    decorations: DecorationSet;
}
/**
 * Index of the first item in the trailing run of ticked items (the completed section), or the
 * list length when there is none.
 *
 * Also the target index for a just-toggled item among its list's other items: a ticked item goes to
 * the top of the completed section, an unticked one goes to the end of the active items, and both
 * are this same index.
 */
export declare function completedSectionStart(itemsTicked: boolean[]): number;
/** ProseMirror plugin that groups ticked task items into a collapsible completed section. */
export declare function createCompletedTasksPlugin(): Plugin<CompletedTasksState>;
export {};
