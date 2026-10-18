import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
/**
 * Turns the first-line H1 back into a paragraph once its text is longer than `maxLength`.
 * A long first line is more likely the start of a sentence than a title.
 *
 * It acts once per editor: after the first demotion it stops, so a user who turns the line back
 * into a heading by hand is not overruled.
 */
export const HeadingAutoDemote = Extension.create({
    name: 'akuiHeadingAutoDemote',
    addOptions: () => ({ maxLength: Infinity }),
    addProseMirrorPlugins() {
        const { maxLength } = this.options;
        let hasDemoted = false;
        return [
            new Plugin({
                key: new PluginKey('akuiHeadingAutoDemote'),
                appendTransaction: (transactions, _oldState, newState) => {
                    // Loading a value (setContent with emitUpdate: false) is not the user typing.
                    const isTyped = transactions.some((tr) => tr.docChanged && !tr.getMeta('preventUpdate'));
                    if (hasDemoted || !isTyped)
                        return null;
                    const first = newState.doc.firstChild;
                    const isTooLong = first?.type.name === 'heading' &&
                        first.attrs.level === 1 &&
                        first.textContent.length > maxLength;
                    if (!isTooLong)
                        return null;
                    hasDemoted = true;
                    return newState.tr.setNodeMarkup(0, newState.schema.nodes.paragraph);
                }
            })
        ];
    }
});
