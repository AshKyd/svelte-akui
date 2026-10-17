import { Extension } from '@tiptap/core';
/**
 * Editor shortcuts on top of the StarterKit defaults (bold, italic, strike, code, undo/redo).
 * `Mod` is Cmd on macOS and Ctrl elsewhere.
 */
export const Keybindings = Extension.create({
    name: 'akuiKeybindings',
    addKeyboardShortcuts() {
        const { editor } = this;
        return {
            // Block types
            'Mod-Alt-0': () => editor.commands.setParagraph(),
            'Mod-Alt-1': () => editor.commands.toggleHeading({ level: 1 }),
            'Mod-Alt-2': () => editor.commands.toggleHeading({ level: 2 }),
            'Mod-Alt-3': () => editor.commands.toggleHeading({ level: 3 }),
            'Mod-Alt-c': () => editor.commands.toggleCodeBlock(),
            'Mod-Shift-b': () => editor.commands.toggleBlockquote(),
            // Lists
            'Mod-Shift-7': () => editor.commands.toggleOrderedList(),
            'Mod-Shift-8': () => editor.commands.toggleBulletList(),
            'Mod-Shift-9': () => editor.commands.toggleTaskList(),
            Tab: () => editor.commands.sinkListItem('taskItem') || editor.commands.sinkListItem('listItem'),
            'Shift-Tab': () => editor.commands.liftListItem('taskItem') || editor.commands.liftListItem('listItem'),
            // Enter on a ticked task starts the next task unticked, so new items aren't born "done".
            Enter: () => {
                const { $from } = editor.state.selection;
                const item = $from.node(-1);
                if (item?.type.name !== 'taskItem' || item.attrs.checked !== true)
                    return false;
                if ($from.parent.content.size === 0)
                    return false;
                return editor
                    .chain()
                    .splitListItem('taskItem')
                    .updateAttributes('taskItem', { checked: false })
                    .run();
            },
            // Link: prompts for a URL; an empty answer removes the link.
            'Mod-k': () => {
                const previous = editor.getAttributes('link').href;
                const url = window.prompt('Link URL', previous ?? 'https://');
                if (url === null)
                    return true;
                if (url.trim() === '') {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    return true;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
                return true;
            }
        };
    }
});
/** Shortcut reference shown in the stories and docs. */
export const KEYBINDING_REFERENCE = [
    { keys: 'Mod-B / Mod-I / Mod-Shift-S', action: 'Bold / italic / strikethrough' },
    { keys: 'Mod-E', action: 'Inline code' },
    { keys: 'Mod-K', action: 'Add, edit or remove a link' },
    { keys: 'Mod-Alt-0 … 3', action: 'Paragraph / heading 1-3' },
    { keys: 'Mod-Alt-C', action: 'Code block' },
    { keys: 'Mod-Shift-B', action: 'Quote' },
    { keys: 'Mod-Shift-7 / 8 / 9', action: 'Numbered / bullet / task list' },
    { keys: 'Tab / Shift-Tab', action: 'Indent / outdent list item' },
    { keys: 'Mod-Z / Mod-Shift-Z', action: 'Undo / redo' },
    { keys: '/', action: 'Open the command menu' }
];
