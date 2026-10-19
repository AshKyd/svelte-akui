export interface TooltipOptions {
    /** Fixed position or 'auto' (default) */
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    /** Gap between the element and the tooltip. */
    offset?: number;
    /** Extra gap for touch events. */
    touchOffset?: number;
}
/**
 * A Svelte 5 construct to manage tooltip state and positioning.
 * Returns reactive state and event handlers to be applied to a trigger element.
 */
export declare function createTooltip(options?: TooltipOptions): {
    readonly visible: boolean;
    readonly x: number;
    readonly y: number;
    readonly position: "top" | "left" | "right" | "bottom";
    handlers: {
        onmouseenter: (event: MouseEvent | FocusEvent | TouchEvent) => void;
        onmouseleave: () => void;
        onfocus: (event: MouseEvent | FocusEvent | TouchEvent) => void;
        onblur: () => void;
        ontouchstart: (e: TouchEvent) => void;
        ontouchend: () => void;
    };
};
