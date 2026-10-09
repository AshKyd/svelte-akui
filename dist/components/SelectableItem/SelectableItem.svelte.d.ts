/**
     * @component SelectableItem
     * A selectable card of any content, backed by a real radio button or checkbox so it works in
     * regular forms (`name`, `value`, `required`, reset, submit) and keeps native keyboard and
     * screen-reader behaviour: arrow keys inside a radio group, Space on a checkbox.
     *
     * It supplies only the behaviour and the feedback: hover tint, pressed look, an inset glow
     * when selected and a `:focus-visible` ring. The design inside, and any border or background,
     * belongs to the caller (give it a `class`; the selected state is exposed as `data-checked`).
     */
import type { Snippet } from 'svelte';
interface Props {
    /** `radio` picks one item of a `name` group; `checkbox` toggles independently. */
    type?: 'radio' | 'checkbox';
    /** Radio only: the `value` of the selected item in the group. Bind it with `bind:group`. */
    group?: string;
    /** Checkbox only: whether the item is ticked. */
    checked?: boolean;
    /** Submitted with the form when the item is selected. Required for radios. */
    value?: string;
    /** Form field name. Radios sharing a `name` form one group. */
    name?: string;
    /** Stops the item being changed or submitted. */
    disabled?: boolean;
    /** Called when the user changes the selection. */
    onchange?: (event: Event) => void;
    /** Additional CSS classes for the outer element. */
    class?: string;
    /** The item's contents. */
    children: Snippet;
    /** Spread onto the underlying input (e.g. `aria-label`, `required`, `form`). */
    [key: string]: unknown;
}
declare const SelectableItem: import("svelte").Component<Props, {}, "checked" | "group">;
type SelectableItem = ReturnType<typeof SelectableItem>;
export default SelectableItem;
