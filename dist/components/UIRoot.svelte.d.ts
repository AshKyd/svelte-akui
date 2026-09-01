import { type Snippet } from 'svelte';
import '../theme/theme.css';
interface Props {
    /** The user-configured theme preference ('light', 'dark', or undefined/null for system preference). */
    mode?: 'light' | 'dark' | undefined;
    /** The currently active theme mode ('light' or 'dark') resolved based on preference and system settings. */
    resolvedMode?: 'light' | 'dark';
    /** The content to render inside the UI root. */
    children: Snippet;
}
declare const UIRoot: import("svelte").Component<Props, {}, "mode" | "resolvedMode">;
type UIRoot = ReturnType<typeof UIRoot>;
export default UIRoot;
