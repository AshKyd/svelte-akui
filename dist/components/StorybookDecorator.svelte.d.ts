import { type Snippet } from 'svelte';
import type { AkuiTheme } from '../hooks/themeStore.svelte.js';
interface Props {
    /** The child component (the story). */
    children: Snippet;
    /** Optional theme mode override ('light' or 'dark'). */
    mode?: 'light' | 'dark';
    /** Custom themes for the story's `UIRoot`, set via the story parameter `akuiThemes`. */
    themes?: AkuiTheme[];
    /** Sets `--akui-alpha-surface` (0 to 1) so components using the `-surface` tokens turn translucent. Opaque when unset. */
    surfaceAlpha?: number;
}
declare const StorybookDecorator: import("svelte").Component<Props, {}, "">;
type StorybookDecorator = ReturnType<typeof StorybookDecorator>;
export default StorybookDecorator;
