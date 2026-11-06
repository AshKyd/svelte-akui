export type SliderColour = 'accent' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber';
export interface SliderTick {
    /** Where the tick sits, in the slider's value units. */
    value: number;
    /** Text under the tick. Leave out for a bare mark. */
    label?: string;
}
/** A fill colour, or `none` to leave that part as empty track. */
export type SliderFillColour = SliderColour | 'none';
export interface SliderSegment {
    /** Value where this segment ends. The last segment always runs to `max`. */
    to: number;
    /** Fill colour for this segment. Falls back to the slider's `colour`. */
    colour?: SliderFillColour;
    /** Tooltip text for the segment's track. */
    label?: string;
}
