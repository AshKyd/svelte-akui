export interface ProgressItem {
    /** Unique identifier for keying items */
    id: string | number;
    /** Indicates if this specific task or item update has finished */
    complete: boolean;
    /** Optional colour override for when this item lights up */
    colour?: string;
    /** Friendly text shown in the tooltip on hover */
    label?: string;
}
interface Props {
    /** List of items to track and render as status boxes */
    items: ProgressItem[];
    /** Fallback colour theme name to use for complete boxes */
    colour?: 'accent' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber';
    /** Class names added to the root element wrapper */
    class?: string;
}
declare const ProgressXmasTree: import("svelte").Component<Props, {}, "">;
type ProgressXmasTree = ReturnType<typeof ProgressXmasTree>;
export default ProgressXmasTree;
