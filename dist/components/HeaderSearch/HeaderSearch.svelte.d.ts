import { type Snippet } from 'svelte';
import { type SurfaceStyle } from '../../utils/surface.js';
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
    /**
     * Overrides the bar's background, text colour and border colour. `backdropFilter` is ignored:
     * a blur nested inside the Header's own blur would only see the Header, not what is behind it.
     * In 'takeover' mode the bar is drawn over the Header's content, so with a translucent `background` the consumer must hide that content while searching.
     */
    surface?: SurfaceStyle;
    /** Additional CSS classes for the container. */
    class?: string;
}
declare const HeaderSearch: import("svelte").Component<Props, {}, "isSearching" | "searchQuery">;
type HeaderSearch = ReturnType<typeof HeaderSearch>;
export default HeaderSearch;
