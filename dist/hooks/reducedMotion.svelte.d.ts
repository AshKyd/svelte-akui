/**
 * Tracks reduced-motion preferences. Uses the system setting by default,
 * but allows a user override saved in localStorage.
 */
declare class ReducedMotionState {
    /** Live OS-level `prefers-reduced-motion` value. */
    systemPrefers: boolean;
    /** Explicit user choice, or `null` to follow the system setting. */
    override: boolean | null;
    /** The effective preference: the override if one is set, otherwise the system setting. */
    value: boolean;
    /** True while an explicit override is stored, overriding the system setting. */
    isOverridden: boolean;
    constructor();
    /** Sets an explicit preference, clearing the stored override when it matches the system setting. */
    set(next: boolean): void;
    /** Toggles the effective preference. */
    toggle(): void;
}
export declare const reducedMotion: ReducedMotionState;
export {};
