import { type AkuiTheme } from '../../hooks/themeStore.svelte.js';
import { type ThemeGroupBy } from './themePickerOptions.js';
interface Props {
    /** Show the "System" option, which follows the OS colour scheme. */
    includeSystem?: boolean;
    /** Headed groups: `scheme` (light/dark), `group` (each theme's `group` field) or `none`. */
    groupBy?: ThemeGroupBy;
    /** Accessible label for the radio group. */
    label?: string;
    /** Called after the user picks a theme (`null` = System). */
    onchange?: (theme: AkuiTheme | null) => void;
}
declare const ThemePicker: import("svelte").Component<Props, {}, "">;
type ThemePicker = ReturnType<typeof ThemePicker>;
export default ThemePicker;
