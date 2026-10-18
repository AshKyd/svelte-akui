import { type Snippet } from 'svelte';
interface Props {
    /** The heading label of the control. */
    label: string;
    /** An optional small description below the label. */
    description?: string;
    /** Snippet that replaces `description`. */
    descriptionSnippet?: Snippet;
    /** Slides the description open and shut as it appears and goes. Defaults to false. */
    animateDescription?: boolean;
    /** Snippet for an icon (or any leading content) before the label. */
    icon?: Snippet;
    /** ARIA role of the wrapping `<li>`. Defaults to 'none' (for menus); use 'listitem' in a list. */
    wrapperRole?: string;
    /** An optional right-aligned extra value or label. */
    extra?: string;
    /** Snippet for custom extra content. */
    extraSnippet?: Snippet;
    /** Whether the checkbox or radio is checked. */
    checked?: boolean;
    /** Optional control type on the right hand side. */
    controlType?: 'checkbox' | 'radio';
    /** Snippet for the main control content. */
    children?: Snippet;
    /** Layout orientation: 'vertical' or 'horizontal'. Defaults to 'vertical'. */
    layout?: 'vertical' | 'horizontal';
    /** Optional click handler. */
    onclick?: (event: MouseEvent) => void;
    /** Additional CSS classes. */
    class?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const ControlItemExpanded: import("svelte").Component<Props, {}, "checked">;
type ControlItemExpanded = ReturnType<typeof ControlItemExpanded>;
export default ControlItemExpanded;
