/** Context key for the state a `Thread` shares with its `ThreadItem`s. */
export declare const THREAD_CONTEXT: unique symbol;
export interface ThreadState {
    /** Whether items can be collapsed by default. */
    readonly collapsible: boolean;
}
/** Context key for the state a `ThreadItem` shares with the `Message` rendered inside it. */
export declare const THREAD_ITEM_CONTEXT: unique symbol;
export interface ThreadItemState {
    /** Whether the item is collapsed, so its `Message` should show only its header row. */
    readonly collapsed: boolean;
}
