/**
 * @component Modal
 * An accessible modal component using the native HTML <dialog> element.
 * Pass `inline` to render the card in page flow instead (no dialog, backdrop or Esc handling).
 */
interface Props {
    /** Optional title for the modal. */
    title?: string;
    /** Optional icon name (Bootstrap Icon) to display next to the title. */
    icon?: string;
    /** Optional snippet for a custom icon. Overrides the icon prop. */
    iconSnippet?: import('svelte').Snippet;
    /** Callback when the modal requests to close. */
    onClose: () => void;
    /** Whether to show the close button in the header. Defaults to true. */
    showCloseButton?: boolean;
    /** Footer snippet for action buttons. */
    footer?: import('svelte').Snippet;
    /** Default slot for modal content. */
    children?: import('svelte').Snippet;
    /** Whether the modal should be fullscreen on mobile devices. Defaults to false. */
    fullscreenOnMobile?: boolean;
    /** Optional minimum width of the modal on desktop. */
    minWidth?: string;
    /** Optional minimum height of the modal on desktop. */
    minHeight?: string;
    /** Render the card in normal page flow, without the native <dialog>, backdrop or Esc handling. Useful for theme testing. */
    inline?: boolean;
}
declare const Modal: import("svelte").Component<Props, {}, "">;
type Modal = ReturnType<typeof Modal>;
export default Modal;
