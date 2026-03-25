import { type Snippet } from 'svelte';
import '../theme/theme.css';
interface Props {
    /** Optional theme mode override ('light' or 'dark'). If not provided, follows system preference. */
    mode?: 'light' | 'dark';
    /** The content to render inside the UI root. */
    children: Snippet;
}
declare const UIRoot: import("svelte").Component<Props, {}, "">;
type UIRoot = ReturnType<typeof UIRoot>;
export default UIRoot;
