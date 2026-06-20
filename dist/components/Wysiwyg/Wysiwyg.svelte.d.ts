import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
interface Props {
    /** Bindable current value of the editor. */
    value?: string;
    /** Callback when content changes. */
    onchange?: (value: string) => void;
    /** Custom loader snippet. If not provided, falls back to the default Loader. */
    loader?: import('svelte').Snippet;
    /** Additional CSS classes for the editor container. */
    class?: string;
}
declare const Wysiwyg: import("svelte").Component<Props, {}, "value">;
type Wysiwyg = ReturnType<typeof Wysiwyg>;
export default Wysiwyg;
