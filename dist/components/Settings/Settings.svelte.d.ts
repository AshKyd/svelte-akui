import { type Snippet } from 'svelte';
import { type SurfaceStyle } from '../../utils/surface.js';
import type { SettingsSection } from './types.js';
interface Props {
    /** The sections to show, in order. */
    sections: SettingsSection[];
    /** Id of the open section. `null` shows the overview on mobile (desktop falls back to the first section). */
    selectedId?: string | null;
    /** Called with the new id when a section is chosen, or `null` when going back to the overview. Use it to navigate with the router. */
    onselect?: (id: string | null) => void;
    /** Called when the back button on the overview is pressed (e.g. to leave settings). The button is hidden when omitted. */
    onback?: () => void;
    /** Title of the top header (the overview on mobile, the tab column on desktop). */
    title?: string;
    /** Overrides `title` in the top header. */
    titleSnippet?: Snippet;
    /** Overrides the detail header title, which defaults to the section's `title` or `label`. */
    detailTitle?: Snippet<[SettingsSection]>;
    /** Actions on the right of the top header. */
    headerActions?: Snippet;
    /** Actions on the right of the detail header. */
    detailActions?: Snippet<[SettingsSection]>;
    /** Custom navigation (left) content for the top header, shown instead of the back button. */
    headerNavigation?: Snippet;
    /** Overrides the background, text and border of Settings and its headers, e.g. `{ background: 'transparent' }` to show a page background through it. */
    surface?: SurfaceStyle;
    /** Desktop tab size, as `Tree`'s `size`. Defaults to 'small'. */
    size?: 'small' | 'large';
    /** Space around the desktop tab list, from the theme spacing scale (as `Padding`'s `size`). Defaults to 's'. */
    padding?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
    /** Container width in px below which the mobile layout is used. */
    mobileBreakpoint?: number;
    /** Additional CSS classes. */
    class?: string;
}
declare const Settings: import("svelte").Component<Props, {}, "selectedId">;
type Settings = ReturnType<typeof Settings>;
export default Settings;
