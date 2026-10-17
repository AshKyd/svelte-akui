import { type SlashMenuState } from './slashMenuState.svelte';
interface Props {
    /** Items, highlighted index and select handler. */
    state: SlashMenuState;
    /** Unique id for this menu, used to build item ids. */
    menuId: string;
    /** Item density. Defaults to 'small'. */
    size?: 'small' | 'large';
}
declare const SlashMenu: import("svelte").Component<Props, {}, "">;
type SlashMenu = ReturnType<typeof SlashMenu>;
export default SlashMenu;
