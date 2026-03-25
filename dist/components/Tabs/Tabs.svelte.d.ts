import type { Snippet } from 'svelte';
/**
 * Represents a single tab item.
 */
export interface TabItem {
    /** Unique identifier for the tab. */
    id: string;
    /** Human-readable label for the tab. */
    label: string;
    /** Optional content to render when the tab is active. */
    content?: Snippet;
}
/**
 * Props for the Tabs component.
 */
export interface Props {
    /** Array of tab items. */
    items: TabItem[];
    /** Currently active tab ID. Bindable. */
    activeId?: string;
    /** Additional CSS classes for the container. */
    class?: string;
    /** Inline styles for the container. */
    style?: string;
    /** Spread remaining attributes to the container. */
    [key: string]: unknown;
}
declare const Tabs: import("svelte").Component<Props, {}, "activeId">;
type Tabs = ReturnType<typeof Tabs>;
export default Tabs;
