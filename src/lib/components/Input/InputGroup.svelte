<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from './context.ts';

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

	let {
		joined = false,
		size = 'medium',
		children,
		class: className = '',
		style = '',
		...rest
	}: Props = $props();

	setContext<InputGroupContext>(INPUT_GROUP_CONTEXT, {
		get joined() {
			return joined;
		},
		get size() {
			return size;
		}
	});
</script>

<div
	class="akui-input-group {joined ? 'joined' : ''} {size !== 'medium' ? size : ''} {className}"
	{style}
	{...rest}
>
	{@render children()}
</div>

<style>
	.akui-input-group {
		display: flex;
		align-items: flex-end;
		gap: var(--akui-space-s);
		width: 100%;
		max-width: 100%;
	}

	.akui-input-group > :global(*) {
		flex: 1;
		min-width: 0;
	}

	.akui-input-group.joined {
		gap: 0;
		border-radius: var(--akui-radius-m);
		box-shadow: var(--akui-shadow-subtle);
		isolation: isolate;
	}

	.akui-input-group.small.joined {
		border-radius: var(--akui-radius-s);
	}

	.akui-input-group.large.joined {
		border-radius: var(--akui-radius-l);
	}

	/* Apply sunken glows to text controls in joined groups */
	.akui-input-group.joined :global(> * input),
	.akui-input-group.joined :global(> * textarea) {
		box-shadow: var(--akui-shadow-sunken) !important;
	}

	/* Apply raised glows to interactive controls in joined groups */
	.akui-input-group.joined :global(> * select),
	.akui-input-group.joined :global(> * .akui-btn),
	.akui-input-group.joined :global(> .akui-btn) {
		box-shadow: var(--akui-shadow-glow) !important;
	}

	/* Preserve active state for buttons in groups */
	.akui-input-group.joined :global(> * .akui-btn:active),
	.akui-input-group.joined :global(> .akui-btn:active) {
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
	}

	/* Handle internal radii and borders for joined children */
	.akui-input-group.joined :global(> *:not(:first-child):not(:last-child)) {
		border-radius: 0 !important;
	}

	.akui-input-group.joined :global(> *:not(:first-child)),
	.akui-input-group.joined :global(> *:not(:first-child) input),
	.akui-input-group.joined :global(> *:not(:first-child) select),
	.akui-input-group.joined :global(> *:not(:first-child) textarea),
	.akui-input-group.joined :global(> *:not(:first-child) .akui-btn) {
		border-top-left-radius: 0 !important;
		border-bottom-left-radius: 0 !important;
	}

	.akui-input-group.joined :global(> *:hover),
	.akui-input-group.joined :global(> *:focus-within) {
		z-index: 2;
	}

	.akui-input-group.joined :global(> *:not(:last-child)),
	.akui-input-group.joined :global(> *:not(:last-child) input),
	.akui-input-group.joined :global(> *:not(:last-child) select),
	.akui-input-group.joined :global(> *:not(:last-child) textarea),
	.akui-input-group.joined :global(> *:not(:last-child) .akui-btn) {
		border-top-right-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}

	/* Eliminate double borders by overlapping children */
	.akui-input-group.joined :global(> *:not(:last-child)) {
		margin-right: -1px;
	}
</style>
