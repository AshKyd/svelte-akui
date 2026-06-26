<script lang="ts">
	import { type Snippet } from 'svelte';
	import Padding from '../../Padding/Padding.svelte';
	import Small from '../../Small/Small.svelte';

	interface Props {
		/** The heading label of the control. */
		label: string;
		/** An optional small description below the label. */
		description?: string;
		/** An optional right-aligned extra value or label. */
		extra?: string;
		/** Snippet for custom extra content. */
		extraSnippet?: Snippet;
		/** Whether the checkbox or radio is checked. */
		checked?: boolean;
		/** Optional control type on the right hand side. */
		controlType?: 'checkbox' | 'radio';
		/** Snippet for the main control content. */
		children?: Snippet;
		/** Layout orientation: 'vertical' or 'horizontal'. Defaults to 'vertical'. */
		layout?: 'vertical' | 'horizontal';
		/** Optional click handler. */
		onclick?: (event: MouseEvent) => void;
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		label,
		description,
		extra,
		extraSnippet,
		checked = $bindable(false),
		controlType,
		children,
		layout = 'vertical',
		onclick,
		class: className = '',
		...rest
	}: Props = $props();

	function handleContainerClick(event: MouseEvent) {
		if (controlType) {
			checked = !checked;
		}
		if (onclick) {
			onclick(event);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<li
	role={onclick || controlType ? 'button' : 'none'}
	tabindex={onclick || controlType ? 0 : -1}
	class="akui-control-item-expanded-wrapper {className}"
	class:interactive={onclick || controlType}
	onclick={handleContainerClick}
	onkeydown={(e) => {
		const target = e.target as HTMLElement;
		if (
			target &&
			(target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT' ||
				target.isContentEditable)
		) {
			return;
		}
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			checked = !checked;
			if (onclick) onclick(new MouseEvent('click'));
		}
	}}
	{...rest}
>
	<Padding size="m" class="akui-control-item-expanded-inner">
		<div
			class="akui-control-item-expanded-container"
			class:layout-horizontal={layout === 'horizontal'}
			class:layout-vertical={layout === 'vertical'}
		>
			<div class="akui-control-item-expanded-header">
				<div class="akui-control-item-expanded-label-group">
					<span class="akui-control-item-expanded-label">{label}</span>
					{#if description}
						<Small class="akui-control-item-expanded-description">{description}</Small>
					{/if}
				</div>
				{#if extraSnippet}
					<div class="akui-control-item-expanded-extra">
						{@render extraSnippet()}
					</div>
				{:else if extra}
					<span class="akui-control-item-expanded-extra">{extra}</span>
				{/if}
			</div>

			{#if children || controlType}
				<div class="akui-control-item-expanded-control">
					{#if children}
						{@render children()}
					{/if}
					{#if controlType === 'checkbox'}
						<input
							type="checkbox"
							class="akui-control-item-expanded-input"
							bind:checked
							onclick={(e) => e.stopPropagation()}
						/>
					{:else if controlType === 'radio'}
						<input
							type="radio"
							class="akui-control-item-expanded-input"
							checked={checked}
							onclick={(e) => e.stopPropagation()}
						/>
					{/if}
				</div>
			{/if}
		</div>
	</Padding>
</li>

<style>
	.akui-control-item-expanded-wrapper {
		display: block;
		list-style: none;
		background: transparent;
		color: var(--akui-fg);
		outline: none;
	}

	.akui-control-item-expanded-wrapper.interactive {
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.akui-control-item-expanded-wrapper.interactive:hover {
		background-color: var(--akui-bg-hover);
	}

	.akui-control-item-expanded-wrapper.interactive:active {
		background-color: var(--akui-bg-button-hover);
	}

	.akui-control-item-expanded-wrapper.interactive:focus-visible {
		background-color: var(--akui-bg-hover);
		box-shadow: inset 0 0 0 2px var(--akui-bg-accent);
	}

	.akui-control-item-expanded-container {
		display: flex;
		gap: var(--akui-space-m);
	}

	.akui-control-item-expanded-container.layout-vertical {
		flex-direction: column;
	}

	.akui-control-item-expanded-container.layout-horizontal {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.akui-control-item-expanded-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--akui-space-m);
		flex: 1;
	}

	.layout-horizontal .akui-control-item-expanded-header {
		align-items: center;
	}

	.akui-control-item-expanded-label-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.akui-control-item-expanded-label {
		font-size: 0.95rem;
		font-weight: 600;
	}

	:global(.akui-control-item-expanded-description) {
		color: var(--akui-fg-secondary);
	}

	.akui-control-item-expanded-extra {
		font-size: 0.875rem;
		color: var(--akui-fg-secondary);
	}

	.akui-control-item-expanded-control {
		display: flex;
		gap: var(--akui-space-s);
		align-items: center;
	}

	.layout-vertical .akui-control-item-expanded-control {
		width: 100%;
	}

	.akui-control-item-expanded-input {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: var(--akui-bg-accent);
		cursor: pointer;
		margin: 0;
	}
</style>
