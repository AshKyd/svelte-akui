interface Props {
    /** Text label for the item. */
    label: string;
    /** Icon name to display. */
    icon: string;
    /** Active state. */
    active?: boolean;
    /** Optional href to render the item as an anchor link. */
    href?: string;
    /** Click handler. */
    onclick?: (event: MouseEvent) => void;
    /** Additional CSS classes. */
    class?: string;
}
declare const NavigationBarItem: import("svelte").Component<Props, {}, "">;
type NavigationBarItem = ReturnType<typeof NavigationBarItem>;
export default NavigationBarItem;
