import { type Snippet } from 'svelte';
import type { ProgressCheckStep } from './types.js';
interface Props {
    /** The steps to show, in order. */
    steps: ProgressCheckStep[];
    /** Snippet that replaces a step's second line (its note). */
    note?: Snippet<[ProgressCheckStep]>;
    /**
     * Keeps a second line on every step, so rows are a fixed two lines tall instead of sliding
     * open when a note appears. Defaults to false.
     */
    reserveNote?: boolean;
    /** Snippet that replaces a step's status icon. */
    icon?: Snippet<[ProgressCheckStep]>;
    /** Additional CSS classes. */
    class?: string;
}
declare const ProgressChecks: import("svelte").Component<Props, {}, "">;
type ProgressChecks = ReturnType<typeof ProgressChecks>;
export default ProgressChecks;
