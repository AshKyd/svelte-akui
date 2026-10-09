import { type Snippet } from 'svelte';
import type { AkuiTheme } from '../hooks/themeStore.svelte.js';
interface Props {
    /** The child component (the story). */
    children: Snippet;
    /** Optional theme mode override ('light' or 'dark'). */
    mode?: 'light' | 'dark';
    /** Custom themes for the story's `UIRoot`, set via the story parameter `akuiThemes`. */
    themes?: AkuiTheme[];
}
declare const StorybookDecorator: import("svelte").Component<Props, {}, "">;
type StorybookDecorator = ReturnType<typeof StorybookDecorator>;
export default StorybookDecorator;
