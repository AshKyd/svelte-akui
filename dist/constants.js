import { expoOut } from 'svelte/easing';
import DOMPurify from 'dompurify';
export const ANIMATION_DURATION = 100;
export const ANIMATION_EASING = expoOut;
/**
 * Central allowlist of safe HTML tags permitted in note formatting and Markdown rendering.
 * Any HTML tag not in this set is treated as plain text and escaped (e.g. &lt;tag&gt;)
 * to ensure code snippets display as text without script execution or layout tampering.
 */
export const ALLOWED_HTML_TAGS = new Set([
    // Structure & Containers
    'p',
    'span',
    'div',
    'br',
    'hr',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Inline Formatting
    'b',
    'strong',
    'i',
    'em',
    's',
    'strike',
    'del',
    'u',
    'sub',
    'sup',
    'mark',
    'ins',
    'small',
    // Code & Quotes
    'code',
    'pre',
    'blockquote',
    'kbd',
    'var',
    'samp',
    // Lists
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    // Links & Media
    'a',
    'img',
    // Form Elements (task list checkboxes only)
    'input',
    // Tables
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    // Interactive Details
    'details',
    'summary'
]);
/**
 * Checks whether an HTML tag name is in the central allowlist.
 */
export function isAllowedHtmlTag(tagName) {
    if (!tagName || typeof tagName !== 'string')
        return false;
    return ALLOWED_HTML_TAGS.has(tagName.toLowerCase().trim());
}
/**
 * Turns everything inside `<code>` back into plain text, so code that mentions HTML survives.
 *
 * The editor renders raw HTML typed inside inline code as `<span data-type="html" data-value="...">`.
 * The sanitiser strips `data-*` attributes and would otherwise drop or reinterpret that markup, so
 * the span's `data-value` (the original source) is used as the text. Other nested elements are
 * escaped as literal markup; plain `<span>`s (e.g. syntax highlighting from a web page) are unwrapped
 * to their text.
 */
function flattenInlineCodeContents(doc, body) {
    body.querySelectorAll('code').forEach((code) => {
        // Deepest first, so each replacement only sees already-flattened children.
        Array.from(code.querySelectorAll('*'))
            .reverse()
            .forEach((el) => {
            const tag = el.tagName.toLowerCase();
            if (tag === 'br')
                return;
            const sourceValue = el.getAttribute('data-value');
            if (sourceValue !== null && el.getAttribute('data-type') === 'html') {
                el.replaceWith(doc.createTextNode(sourceValue));
                return;
            }
            const text = tag === 'span' ? (el.textContent ?? '') : el.outerHTML;
            el.replaceWith(doc.createTextNode(text));
        });
    });
}
/**
 * Central HTML sanitiser used across paste handling and Markdown rendering.
 *
 * - Allows safe tags defined in ALLOWED_HTML_TAGS.
 * - Converts un-allowed tags (e.g. <script>, <style>, <form>, <button>, non-checkbox <input>, <iframe>) into escaped text nodes.
 * - Uses DOMPurify to strip non-essential and styling attributes (style, class, id, onclick, onerror, javascript: URLs).
 */
export function sanitizeHtml(html) {
    if (!html || typeof html !== 'string')
        return '';
    // 1. Extract content between <!--StartFragment--> and <!--EndFragment--> if clipboard fragment comments exist
    const fragmentMatch = html.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/i);
    let rawHtml = fragmentMatch ? fragmentMatch[1] : html;
    let processedHtml = rawHtml;
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${rawHtml}</body>`, 'text/html');
        const body = doc.body;
        if (body) {
            // Strip clipboard metadata & document header tags entirely before sanitising content
            const metadata = Array.from(body.querySelectorAll('meta, link, base, title'));
            metadata.forEach((el) => el.remove());
            flattenInlineCodeContents(doc, body);
            const allElements = Array.from(body.querySelectorAll('*'));
            allElements.forEach((el) => {
                const tag = el.tagName.toLowerCase();
                if (!isAllowedHtmlTag(tag)) {
                    const hasUnallowedAncestor = el.parentElement &&
                        Array.from(allElements).some((parent) => parent.contains(el) &&
                            parent !== el &&
                            !isAllowedHtmlTag(parent.tagName));
                    if (!hasUnallowedAncestor) {
                        const textNode = doc.createTextNode(el.outerHTML);
                        el.replaceWith(textNode);
                    }
                }
                else if (tag === 'input') {
                    // Only allow checkbox inputs (used by task lists); escape any other input types as text
                    const type = (el.getAttribute('type') || '').toLowerCase();
                    if (type !== 'checkbox') {
                        const textNode = doc.createTextNode(el.outerHTML);
                        el.replaceWith(textNode);
                    }
                }
            });
            processedHtml = body.innerHTML;
        }
    }
    const purify = typeof window !== 'undefined' && window.document ? DOMPurify(window) : DOMPurify;
    return purify.sanitize(processedHtml, {
        ALLOWED_TAGS: Array.from(ALLOWED_HTML_TAGS),
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'type', 'checked', 'disabled'],
        ALLOW_DATA_ATTR: false
    });
}
