import { type Snippet } from 'svelte';
export interface InfoBoxItem {
    id: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string | Snippet;
    icon?: string;
    onClose?: () => void;
    [key: string]: any;
}
interface Props {
    /** Array of info box items to display */
    items: InfoBoxItem[];
    /** Optional icon snippet for custom icon rendering (overrides item.icon) */
    icon?: Snippet<[{
        item: InfoBoxItem;
    }]>;
    /** Additional CSS classes */
    class?: string;
}
declare const InfoBoxes: import("svelte").Component<Props, {}, "">;
type InfoBoxes = ReturnType<typeof InfoBoxes>;
export default InfoBoxes;
