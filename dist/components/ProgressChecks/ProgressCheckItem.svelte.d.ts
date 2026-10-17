import { type Snippet } from 'svelte';
import type { ProgressCheckStatus } from './types.js';
interface Props {
    /** The step's name, e.g. "Uploading notes". */
    label: string;
    /** Where the step is up to. Sets the icon: a spinner while active, then a coloured check or cross. */
    status?: ProgressCheckStatus;
    /** Progress so far. Shown on the right as "value / max" when `max` is above 1. */
    value?: number;
    /** The value that counts as complete. Defaults to 1. */
    max?: number;
    /** Text on the right hand side. Defaults to "value / max" when `value` is set. */
    detail?: string;
    /** Explains the outcome under the label, e.g. why the step failed. */
    message?: string;
    /** Items left out on purpose. Shown under the label. */
    skipped?: number;
    /** Items that could not be processed. Shown under the label. */
    failed?: number;
    /** Snippet for the second line. Replaces the text built from `message`, `skipped` and `failed`. */
    note?: Snippet;
    /** Always keeps the second line, so the row is a fixed two lines tall. Defaults to false. */
    reserveNote?: boolean;
    /** Snippet that replaces the status icon. */
    icon?: Snippet<[ProgressCheckStatus]>;
    /** Additional CSS classes. */
    class?: string;
}
declare const ProgressCheckItem: import("svelte").Component<Props, {}, "">;
type ProgressCheckItem = ReturnType<typeof ProgressCheckItem>;
export default ProgressCheckItem;
