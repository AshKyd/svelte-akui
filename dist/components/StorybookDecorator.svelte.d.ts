import { type Snippet } from 'svelte';
interface Props {
    /** The child component (the story). */
    children: Snippet;
}
declare const StorybookDecorator: import("svelte").Component<Props, {}, "">;
type StorybookDecorator = ReturnType<typeof StorybookDecorator>;
export default StorybookDecorator;
