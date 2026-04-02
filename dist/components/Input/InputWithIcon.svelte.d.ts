import { type Snippet } from 'svelte';
import './input.css';
interface Props {
    /** The input element to wrap. Should be a TextInput or similar. */
    children: Snippet;
    /** Optional icon or button to render on the left. */
    left?: Snippet;
    /** Optional icon or button to render on the right. */
    right?: Snippet;
    /** Sizing context ('small', 'medium', 'large'). */
    size?: 'small' | 'medium' | 'large';
    /** Additional CSS classes for the wrapper. */
    class?: string;
}
declare const InputWithIcon: import("svelte").Component<Props, {}, "">;
type InputWithIcon = ReturnType<typeof InputWithIcon>;
export default InputWithIcon;
