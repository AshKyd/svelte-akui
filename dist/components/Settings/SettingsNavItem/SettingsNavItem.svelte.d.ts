interface Props {
    /** Text shown for the item. */
    label: string;
    /** Optional icon name (Bootstrap Icon). */
    icon?: string;
    /** Whether this is the active tab. */
    selected?: boolean;
    /** Row size, matching `Tree`. Defaults to 'small'. */
    size?: 'small' | 'large';
    /** Called when the item is pressed. */
    onclick?: (event: MouseEvent) => void;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const SettingsNavItem: import("svelte").Component<Props, {}, "">;
type SettingsNavItem = ReturnType<typeof SettingsNavItem>;
export default SettingsNavItem;
