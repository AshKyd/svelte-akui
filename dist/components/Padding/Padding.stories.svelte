<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Padding from './Padding.svelte';

	const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

	const { Story } = defineMeta({
		title: 'Utilities/Padding',
		component: Padding,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: [...sizes]
			}
		}
	});
</script>

<Story name="Default">
	<div style="background: var(--akui-bg-secondary); border: 1px dashed var(--akui-fg-secondary);">
		<Padding>
			<div style="background: var(--akui-bg-accent); color: white; text-align: center;">
				Medium Padding (Default)
			</div>
		</Padding>
	</div>
</Story>

<Story name="Sizes">
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		{#each sizes as size (size)}
			<div
				style="background: var(--akui-bg-secondary); border: 1px dashed var(--akui-fg-secondary);"
			>
				<Padding {size}>
					<div style="background: var(--akui-bg-accent); color: white; text-align: center;">
						Size: {size}
					</div>
				</Padding>
			</div>
		{/each}
	</div>
</Story>

<Story name="Axis Specific">
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<div style="background: var(--akui-bg-secondary); border: 1px dashed var(--akui-fg-secondary);">
			<Padding x size="xl">
				<div style="background: var(--akui-bg-accent); color: white; text-align: center;">
					Horizontal (X) Large Padding
				</div>
			</Padding>
		</div>
		<div style="background: var(--akui-bg-secondary); border: 1px dashed var(--akui-fg-secondary);">
			<Padding y size="xl">
				<div style="background: var(--akui-bg-accent); color: white; text-align: center;">
					Vertical (Y) Large Padding
				</div>
			</Padding>
		</div>
	</div>
</Story>

<Story name="Side Specific">
	<div style="background: var(--akui-bg-secondary); border: 1px dashed var(--akui-fg-secondary);">
		<Padding top left size="xl">
			<div style="background: var(--akui-bg-accent); color: white; text-align: center;">
				Top & Left XL Padding
			</div>
		</Padding>
	</div>
</Story>
