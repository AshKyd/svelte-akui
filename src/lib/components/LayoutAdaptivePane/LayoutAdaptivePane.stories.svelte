<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LayoutAdaptivePane from './LayoutAdaptivePane.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/LayoutAdaptivePane',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let currentRouteId = $state('/inbox');

	// Second story: its own route state so the two demos don't drive each other.
	let seedRouteId = $state('/seeds');
	let paneMode = $state<'resize' | 'over'>('over');

	const seedVarieties = [
		{ id: 'moonlit-turnip', name: 'Moonlit Turnip', note: 'Glows faintly. Best sown at dusk.' },
		{ id: 'grumbling-onion', name: 'Grumbling Onion', note: 'Complains when pulled. Ignore it.' },
		{ id: 'kettle-bean', name: 'Kettle Bean', note: 'Whistles gently when ripe.' },
		{ id: 'nine-oclock-pea', name: 'Nine O’Clock Pea', note: 'Flowers punctually, every evening.' },
		{ id: 'quilted-marrow', name: 'Quilted Marrow', note: 'Grows a soft, patterned skin.' },
		{ id: 'hearthroot', name: 'Hearthroot', note: 'Keeps the soil around it warm.' },
		{ id: 'bramblewick', name: 'Bramblewick', note: 'Thorny. Wear the good gloves.' },
		{ id: 'sunday-squash', name: 'Sunday Squash', note: 'Refuses to ripen on weekdays.' }
	];
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

<!-- The seed grid uses auto-fill columns, so it visibly re-flows whenever its
     container narrows. That is the point of the comparison: in 'resize' mode the
     cards rearrange as the detail pane opens, and in 'over' mode they hold still. -->
{#snippet seedMainPane()}
	<div style="padding: 1rem;">
		<h3>Seed Swap Table</h3>
		<p style="font-size: 0.875rem; color: var(--akui-fg-secondary); margin-bottom: 1rem;">
			Everything left on the trestle table after the village meeting. Take what you'll actually plant.
		</p>
		<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem;">
			{#each seedVarieties as seed (seed.id)}
				<button
					type="button"
					onclick={() => (seedRouteId = `/seeds/${seed.id}`)}
					style="
						text-align: left;
						padding: 0.75rem;
						border: 1px solid var(--akui-border-input);
						border-radius: var(--akui-radius-m);
						background: {seedRouteId === `/seeds/${seed.id}` ? 'var(--akui-bg-secondary)' : 'var(--akui-bg)'};
						color: inherit;
						cursor: pointer;
						font: inherit;
					"
				>
					<strong style="display: block; font-size: 0.875rem;">{seed.name}</strong>
					<span style="font-size: 0.75rem; color: var(--akui-fg-secondary);">{seed.note}</span>
				</button>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet seedNestedPane()}
	{@const seed = seedVarieties.find(({ id }) => `/seeds/${id}` === seedRouteId)}
	<div style="padding: 1.5rem;">
		{#if seed}
			<Button size="small" onclick={() => (seedRouteId = '/seeds')} label="← Back to the table" style="margin-bottom: 1rem;" />
			<h2>{seed.name}</h2>
			<p style="line-height: 1.6; color: var(--akui-fg-secondary);">{seed.note}</p>
			<p style="line-height: 1.6;">
				Donated by the allotment society, who ask only that you return a pinch of seed next spring.
				Sow thinly in a warm corner, water when the soil looks thirsty, and say something encouraging
				to it on the way past. The council keeps no records of whether that last part helps.
			</p>
		{/if}
	</div>
{/snippet}

<Story name="Overlay Pane">
	{#snippet children()}
		<div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; align-items: center;">
			<span style="font-size: 0.875rem; color: var(--akui-fg-secondary);">paneMode:</span>
			<Button
				size="small"
				variant={paneMode === 'over' ? 'accent' : 'regular'}
				onclick={() => (paneMode = 'over')}
				label="over"
			/>
			<Button
				size="small"
				variant={paneMode === 'resize' ? 'accent' : 'regular'}
				onclick={() => (paneMode = 'resize')}
				label="resize"
			/>
		</div>
		<div style="height: 400px; border: 1px solid var(--akui-border-input); border-radius: var(--akui-radius-m); overflow: hidden; background: var(--akui-bg);">
			<LayoutAdaptivePane
				baseRouteId="/seeds"
				currentRouteId={seedRouteId}
				{paneMode}
				hideNestedWhenEmpty={true}
				minWidth={600}
				minMainPaneWidth={280}
				minNestedPaneWidth={280}
				mainPane={seedMainPane}
				nestedPane={seedNestedPane}
			/>
		</div>
	{/snippet}
</Story>
