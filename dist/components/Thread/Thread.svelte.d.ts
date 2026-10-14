import { type Snippet } from 'svelte';
interface Props {
    /** The top-level `ThreadItem`s. */
    children: Snippet;
    /** Let the thread lines and expand buttons collapse items. When off (the default), the lines are plain decoration with no interaction. Each `ThreadItem` can override it. */
    collapsible?: boolean;
    /** `small` is compact, `medium` is airy like Slack, `large` is roomy like WordPress comments. */
    size?: 'small' | 'medium' | 'large';
    /** Overrides the size's avatar diameter (and avatar column width). Any CSS length. */
    avatarSize?: string;
    /** Overrides the size's space between the avatar column and the message. Any CSS length. */
    gap?: string;
}
declare const Thread: import("svelte").Component<Props, {}, "">;
type Thread = ReturnType<typeof Thread>;
export default Thread;
