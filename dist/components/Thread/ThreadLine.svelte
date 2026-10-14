<script lang="ts">
	interface Props {
		/** Whether the item this line belongs to is collapsed. */
		collapsed: boolean;
		/** Names the thread for screen readers, e.g. "reply from Mabel". Defaults to "thread". */
		label?: string;
		/** Called when the line is clicked or activated by keyboard. */
		ontoggle: () => void;
		/** Called as the pointer enters (`true`) or leaves (`false`) the line. */
		onhover: (hovered: boolean) => void;
		/** Called when keyboard focus (`:focus-visible`) lands on (`true`) or leaves (`false`) the line. */
		onfocusvisible: (focused: boolean) => void;
	}

	let { collapsed, label = 'thread', ontoggle, onhover, onfocusvisible }: Props = $props();
</script>

<!-- An invisible button that fills its positioned parent, which sets the hit area (see `ThreadItem`). -->
<button
	type="button"
	class="akui-thread-line"
	aria-expanded={!collapsed}
	aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${label}`}
	onclick={ontoggle}
	onpointerenter={() => onhover(true)}
	onpointerleave={() => onhover(false)}
	onfocus={(event) => onfocusvisible(event.currentTarget.matches(':focus-visible'))}
	onblur={() => onfocusvisible(false)}
></button>

<style>
	/* The focus style is drawn on the line itself (a dashed accent line), not as an outline. */
	.akui-thread-line {
		position: absolute;
		inset: 0;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		outline: none;
	}
</style>
