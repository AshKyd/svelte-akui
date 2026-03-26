/**
 * @component Modal
 * An accessible modal component using the native HTML <dialog> element.
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
}
declare const Modal: import("svelte").Component<Props, {}, "">;
type Modal = ReturnType<typeof Modal>;
export default Modal;
