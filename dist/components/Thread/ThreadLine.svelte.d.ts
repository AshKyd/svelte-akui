interface Props {
    /** Whether the item this line belongs to is collapsed. */
    collapsed: boolean;
    /** Names the thread for screen readers, e.g. "reply from Mabel". Defaults to "thread". */
    label?: string;
    /** Called when the line is clicked or activated by keyboard. */
    ontoggle: () => void;
    /** Called as the pointer enters (`true`) or leaves (`false`) the line. */
    onhover: (hovered: boolean) => void;
    /** Called when keyboard focus (`:focus-visible`) lands on (`true`) or leaves (`false`) the line. */
    onfocusvisible: (focused: boolean) => void;
}
declare const ThreadLine: import("svelte").Component<Props, {}, "">;
type ThreadLine = ReturnType<typeof ThreadLine>;
export default ThreadLine;
