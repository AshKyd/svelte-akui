<script lang="ts">
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

	let {
		legend,
		level = 2,
		isInForm = false,
		class: className = '',
		style = '',
		children,
		extra,
		id = `fieldset-${Math.random().toString(36).slice(2, 9)}`,
		...rest
	}: Props = $props();

	const HeadingTag = $derived.by(() => `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
	const labelId = $derived.by(() => `${id}-label`);
</script>

<section
	{id}
	class="akui-fieldset {className}"
	{style}
	role={isInForm ? 'group' : undefined}
	aria-labelledby={labelId}
	{...rest}
>
	<header class="akui-fieldset-header">
		<svelte:element this={HeadingTag} id={labelId} class="akui-fieldset-legend">
			{legend}
		</svelte:element>
		{#if extra}
			<div class="akui-fieldset-extra">
				{@render extra()}
			</div>
		{/if}
	</header>

	<div class="akui-fieldset-content">
		{@render children?.()}
	</div>
</section>

<style>
	.akui-fieldset {
		position: relative;
		border: 1px solid var(--akui-border-input);
		border-radius: var(--akui-radius-m);
		padding: 1.5rem 1.25rem 1.25rem;
		background-color: transparent;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem; /* Space for the legend that pops out */
	}

	.akui-fieldset-header {
		position: absolute;
		top: 0;
		left: 0.75rem;
		transform: translateY(-50%);
		background: var(--akui-bg);
		padding: 0 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		max-width: calc(100% - 2.5rem);
		z-index: 1;
	}

	.akui-fieldset-legend {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--akui-fg-secondary);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1;
	}

	.akui-fieldset-extra {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.akui-fieldset-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}
</style>
