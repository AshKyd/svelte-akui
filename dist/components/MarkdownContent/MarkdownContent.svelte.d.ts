interface Props {
    /** The markdown string content to render. */
    content: string;
    /** Additional CSS classes to apply to the wrapper. */
    class?: string;
}
declare const MarkdownContent: import("svelte").Component<Props, {}, "">;
type MarkdownContent = ReturnType<typeof MarkdownContent>;
export default MarkdownContent;
