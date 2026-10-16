import type { Editor, Range } from '@tiptap/core';

/** One entry in the "/" slash menu. */
export interface SlashItem {
	/** Stable identifier. */
	id: string;
	/** Text shown in the menu. */
	label: string;
	/** Bootstrap icon name shown before the label, as on `MenuItem`. */
	icon?: string;
	/** Extra search terms matched alongside the label. */
	keywords?: string[];
	/** Runs after the typed "/query" has been removed. */
	onRun: (editor: Editor) => void;
}

/** Slash menu options. */
export interface SlashMenuConfig {
	/** Receives the default items and returns the list to show. Use it to hide, reorder or add commands. */
	items?: (defaults: SlashItem[]) => SlashItem[];
	/** Item density. 'small' condenses the menu. Defaults to 'small'. */
	size?: 'small' | 'large';
}

export const defaultSlashItems: SlashItem[] = [
	{
		id: 'text',
		label: 'Text',
		icon: 'text-paragraph',
		keywords: ['paragraph', 'plain'],
		onRun: (editor) => editor.chain().focus().setParagraph().run()
	},
	{
		id: 'h1',
		label: 'Heading 1',
		icon: 'type-h1',
		keywords: ['title', 'h1'],
		onRun: (editor) => editor.chain().focus().setHeading({ level: 1 }).run()
	},
	{
		id: 'h2',
		label: 'Heading 2',
		icon: 'type-h2',
		keywords: ['subtitle', 'h2'],
		onRun: (editor) => editor.chain().focus().setHeading({ level: 2 }).run()
	},
	{
		id: 'h3',
		label: 'Heading 3',
		icon: 'type-h3',
		keywords: ['h3'],
		onRun: (editor) => editor.chain().focus().setHeading({ level: 3 }).run()
	},
	{
		id: 'quote',
		label: 'Quote',
		icon: 'quote',
		keywords: ['blockquote', 'cite'],
		onRun: (editor) => editor.chain().focus().setBlockquote().run()
	},
	{
		id: 'bullet-list',
		label: 'Bullet list',
		icon: 'list-ul',
		keywords: ['ul', 'unordered'],
		onRun: (editor) => editor.chain().focus().toggleBulletList().run()
	},
	{
		id: 'ordered-list',
		label: 'Numbered list',
		icon: 'list-ol',
		keywords: ['ol', 'ordered'],
		onRun: (editor) => editor.chain().focus().toggleOrderedList().run()
	},
	{
		id: 'task-list',
		label: 'Task list',
		icon: 'check2-square',
		keywords: ['todo', 'checklist', 'checkbox'],
		onRun: (editor) => editor.chain().focus().toggleTaskList().run()
	},
	{
		id: 'code-block',
		label: 'Code block',
		icon: 'code-square',
		keywords: ['pre', 'snippet'],
		onRun: (editor) => editor.chain().focus().setCodeBlock().run()
	},
	{
		id: 'divider',
		label: 'Divider',
		icon: 'hr',
		keywords: ['hr', 'rule', 'line'],
		onRun: (editor) => editor.chain().focus().setHorizontalRule().run()
	}
];

/** Case-insensitive match against label, id and keywords. */
export function filterSlashItems(items: SlashItem[], query: string): SlashItem[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return items;
	return items.filter(({ label, id, keywords = [] }) =>
		[label, id, ...keywords].some((term) => term.toLowerCase().includes(needle))
	);
}

/** Removes the typed "/query" then runs the item. */
export function runSlashItem(editor: Editor, range: Range, item: SlashItem) {
	editor.chain().focus().deleteRange(range).run();
	item.onRun(editor);
}
