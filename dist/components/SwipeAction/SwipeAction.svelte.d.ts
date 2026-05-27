import { type Snippet } from 'svelte';
interface SwipeStatus {
    /** The current swipe percentage from 0 to 1 relative to the threshold */
    percentage: number;
    /** Whether the swipe has reached or exceeded the threshold */
    thresholdReached: boolean;
}
interface Props {
    /** Custom snippet or Bootstrap Icon name to render when swiping right (revealing left action) */
    leftIcon?: string | Snippet<[SwipeStatus]>;
    /** Background colour of the left action area (e.g. 'var(--akui-color-green-bg)') */
    leftBackgroundColour?: string;
    /** Foreground colour of the left action area (e.g. 'var(--akui-color-green-fg)') */
    leftForegroundColour?: string;
    /** Callback triggered when the item is swiped right past the threshold and released */
    onSwipeRight?: () => void;
    /** Custom snippet or Bootstrap Icon name to render when swiping left (revealing right action) */
    rightIcon?: string | Snippet<[SwipeStatus]>;
    /** Background colour of the right action area (e.g. 'var(--akui-color-pink-bg)') */
    rightBackgroundColour?: string;
    /** Foreground colour of the right action area (e.g. 'var(--akui-color-pink-fg)') */
    rightForegroundColour?: string;
    /** Callback triggered when the item is swiped left past the threshold and released */
    onSwipeLeft?: () => void;
    /** Distance in pixels required to trigger the action */
    threshold?: number;
    /** The main content to wrap inside the swipe action row */
    children: Snippet;
}
declare const SwipeAction: import("svelte").Component<Props, {}, "">;
type SwipeAction = ReturnType<typeof SwipeAction>;
export default SwipeAction;
