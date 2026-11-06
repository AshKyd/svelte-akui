/**
     * @component Slider
     * A split-bar slider with a scrubber (`mode="range"`, a native `<input type="range">` underneath
     * for keyboard, touch and forms) or a read-only progress bar (`mode="progress"`).
     */
import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { SliderFillColour, SliderSegment, SliderTick } from './types.js';
/** What a custom `thumb` snippet is given. */
export interface ThumbState {
    /** Current value. */
    value: number;
    /** Position along the bar, 0 to 1. */
    fraction: number;
    /** CSS colour of the segment the value is in. */
    colour: string;
    loading: boolean;
    disabled: boolean;
}
export interface Props extends Omit<HTMLInputAttributes, 'value' | 'min' | 'max' | 'step' | 'type' | 'class' | 'disabled' | 'height' | 'size'> {
    /** Current value. Bindable in `range` mode. */
    value?: number;
    /** Lowest value. */
    min?: number;
    /** Highest value. */
    max?: number;
    /** Step for the range input. */
    step?: number | 'any';
    /** `range` has a draggable scrubber; `progress` is a read-only bar. */
    mode?: 'range' | 'progress';
    /** Bar thickness. A number is px; a string is any CSS length. */
    height?: number | string;
    /** Fill colour before the value, and for any segment without its own. `none` leaves it empty track. */
    colour?: SliderFillColour;
    /**
     * Fill colour after the value. Default `none` (empty track). For a ratio of two things set a
     * different colour on each side; set both the same for an all-one-colour bar; set both `none`
     * for an all-empty track with just the scrubber. `segment` keeps every segment in its own
     * colour on both sides, so the whole bar shows all the stages.
     */
    afterColour?: SliderFillColour | 'segment';
    /** Splits the bar into separate coloured stages. Each ends at `to`; the last runs to `max`. */
    segments?: SliderSegment[];
    /** Turns the bar into a loader: the scrubber fades out and the fill becomes a candy cane. */
    loading?: boolean;
    /** Thins and dims the bar and blocks input. */
    disabled?: boolean;
    /** Accessible name. */
    label?: string;
    /** Accessible text for the value, e.g. "1:32 of 4:10". */
    valueText?: string;
    /** Removes the gaps between segments so they read as one bar. Only the outer ends and the split are rounded. */
    joined?: boolean;
    /** Replaces the scrubber's face. It is centred on the scrubber, which keeps its position, bounce and fade. */
    thumb?: Snippet<[ThumbState]>;
    /** Tick marks under the bar. A number is an unlabelled tick; `{ value, label }` adds a label. */
    ticks?: (number | SliderTick)[];
    /** Adds an unlabelled tick every this many units from `min`. `ticks` can relabel any of them. */
    tickStep?: number;
    /** `edges` left-aligns the first tick label and right-aligns the last so they stay inside the slider; `centre` centres every label under its mark. */
    tickLabelAlign?: 'edges' | 'centre';
    /** Snaps the value to the nearest tick (from `ticks` or `tickStep`). The arrow, Home and End keys jump tick to tick. */
    snap?: boolean;
    /** `circle` is a round handle; `rect` is a tall, narrow handle with lightly rounded corners. */
    thumbShape?: 'circle' | 'rect';
    /** Scrubber height (and width, for `circle`). A number is px; a string is any CSS length. Defaults to a size based on `height`. */
    thumbSize?: number | string;
    /** Additional CSS classes for the container. */
    class?: string;
}
declare const Slider: import("svelte").Component<Props, {}, "value">;
type Slider = ReturnType<typeof Slider>;
export default Slider;
