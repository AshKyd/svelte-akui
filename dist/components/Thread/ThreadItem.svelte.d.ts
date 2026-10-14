import { type Snippet } from 'svelte';
import { type AvatarProps } from '../Avatar/Avatar.svelte';
interface Props {
    /** Avatar props, or a snippet that renders your own. Omit for a dot (a threaded post). */
    avatar?: AvatarProps | Snippet;
    /** Offset this item under its parent, with an L-shaped line. Otherwise it sits directly below, on a straight line. */
    indent?: boolean;
    /** Whether the thread lines and the expand button can collapse this item. Defaults to the enclosing `Thread`'s `collapsible`. When off, the lines are plain decoration. */
    collapsible?: boolean;
    /** Whether this item is folded to the first row of its `Message`, hiding the rest and its replies. Clicking the line that connects to it toggles it. Ignored unless collapsible. */
    collapsed?: boolean;
    /** How many replies are hidden, for the expand button's label. Callers know their own data. */
    replyCount?: number;
    /** Label for the expand button when collapsed. Defaults to one built from `replyCount`. */
    collapsedLabel?: string;
    /** Names this item's thread line for screen readers, e.g. "reply from Mabel". Defaults to "thread". */
    lineLabel?: string;
    /** The item's `Message`. */
    children: Snippet;
    /** Nested `ThreadItem`s. */
    replies?: Snippet;
}
declare const ThreadItem: import("svelte").Component<Props, {}, "collapsed">;
type ThreadItem = ReturnType<typeof ThreadItem>;
export default ThreadItem;
