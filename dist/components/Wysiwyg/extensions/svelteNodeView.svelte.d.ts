import { type Component } from 'svelte';
import { type Editor, type NodeViewRenderer } from '@tiptap/core';
import type { Node as ProseNode } from '@tiptap/pm/model';
import type { Decoration } from '@tiptap/pm/view';
/**
 * Props every Svelte node view component receives. They stay reactive: `update()` from
 * ProseMirror changes them in place, the component is never re-mounted.
 */
export interface SvelteNodeViewProps {
    /** The ProseMirror node this view renders. Replaced (not mutated) on every change. */
    node: ProseNode;
    /** Whether the node is currently selected as a node selection. */
    selected: boolean;
    /** Decorations applied to this node. */
    decorations: readonly Decoration[];
    /** Whether the editor is editable right now. Re-read on each node update. */
    editable: boolean;
    editor: Editor;
    /** Position of the node in the document, or undefined if it has been removed. */
    getPos: () => number | undefined;
    /**
     * Merges attributes into the node. Uses `setNodeMarkup` (not an attribute step), as Tiptap's own
     * node views do, because plugins such as `completedTasks` depend on that step type.
     */
    updateAttributes: (attributes: Record<string, unknown>) => void;
}
export interface SvelteNodeViewOptions<ExtraProps extends object> {
    /** Tag of the root element ProseMirror manages. Defaults to `div`. */
    tag?: string;
    /**
     * CSS selector, relative to the root, for the element ProseMirror renders the node's content
     * into. The component must render it. Leave the element empty. Omit it for leaf nodes with no
     * editable content. Defaults to `[data-node-view-content]`.
     */
    contentSelector?: string;
    /** Extra props passed to the component on top of {@link SvelteNodeViewProps}. */
    extraProps?: ExtraProps;
    /**
     * Svelte context for the mounted component. Components mounted this way sit outside the
     * component tree that created the editor, so without this `getContext` returns nothing.
     */
    context?: Map<unknown, unknown>;
}
/**
 * Builds a Tiptap node view that renders a Svelte component.
 *
 * Use it in a node extension's `addNodeView()`:
 *
 * ```ts
 * Node.create({ addNodeView: () => svelteNodeView(MyView, { tag: 'li' }) });
 * ```
 *
 * The component renders everything inside the root element. If the node has editable content,
 * it renders an empty element matching `contentSelector` and ProseMirror fills that in.
 *
 * Two rules keep ProseMirror and Svelte from fighting over the DOM:
 * - `ignoreMutation` ignores changes outside the content element, so Svelte re-rendering the
 *   component doesn't make ProseMirror re-parse the node.
 * - `stopEvent` keeps events inside the component away from ProseMirror, so clicks on a
 *   checkbox or button don't move the selection.
 */
export declare function svelteNodeView<ExtraProps extends object = Record<never, never>>(view: Component<SvelteNodeViewProps & ExtraProps>, { tag, contentSelector, extraProps, context }?: SvelteNodeViewOptions<ExtraProps>): NodeViewRenderer;
