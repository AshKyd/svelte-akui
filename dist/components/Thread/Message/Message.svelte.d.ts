import { type Snippet } from 'svelte';
interface Props {
    /** Display name of the author. */
    name: string;
    /** Handle shown beside the name, e.g. `@bramble`. */
    username?: string;
    /** When the message was posted. Rendered with `RelativeTime`. */
    date?: Date | number | string;
    /**
     * How much of the header row to show. `full` is name, username and date. `date` drops the
     * name and username, for a follow-up by the same author (the dot already says who). `none`
     * drops the whole row, including `headerControls`, so the contents start at the dot.
     */
    header?: 'full' | 'date' | 'none';
    /** Extra controls on the right of the header row, e.g. a menu button. */
    headerControls?: Snippet;
    /** The message contents. */
    children?: Snippet;
    /** Interaction controls under the contents, e.g. reply and like buttons. */
    controls?: Snippet;
}
declare const Message: import("svelte").Component<Props, {}, "">;
type Message = ReturnType<typeof Message>;
export default Message;
