import { type Snippet } from 'svelte';
import '../theme/theme.css';
import { type AkuiTheme } from '../hooks/themeStore.svelte.js';
interface Props {
    /** The user-configured theme preference ('light', 'dark', or undefined for system or a custom theme). */
    mode?: 'light' | 'dark' | undefined;
    /** The currently active theme mode ('light' or 'dark') resolved based on preference and system settings. */
    resolvedMode?: 'light' | 'dark';
    /** Custom themes offered alongside Light and Dark. `ThemePicker` lists whatever is given here. */
    themes?: AkuiTheme[];
    /** The content to render inside the UI root. */
    children: Snippet;
}
declare const UIRoot: import("svelte").Component<Props, {}, "mode" | "resolvedMode">;
type UIRoot = ReturnType<typeof UIRoot>;
export default UIRoot;
