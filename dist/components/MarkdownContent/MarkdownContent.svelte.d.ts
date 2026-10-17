interface Props {
    /** The markdown string content to render. */
    content: string;
    /**
     * How task-list checkboxes (`- [x]`) are drawn. `native` keeps the browser's disabled
     * checkbox. `graphic` swaps each for a `CheckboxGraphic`: the same look as `Checkbox`, with
     * no input behind it. Read when the content changes.
     */
    checkboxes?: 'native' | 'graphic';
    /** Size of `graphic` checkboxes. Defaults to `small`. */
    checkboxSize?: 'small' | 'medium' | 'large';
    /** Additional CSS classes to apply to the wrapper. */
    class?: string;
}
declare const MarkdownContent: import("svelte").Component<Props, {}, "">;
type MarkdownContent = ReturnType<typeof MarkdownContent>;
export default MarkdownContent;
