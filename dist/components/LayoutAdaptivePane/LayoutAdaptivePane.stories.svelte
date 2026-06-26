<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LayoutAdaptivePane from './LayoutAdaptivePane.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/LayoutAdaptivePane',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let currentRouteId = $state('/inbox');
</script>

{#snippet mainPane({ isStacked })}
	<div style="padding: 1rem;">
		<h3>Gnome Council Archives</h3>
		<p style="font-size: 0.875rem; color: var(--akui-fg-secondary);">Select a dispatch to read from the shelves.</p>
		<ul style="list-style: none; padding: 0; margin: 1.5rem 0 0 0; display: flex; flex-direction: column; gap: 0.5rem;">
			<li>
				<Button
					style="width: 100%; text-align: left; justify-content: flex-start;"
					variant={currentRouteId === '/inbox/harvest' ? 'accent' : 'regular'}
					onclick={() => currentRouteId = '/inbox/harvest'}
					label="🌾 Harvest Dispatches (Autumn)"
				/>
			</li>
			<li>
				<Button
					style="width: 100%; text-align: left; justify-content: flex-start;"
					variant={currentRouteId === '/inbox/tea' ? 'accent' : 'regular'}
					onclick={() => currentRouteId = '/inbox/tea'}
					label="🍵 Elderberry Tea Brewing Rules"
				/>
			</li>
		</ul>
	</div>
{/snippet}

{#snippet nestedPane({ isStacked })}
	<div style="padding: 1.5rem;">
		{#if currentRouteId === '/inbox'}
			<div style="text-align: center; padding: 3rem 1rem; color: var(--akui-fg-secondary);">
				<p>Select a scroll from the archives list to begin reading.</p>
			</div>
		{:else if currentRouteId === '/inbox/harvest'}
			<div>
				<Button size="small" onclick={() => currentRouteId = '/inbox'} label="← Back to Archives" style="margin-bottom: 1rem;" />
				<h2>🌾 Autumn Harvest Dispatch</h2>
				<p style="line-height: 1.6;">
					The Elderberry crop has surpassed all expectations this season. Harvest groups should assemble at dawn by the whispering willow. Please bring your own wicker baskets and a light cloak, as the morning dew remains chill.
				</p>
			</div>
		{:else if currentRouteId === '/inbox/tea'}
			<div>
				<Button size="small" onclick={() => currentRouteId = '/inbox'} label="← Back to Archives" style="margin-bottom: 1rem;" />
				<h2>🍵 Elderberry Tea Brewing Rules</h2>
				<p style="line-height: 1.6;">
					Proper brewing of elderberry tea requires copper kettles and spring water collected under a waning crescent moon. Simmer gently for twelve minutes while reciting the warming cantrip to release the full sleeping draught potency.
				</p>
			</div>
		{/if}
	</div>
{/snippet}

<Story name="Split View Layout">
	{#snippet children()}
		<div style="height: 400px; border: 1px solid var(--akui-border-input); border-radius: var(--akui-radius-m); overflow: hidden; background: var(--akui-bg);">
			<LayoutAdaptivePane
				baseRouteId="/inbox"
				{currentRouteId}
				{mainPane}
				{nestedPane}
			/>
		</div>
	{/snippet}
</Story>
