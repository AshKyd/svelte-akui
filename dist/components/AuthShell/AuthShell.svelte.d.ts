import { type Snippet } from 'svelte';
interface Props {
    /** Desktop background image URL */
    backgroundImage?: string;
    /** Dark mode desktop background image URL */
    darkBackgroundImage?: string;
    /** Mobile background image URL (falls back to backgroundImage) */
    mobileBackgroundImage?: string;
    /** Dark mode mobile background image URL */
    darkMobileBackgroundImage?: string;
    /** Minimum pixels to reserve above the panel on mobile viewports (default: 120) */
    mobileReservePixels?: number;
    /** Loading state: slides form out to the left and runs a spinner */
    loading?: boolean;
    /** Optional URL for the back button */
    backTo?: string;
    /** Key representing the current view state (e.g. 'login', 'register'). Triggers slide animations. */
    viewState?: string;
    /** Physical direction the slide animation should flow (default: 'up') */
    slideDirection?: 'left' | 'right' | 'up' | 'down' | 'none';
    /** Animation timing customization */
    transitionParams?: {
        duration?: number;
        delay?: number;
    };
    /** Child content (form, buttons, etc.) */
    children: Snippet;
}
declare const AuthShell: import("svelte").Component<Props, {}, "">;
type AuthShell = ReturnType<typeof AuthShell>;
export default AuthShell;
