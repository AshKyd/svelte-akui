export type SliderColour = 'accent' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber';

export interface SliderSegment {
	/** Value where this segment ends. The last segment always runs to `max`. */
	to: number;
	/** Fill colour for this segment. Falls back to the slider's `colour`. */
	colour?: SliderColour;
	/** Tooltip text for the segment's track. */
	label?: string;
}
