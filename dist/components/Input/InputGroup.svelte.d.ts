import { type Snippet } from 'svelte';
export interface Props {
    /** Whether children should be joined (sharing borders and radii). */
    joined?: boolean;
    /** Size for all controls in the box. */
    size?: 'small' | 'medium' | 'large';
    /** The children to display. */
    children: Snippet;
    /** Additional CSS classes. */
    class?: string;
    /** Inline styles. */
    style?: string;
    /** Spread remaining attributes. */
    [key: string]: unknown;
}
declare const InputGroup: import("svelte").Component<Props, {}, "">;
type InputGroup = ReturnType<typeof InputGroup>;
export default InputGroup;
