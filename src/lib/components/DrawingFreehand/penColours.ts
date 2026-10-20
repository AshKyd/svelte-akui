/** A pen colour choice. A missing `value` is the default ink, which follows the theme. */
export interface PenColour {
	name: string;
	value?: string;
}

/**
 * Mid-tones that read on both the light and dark canvas. They're saved as fixed hex fills, so
 * unlike the default ink they don't change with the theme.
 */
export const PEN_COLOURS: PenColour[] = [
	{ name: 'Ink' },
	{ name: 'Red', value: '#e03131' },
	{ name: 'Yellow', value: '#f2b705' },
	{ name: 'Green', value: '#2f9e44' },
	{ name: 'Blue', value: '#1c7ed6' }
];

/** Starting colour for the custom picker before the user has chosen one. */
export const DEFAULT_CUSTOM_COLOUR = '#9c36b5';
