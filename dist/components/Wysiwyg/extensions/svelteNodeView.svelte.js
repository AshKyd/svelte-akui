import { mount, unmount } from 'svelte';
import { getRenderedAttributes } from '@tiptap/core';
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
export function svelteNodeView(view, { tag = 'div', contentSelector = '[data-node-view-content]', extraProps, context } = {}) {
    return ({ node, decorations, getPos, editor }) => {
        const dom = document.createElement(tag);
        // Raw state: nodes and editors are class instances, and a deep proxy would break them.
        let state = $state.raw({
            node,
            decorations: decorations,
            selected: false,
            editable: editor.isEditable
        });
        const props = {
            get node() {
                return state.node;
            },
            get decorations() {
                return state.decorations;
            },
            get selected() {
                return state.selected;
            },
            get editable() {
                return state.editable;
            },
            editor,
            getPos: () => {
                const pos = getPos();
                return typeof pos === 'number' ? pos : undefined;
            },
            updateAttributes: (attributes) => {
                const chain = editor.chain();
                if (editor.isEditable)
                    chain.focus(undefined, { scrollIntoView: false });
                chain
                    .command(({ tr }) => {
                    const pos = getPos();
                    if (typeof pos !== 'number')
                        return false;
                    const current = tr.doc.nodeAt(pos);
                    tr.setNodeMarkup(pos, undefined, { ...current?.attrs, ...attributes });
                    return true;
                })
                    .run();
            },
            ...extraProps
        };
        // Mirror the node's rendered HTML attributes (e.g. `data-checked`) onto the root, and drop
        // the ones that stopped being rendered. Matches Tiptap's own node views.
        let renderedKeys = new Set();
        const syncAttributes = (current) => {
            const rendered = getRenderedAttributes(current, editor.extensionManager.attributes);
            renderedKeys.forEach((key) => {
                if (!(key in rendered))
                    dom.removeAttribute(key);
            });
            Object.entries(rendered).forEach(([key, value]) => {
                if (value === null || value === undefined)
                    dom.removeAttribute(key);
                else
                    dom.setAttribute(key, String(value));
            });
            renderedKeys = new Set(Object.keys(rendered));
        };
        syncAttributes(node);
        // `mount` builds the template DOM synchronously, so the content element can be found at
        // once. Don't `flushSync()` here: views are created while Tiptap applies content, which can
        // happen inside a Svelte effect (Wysiwyg's value sync), where flushing throws.
        const instance = mount(view, { target: dom, props, context });
        const contentDOM = dom.querySelector(contentSelector) ?? undefined;
        return {
            dom,
            contentDOM,
            update: (updated, updatedDecorations) => {
                if (updated.type !== state.node.type)
                    return false;
                state = {
                    ...state,
                    node: updated,
                    decorations: updatedDecorations,
                    editable: editor.isEditable
                };
                syncAttributes(updated);
                return true;
            },
            selectNode: () => {
                state = { ...state, selected: true };
            },
            deselectNode: () => {
                state = { ...state, selected: false };
            },
            stopEvent: (event) => {
                const target = event.target;
                if (!target || !dom.contains(target))
                    return false;
                return !contentDOM?.contains(target);
            },
            ignoreMutation: (mutation) => {
                const target = mutation.target;
                return !(contentDOM && (target === contentDOM || contentDOM.contains(target)));
            },
            destroy: () => {
                unmount(instance);
            }
        };
    };
}
