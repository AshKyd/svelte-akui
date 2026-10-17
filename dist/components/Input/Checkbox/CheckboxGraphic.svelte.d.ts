import '../choice.css';
export interface Props {
    /** Whether the box is ticked. */
    checked?: boolean;
    /** Shows a dash instead of a tick. */
    indeterminate?: boolean;
    /** Optional size override. Falls back to group context. */
    size?: 'small' | 'medium' | 'large';
    /** Additional CSS classes for the outer element. */
    class?: string;
}
declare const CheckboxGraphic: import("svelte").Component<Props, {}, "">;
type CheckboxGraphic = ReturnType<typeof CheckboxGraphic>;
export default CheckboxGraphic;
