/** A pen colour choice. A missing `value` is the default ink, which follows the theme. */
export interface PenColour {
    name: string;
    value?: string;
}
/**
 * Mid-tones that read on both the light and dark canvas. They're saved as fixed hex fills, so
 * unlike the default ink they don't change with the theme.
 */
export declare const PEN_COLOURS: PenColour[];
/** Starting colour for the custom picker before the user has chosen one. */
export declare const DEFAULT_CUSTOM_COLOUR = "#9c36b5";
