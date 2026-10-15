import { mount, unmount } from 'svelte';
import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import { computePosition, flip, shift, size } from '@floating-ui/dom';
import {
	defaultSlashItems,
	filterSlashItems,
	runSlashItem,
	type SlashItem,
	type SlashMenuConfig
} from '../slashItems';
import SlashMenu from '../SlashMenu.svelte';
import { createSlashMenuState, slashOptionId } from '../slashMenuState.svelte';

export interface SlashCommandOptions {
	config: SlashMenuConfig;
	/** Element the menu is appended to, so it inherits the akui theme variables. */
	host: HTMLElement | null;
}

let menuCounter = 0;

/**
 * One open slash menu session: the akui menu surface in a `fixed` popup, plus the combobox ARIA
 * wiring on the editor. The editor keeps focus the whole time, so the highlighted item is exposed
 * with `aria-activedescendant` (the WAI-ARIA combobox pattern) instead of moving focus.
 */
function openSlashMenu(
	host: HTMLElement,
	initial: SuggestionProps<SlashItem, SlashItem>,
	itemSize: SlashMenuConfig['size']
) {
	const menuId = `akui-wysiwyg-slash-${++menuCounter}`;
	const editorElement = initial.editor.view.dom;
	let props = initial;

	const popup = document.createElement('div');
	popup.className = 'akui-wysiwyg-slash-popup';
	Object.assign(popup.style, { position: 'fixed', zIndex: '1000', left: '0', top: '0' });
	host.appendChild(popup);

	const state = createSlashMenuState((item) => props.command(item));
	const component = mount(SlashMenu, { target: popup, props: { state, menuId, size: itemSize } });

	/** Syncs the editor's combobox attributes with the highlighted item. */
	const syncAria = () => {
		const active = state.items[state.selectedIndex];
		editorElement.setAttribute('aria-activedescendant', active ? slashOptionId(menuId, active.id) : '');
	};

	editorElement.setAttribute('role', 'combobox');
	editorElement.setAttribute('aria-haspopup', 'menu');
	editorElement.setAttribute('aria-expanded', 'true');
	editorElement.setAttribute('aria-controls', menuId);

	/** Positions below the caret, flipping above and limiting height so it fits above mobile keyboards. */
	const reposition = () => {
		const clientRect = props.clientRect?.();
		if (!clientRect) return;
		computePosition({ getBoundingClientRect: () => clientRect }, popup, {
			strategy: 'fixed',
			placement: 'bottom-start',
			middleware: [
				flip({ padding: 8 }),
				shift({ padding: 8 }),
				size({
					padding: 8,
					apply({ availableHeight }) {
						popup.style.setProperty(
							'--akui-slash-max-height',
							`${Math.max(Math.min(availableHeight, 320), 80)}px`
						);
					}
				})
			]
		}).then(({ x, y }) => Object.assign(popup.style, { left: `${x}px`, top: `${y}px` }));
	};

	return {
		update(next: SuggestionProps<SlashItem, SlashItem>) {
			props = next;
			state.items = next.items;
			state.selectedIndex = Math.min(state.selectedIndex, Math.max(next.items.length - 1, 0));
			syncAria();
			reposition();
		},
		/** Returns true when the key was consumed by the menu. */
		onKeyDown({ event }: SuggestionKeyDownProps): boolean {
			const count = state.items.length;
			if (!count) return false;

			const moves: Record<string, number> = {
				ArrowDown: (state.selectedIndex + 1) % count,
				ArrowUp: (state.selectedIndex - 1 + count) % count,
				Home: 0,
				End: count - 1
			};
			const next = moves[event.key];
			if (next !== undefined) {
				state.selectedIndex = next;
				syncAria();
				return true;
			}
			if (event.key === 'Enter' || event.key === 'Tab') {
				props.command(state.items[state.selectedIndex]);
				return true;
			}
			return false;
		},
		destroy() {
			['role', 'aria-haspopup', 'aria-expanded', 'aria-controls', 'aria-activedescendant'].forEach(
				(attribute) => editorElement.removeAttribute(attribute)
			);
			unmount(component);
			popup.remove();
		}
	};
}

/**
 * "/" command menu. Typing "/" at a word boundary opens the menu, further text filters it, arrow keys
 * move, Enter/Tab runs and Escape closes (handled by `@tiptap/suggestion`).
 */
export const SlashCommand = Extension.create<SlashCommandOptions>({
	name: 'akuiSlashCommand',

	addOptions() {
		return { config: {}, host: null };
	},

	addProseMirrorPlugins() {
		const { config, host } = this.options;
		const allItems = config.items ? config.items(defaultSlashItems) : defaultSlashItems;

		return [
			Suggestion<SlashItem, SlashItem>({
				editor: this.editor,
				char: '/',
				allowSpaces: false,
				// Ignore "/" inside code blocks.
				allow: ({ state, range }) =>
					state.doc.resolve(range.from).parent.type.name !== 'codeBlock',
				items: ({ query }) => filterSlashItems(allItems, query),
				command: ({ editor, range, props: item }) => runSlashItem(editor, range, item),
				render: () => {
					let menu: ReturnType<typeof openSlashMenu> | null = null;
					return {
						onStart: (props) => {
							if (!host) return;
							menu = openSlashMenu(host, props, config.size);
							menu.update(props);
						},
						onUpdate: (props) => menu?.update(props),
						onKeyDown: (props) => menu?.onKeyDown(props) ?? false,
						onExit: () => {
							menu?.destroy();
							menu = null;
						}
					};
				}
			})
		];
	}
});
