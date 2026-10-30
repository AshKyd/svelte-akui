import { type AkuiColour } from '../../hooks/themeStore.svelte.js';
interface Props {
    /** Swatches to offer. Defaults to `ACCENT_PRESETS`. */
    presets?: {
        id: string;
        label: string;
        colour: AkuiColour;
    }[];
    /** Show the hue slider for picking any colour. */
    showSlider?: boolean;
    /** Show a native colour input, whose hue and punch become the accent. */
    showColourInput?: boolean;
    /** Accessible label for the swatch group. */
    label?: string;
    /** Called after the accent changes (`null` = back to the theme's own colour). */
    onchange?: (colour: AkuiColour | null) => void;
}
declare const AccentPicker: import("svelte").Component<Props, {}, "">;
type AccentPicker = ReturnType<typeof AccentPicker>;
export default AccentPicker;
