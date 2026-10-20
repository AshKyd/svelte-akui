export declare const SVG_NS = "http://www.w3.org/2000/svg";
export declare const SHAPE_TAGS: Set<string>;
/** Guards against a hostile or enormous file locking up the tab while it is mounted and measured. */
export declare const MAX_NODES = 20000;
export interface SanitisedChild {
    /** The top-level node in the parsed document this came from, so callers can keep document order. */
    source: Element;
    /** A clean copy, built in the live document from allow-listed tags and attributes only. */
    node: Element;
}
/**
 * Sanitises the top-level children of a parsed SVG root, except those `skip` says are already
 * handled. The root itself is never copied, only its children.
 */
export declare function sanitiseChildren(root: Element, skip?: (child: Element) => boolean): SanitisedChild[];
/**
 * How much the root's `width` / `height` scales its `viewBox`. Only the scale is used: shapes
 * stay in the root's own coordinates, so a file we saved ourselves (scale 1, offset viewBox)
 * reloads exactly where it was.
 */
export declare function getRootScale(root: Element): number;
