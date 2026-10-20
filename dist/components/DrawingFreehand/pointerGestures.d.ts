import type { Tool } from './tools/types';
import { type View } from './viewTransform';
interface PointerGestureOptions {
    /** The tool for a gesture that is starting. `useEraser` is true while Alt is held on press. */
    getTool(useEraser: boolean): Tool;
    getView(): View;
    setView(view: View): void;
}
/**
 * Decides what each pointer does:
 * - one pointer (mouse, pen or touch) runs the active tool;
 * - a second touch cancels the tool and the two fingers pan and zoom;
 * - once a pen has been seen, a single touch is ignored (palm rejection) but two still pan/zoom;
 * - mouse wheel pans, ctrl+wheel (trackpad pinch) zooms, middle button or Space+drag pans.
 *
 * Listeners are added with `addEventListener` rather than Svelte's `on*` attributes because wheel
 * handlers there are passive and couldn't stop the page scrolling or browser zooming.
 */
export declare function createPointerGestures({ getTool, getView, setView }: PointerGestureOptions): {
    attach: (node: HTMLElement) => () => void;
};
export {};
