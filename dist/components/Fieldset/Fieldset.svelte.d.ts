/**
     * @component Fieldset
     * A reusable, accessible component that looks like a fieldset but uses a <section>
     * with a customizable heading level for better accessibility.
     */
import type { Snippet } from 'svelte';
interface Props {
    /** The legend/title for the fieldset. */
    legend: string;
    /** Heading level for the legend. Defaults to 2. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Whether this component is used within a form (adds ARIA role="group"). */
    isInForm?: boolean;
    /** Additional CSS classes for the container. */
    class?: string;
    /** Inline styles for the container. */
    style?: string;
    /** Main content for the fieldset. */
    children?: Snippet;
    /** Extra content to display next to the legend (e.g., buttons). */
    extra?: Snippet;
    /** Unique ID for the fieldset. */
    id?: string;
    /** Spread remaining attributes to the container. */
    [key: string]: unknown;
}
declare const Fieldset: import("svelte").Component<Props, {}, "">;
type Fieldset = ReturnType<typeof Fieldset>;
export default Fieldset;
