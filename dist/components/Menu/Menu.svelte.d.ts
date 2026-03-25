import { type Snippet } from 'svelte';
interface Props {
    x?: number;
    y?: number;
    onClose?: () => void;
    children: Snippet;
    class?: string;
    forceMobile?: boolean;
    origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
declare const Menu: import("svelte").Component<Props, {}, "">;
type Menu = ReturnType<typeof Menu>;
export default Menu;
