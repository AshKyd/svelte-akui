import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
interface Props {
    /** Bindable current value of the editor. */
    value?: string;
    /** Optional placeholder text displayed when editor is empty. Defaults to empty string. */
    placeholder?: string;
    /** Callback when content changes. */
    onchange?: (value: string) => void;
    /** Custom loader snippet. If not provided, falls back to the default Loader. */
    loader?: import('svelte').Snippet;
    /** Minimum height reserved for the editor area. Any CSS length. Defaults to '250px'. */
    minHeight?: string;
    /** Additional CSS classes for the editor container. */
    class?: string;
    /** Optional hook to transform or sanitize pasted HTML before insertion. */
    transformPastedHTML?: (html: string) => string;
    /** Optional hook to transform or sanitize pasted plain text or markdown before insertion. */
    transformPastedText?: (text: string, plain: boolean) => string;
    /** Optional paste event handler. Return true to prevent default editor paste behaviour. */
    handlePaste?: (event: ClipboardEvent) => boolean | void;
}
declare const Wysiwyg: import("svelte").Component<Props, {
    focus: (collapseToStart?: boolean) => boolean;
    focusAtWordIndex: (index: number) => Promise<boolean>;
}, "value">;
type Wysiwyg = ReturnType<typeof Wysiwyg>;
export default Wysiwyg;
