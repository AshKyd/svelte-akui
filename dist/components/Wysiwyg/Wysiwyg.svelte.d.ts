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
}
declare const Wysiwyg: import("svelte").Component<Props, {
    focus: (collapseToStart?: boolean) => boolean;
}, "value">;
type Wysiwyg = ReturnType<typeof Wysiwyg>;
export default Wysiwyg;
