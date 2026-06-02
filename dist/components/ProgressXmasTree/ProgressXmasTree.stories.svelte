<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressXmasTree, { type ProgressItem } from './ProgressXmasTree.svelte';
	import StorybookDecorator from '../StorybookDecorator.svelte';
	import { onMount } from 'svelte';

	const { Story } = defineMeta({
		title: 'Components/ProgressXmasTree',
		decorators: [() => StorybookDecorator]
	});
</script>

<script lang="ts">
	// Cosy fantasy themed items for demonstrations
	const cozyItems: ProgressItem[] = [
		{ id: 1, complete: true, label: 'Polishing gnome boots' },
		{ id: 2, complete: true, label: 'Steeping chamomile leaves' },
		{ id: 3, complete: false, label: 'Reading dust patterns in the library' },
		{ id: 4, complete: false, label: 'Tending the sourdough cauldron' },
		{ id: 5, complete: false, label: 'Befriending the local cellar spider' },
		{ id: 6, complete: true, label: 'Gathering solstice morning dew' },
		{ id: 7, complete: false, label: 'Checking dragon hibernation depth' },
		{ id: 8, complete: false, label: 'Tuning the swamp frog ensemble' },
		{ id: 9, complete: true, label: 'Baking wild mushroom puff pies' },
		{ id: 10, complete: false, label: 'Gently removing dust from fairy wings' }
	];

	// Items for the progressive loading story
	let progressiveItems = $state<ProgressItem[]>([
		{ id: 1, complete: false, label: 'Whispering sweet tidings to rosebuds' },
		{ id: 2, complete: false, label: 'Sorting acorns by mood' },
		{ id: 3, complete: false, label: 'Divining the tea time biscuit index' },
		{ id: 4, complete: false, label: 'Nudging sleeping garden beetles' },
		{ id: 5, complete: false, label: 'Sweeping mossy cottage steps' },
		{ id: 6, complete: false, label: 'Stitch-repairing a velvet moth wing' },
		{ id: 7, complete: false, label: 'Measuring potion pot condensation' },
		{ id: 8, complete: false, label: 'Polishing brass kettle spouts' },
		{ id: 9, complete: false, label: 'Feeding dandelion fluff to baby owls' },
		{ id: 10, complete: false, label: 'Smoothing creases out of wizard maps' },
		{ id: 11, complete: false, label: 'Humming lullabies to drowsing fireflies' },
		{ id: 12, complete: false, label: 'Weaving dandelion crowns' }
	]);

	onMount(() => {
		const interval = setInterval(() => {
			const incomplete = progressiveItems.filter(item => !item.complete);
			if (incomplete.length === 0) {
				// Reset to progressive fill restart
				progressiveItems = progressiveItems.map(item => ({ ...item, complete: false }));
			} else {
				// Complete one random item
				const target = incomplete[Math.floor(Math.random() * incomplete.length)];
				progressiveItems = progressiveItems.map(item => 
					item.id === target.id ? { ...item, complete: true } : item
				);
			}
		}, 1000);

		return () => clearInterval(interval);
	});

	const actions = [
		'Polishing gnome boot',
		'Collecting solstice dew drop',
		'Befriending cellar spider helper',
		'Sorting acorn by mood',
		'Steeping lavender tea bud',
		'Checking dragon snooze depth',
		'Toasting buttered mushroom cap',
		'Whispering secrets to field beetle',
		'Patching tiny fairy waistcoat',
		'Tuning cricket fiddle string'
	];

	const largeBatchItems: ProgressItem[] = Array.from({ length: 200 }, (_, i) => {
		const action = actions[i % actions.length];
		return {
			id: `batch-${i}`,
			complete: i < 135,
			label: `${action} #${Math.floor(i / actions.length) + 1}`,
			colour: i % 15 === 0 ? 'pink' : undefined
		};
	});
</script>

<Story name="Default">
	<div style="width: 300px; height: 120px; border: 1px solid var(--akui-border-input); padding: 12px; border-radius: 8px;">
		<ProgressXmasTree items={cozyItems} />
	</div>
</Story>

<Story name="Coloured Themes">
	<div style="display: flex; flex-direction: column; gap: 24px; max-width: 600px;">
		<div>
			<h4 style="margin: 0 0 8px 0; color: var(--akui-fg-secondary);">Accent (Primary)</h4>
			<div style="width: 250px; height: 80px; border: 1px solid var(--akui-border-input); padding: 8px; border-radius: 8px;">
				<ProgressXmasTree items={cozyItems} colour="accent" />
			</div>
		</div>

		<div>
			<h4 style="margin: 0 0 8px 0; color: var(--akui-fg-secondary);">Green & Orange mix (Custom colours specified on items)</h4>
			<div style="width: 250px; height: 80px; border: 1px solid var(--akui-border-input); padding: 8px; border-radius: 8px;">
				<ProgressXmasTree 
					items={cozyItems.map((item, idx) => ({
						...item,
						colour: idx % 2 === 0 ? 'green' : 'orange'
					}))} 
				/>
			</div>
		</div>

		<div>
			<h4 style="margin: 0 0 8px 0; color: var(--akui-fg-secondary);">Purple theme</h4>
			<div style="width: 250px; height: 80px; border: 1px solid var(--akui-border-input); padding: 8px; border-radius: 8px;">
				<ProgressXmasTree items={cozyItems} colour="purple" />
			</div>
		</div>
	</div>
</Story>

<Story name="Progressive Loading">
	<div style="display: flex; flex-direction: column; gap: 12px;">
		<p style="margin: 0; font-size: 0.9rem; color: var(--akui-fg-secondary);">
			Ticks one item complete every second. Will loop back to start when all are finished.
		</p>
		<div style="width: 320px; height: 140px; border: 1px solid var(--akui-border-input); padding: 12px; border-radius: 8px;">
			<ProgressXmasTree items={progressiveItems} colour="amber" />
		</div>
	</div>
</Story>

<Story name="Large Batch (200 items)">
	<div style="display: flex; flex-direction: column; gap: 12px;">
		<p style="margin: 0; font-size: 0.9rem; color: var(--akui-fg-secondary);">
			Renders 200 items copyfitted to the available space (135 complete, some custom pinks mixed in).
		</p>
		<div style="width: 400px; height: 200px; border: 1px solid var(--akui-border-input); padding: 12px; border-radius: 8px; resize: both; overflow: auto; min-width: 150px; min-height: 100px;">
			<ProgressXmasTree items={largeBatchItems} colour="green" />
		</div>
		<small style="color: var(--akui-fg-secondary);">Tip: Resize container from the bottom-right corner to see layout adapt.</small>
	</div>
</Story>
