/** 'warning' is a step that finished, but skipped or failed some items. */
export type ProgressCheckStatus = 'pending' | 'active' | 'done' | 'warning' | 'error';
export interface ProgressCheckStep {
    /** Unique key for the step. */
    id: string;
    /** The step's name. */
    label: string;
    /** Where the step is up to. Defaults to 'pending'. */
    status?: ProgressCheckStatus;
    /** Progress so far. Shows a progress bar on the step when set. */
    value?: number;
    /** The value that counts as complete. Defaults to 1. */
    max?: number;
    /** Text on the right hand side. Defaults to "value / max". */
    detail?: string;
    /** Explains the outcome under the label, e.g. why the step failed or what was skipped. */
    message?: string;
    /** Items left out on purpose, e.g. empty or duplicate notes. Shown under the label. */
    skipped?: number;
    /** Items that could not be processed. Shown under the label. */
    failed?: number;
}
