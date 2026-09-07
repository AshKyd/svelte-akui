import {} from 'svelte';
/**
 * Shortest auto-dismiss timeout we allow, in milliseconds. WCAG 2.2.1 (Timing Adjustable) warns
 * against short, unavoidable time limits; anything between 1 and this value is raised to it. Pass
 * `timeout: 0` (or omit it) for a notification that never auto-dismisses.
 */
export const MIN_TIMEOUT = 5000;
/** Clamp a raw `timeout` to either 0 (sticky) or at least {@link MIN_TIMEOUT}. */
export function resolveTimeout(timeout) {
    return timeout && timeout > 0 ? Math.max(timeout, MIN_TIMEOUT) : 0;
}
