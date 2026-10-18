import { Extension } from '@tiptap/core';
export interface HeadingAutoDemoteOptions {
    /** Longest first-line heading, in characters, that is left as a heading. */
    maxLength: number;
}
/**
 * Turns the first-line H1 back into a paragraph once its text is longer than `maxLength`.
 * A long first line is more likely the start of a sentence than a title.
 *
 * It acts once per editor: after the first demotion it stops, so a user who turns the line back
 * into a heading by hand is not overruled.
 */
export declare const HeadingAutoDemote: Extension<HeadingAutoDemoteOptions, any>;
