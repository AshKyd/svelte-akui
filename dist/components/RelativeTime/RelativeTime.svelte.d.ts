interface Props {
    /** The date or timestamp to display */
    date: Date | number | string;
    /** The threshold in days before falling back to short date format (default: 7) */
    thresholdDays?: number;
    /** Position of the tooltip relative to the time tag (default: 'top') */
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    /** Disable the hover/focus tooltip (default: false) */
    disableTooltip?: boolean;
}
declare const RelativeTime: import("svelte").Component<Props, {}, "">;
type RelativeTime = ReturnType<typeof RelativeTime>;
export default RelativeTime;
