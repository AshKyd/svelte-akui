import { expoOut } from 'svelte/easing';
export declare const ANIMATION_DURATION = 100;
export declare const ANIMATION_EASING: typeof expoOut;
/**
 * Central allowlist of safe HTML tags permitted in note formatting and Markdown rendering.
 * Any HTML tag not in this set is treated as plain text and escaped (e.g. &lt;tag&gt;)
 * to ensure code snippets display as text without script execution or layout tampering.
 */
export declare const ALLOWED_HTML_TAGS: ReadonlySet<string>;
/**
 * Checks whether an HTML tag name is in the central allowlist.
 */
export declare function isAllowedHtmlTag(tagName: string): boolean;
/**
 * Central HTML sanitiser used across paste handling and Markdown rendering.
 *
 * - Allows safe tags defined in ALLOWED_HTML_TAGS.
 * - Converts un-allowed tags (e.g. <script>, <style>, <form>, <button>, non-checkbox <input>, <iframe>) into escaped text nodes.
 * - Uses DOMPurify to strip non-essential and styling attributes (style, class, id, onclick, onerror, javascript: URLs).
 */
export declare function sanitizeHtml(html: string): string;
