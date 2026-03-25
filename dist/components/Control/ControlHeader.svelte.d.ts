import { type Snippet } from 'svelte';
interface Props {
    /** The main label text. */
    label: string;
    /** Optional supplementary text or snippet. */
    extra?: string | Snippet;
    /** Additional CSS classes. */
    class?: string;
}
declare const ControlHeader: import("svelte").Component<Props, {}, "">;
type ControlHeader = ReturnType<typeof ControlHeader>;
export default ControlHeader;
