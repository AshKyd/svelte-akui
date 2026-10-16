import { mount, unmount, type Component } from 'svelte';
import { getRenderedAttributes, type Editor, type NodeViewRenderer } from '@tiptap/core';
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
export function svelteNodeView<ExtraProps extends object = Record<never, never>>(
	view: Component<SvelteNodeViewProps & ExtraProps>,
	{
		tag = 'div',
		contentSelector = '[data-node-view-content]',
		extraProps,
		context
	}: SvelteNodeViewOptions<ExtraProps> = {}
): NodeViewRenderer {
	return ({ node, decorations, getPos, editor }) => {
		const dom = document.createElement(tag);

		// Raw state: nodes and editors are class instances, and a deep proxy would break them.
		let state = $state.raw({
			node,
			decorations: decorations as readonly Decoration[],
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
			updateAttributes: (attributes: Record<string, unknown>) => {
				const chain = editor.chain();
				if (editor.isEditable) chain.focus(undefined, { scrollIntoView: false });
				chain
					.command(({ tr }) => {
						const pos = getPos();
						if (typeof pos !== 'number') return false;
						const current = tr.doc.nodeAt(pos);
						tr.setNodeMarkup(pos, undefined, { ...current?.attrs, ...attributes });
						return true;
					})
					.run();
			},
			...extraProps
		} as SvelteNodeViewProps & ExtraProps;

		// Mirror the node's rendered HTML attributes (e.g. `data-checked`) onto the root, and drop
		// the ones that stopped being rendered. Matches Tiptap's own node views.
		let renderedKeys = new Set<string>();
		const syncAttributes = (current: ProseNode) => {
			const rendered = getRenderedAttributes(current, editor.extensionManager.attributes);
			renderedKeys.forEach((key) => {
				if (!(key in rendered)) dom.removeAttribute(key);
			});
			Object.entries(rendered).forEach(([key, value]) => {
				if (value === null || value === undefined) dom.removeAttribute(key);
				else dom.setAttribute(key, String(value));
			});
			renderedKeys = new Set(Object.keys(rendered));
		};
		syncAttributes(node);

		// `mount` builds the template DOM synchronously, so the content element can be found at
		// once. Don't `flushSync()` here: views are created while Tiptap applies content, which can
		// happen inside a Svelte effect (Wysiwyg's value sync), where flushing throws.
		const instance = mount(view, { target: dom, props, context });

		const contentDOM = dom.querySelector<HTMLElement>(contentSelector) ?? undefined;

		return {
			dom,
			contentDOM,
			update: (updated: ProseNode, updatedDecorations: readonly Decoration[]) => {
				if (updated.type !== state.node.type) return false;
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
			stopEvent: (event: Event) => {
				const target = event.target as Node | null;
				if (!target || !dom.contains(target)) return false;
				return !contentDOM?.contains(target);
			},
			ignoreMutation: (mutation) => {
				const target = mutation.target as Node;
				return !(contentDOM && (target === contentDOM || contentDOM.contains(target)));
			},
			destroy: () => {
				unmount(instance);
			}
		};
	};
}
