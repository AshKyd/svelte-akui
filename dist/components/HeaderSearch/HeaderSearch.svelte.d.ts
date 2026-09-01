import { type Snippet } from 'svelte';
interface Props {
    /** Whether searching mode is currently active. */
    isSearching?: boolean;
    /** The current active search query string. */
    searchQuery?: string;
    /** Placeholder text displayed inside the search input. */
    placeholder?: string;
    /** Debounce delay in milliseconds before updating searchQuery. Defaults to 200ms. */
    debounce?: number;
    /** Mode of display: 'takeover' overlays the parent header with an animation, 'inline' displays as a standard element. */
    mode?: 'takeover' | 'inline';
    /** Optional custom snippet to render on the leading side of the input. Defaults to a search icon. */
    prefix?: Snippet;
    /** Optional custom snippet to render between the input and the close button. */
    suffix?: Snippet;
    /** Callback triggered whenever the debounced search query changes. */
    onsearch?: (query: string) => void;
    /** Callback triggered when search mode is activated or deactivated. */
    onsearchtoggle?: (isSearching: boolean) => void;
    /** Additional CSS classes for the container. */
    class?: string;
}
declare const HeaderSearch: import("svelte").Component<Props, {}, "isSearching" | "searchQuery">;
type HeaderSearch = ReturnType<typeof HeaderSearch>;
export default HeaderSearch;
