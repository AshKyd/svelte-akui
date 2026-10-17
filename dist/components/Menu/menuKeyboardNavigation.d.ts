/**
 * @file
 * Keyboard navigation for `role="menu"` surfaces, following the WAI-ARIA menu pattern.
 */
import type { Attachment } from 'svelte/attachments';
/**
 * Arrow Up/Down move focus between menu items (wrapping), Home/End jump to the first/last, and typing
 * a character jumps to the next item whose text starts with it. Escape and Tab are left to the host
 * (`Menu` closes on the dialog's cancel event).
 */
export declare const menuKeyboardNavigation: Attachment<HTMLElement>;
