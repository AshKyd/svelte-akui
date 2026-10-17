<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StorybookDecorator from '../StorybookDecorator.svelte';

	// No `component`: each story renders ProgressChecks itself.
	const { Story } = defineMeta({
		title: 'Components/ProgressChecks',
		decorators: [() => StorybookDecorator]
	});
</script>

<script lang="ts">
	import ProgressChecks from './ProgressChecks.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Button from '../Button/Button.svelte';
	import type { ProgressCheckStep } from './types.js';

	const importSteps: ProgressCheckStep[] = [
		{ id: 'import', label: 'Importing notes', status: 'done', detail: '412 notes' },
		{ id: 'upload', label: 'Uploading notes', status: 'active', value: 188, max: 412 },
		{ id: 'index', label: 'Indexing new notes' }
	];

	const failedSteps: ProgressCheckStep[] = [
		{ id: 'import', label: 'Gathering the gnome rota', status: 'done', detail: '37 entries' },
		{
			id: 'upload',
			label: 'Sending it to the village hall',
			status: 'error',
			value: 21,
			max: 37,
			failed: 16,
			message: 'The owl post office stopped answering'
		},
		{ id: 'index', label: 'Pinning it on the noticeboard' }
	];

	const skippedSteps: ProgressCheckStep[] = [
		{
			id: 'import',
			label: 'Reading the almanac',
			status: 'warning',
			value: 412,
			max: 412,
			skipped: 32,
			message: '22 empty, 10 duplicates'
		},
		{ id: 'upload', label: 'Posting 380 notes', status: 'done', value: 380, max: 380 },
		{
			id: 'index',
			label: 'Indexing new notes',
			status: 'warning',
			value: 379,
			max: 380,
			failed: 1,
			message: '"Moonlit jam recipes" has no readable text'
		}
	];

	const finishedSteps: ProgressCheckStep[] = [
		{ id: 'import', label: 'Brewing the tea urn schedule', status: 'done', value: 60, max: 60 },
		{ id: 'upload', label: 'Posting invitations by pigeon', status: 'done', value: 60, max: 60 },
		{ id: 'index', label: 'Filing them under "Biscuits"', status: 'done', value: 60, max: 60 }
	];

	/** Steps for the live demo: each runs in turn, with a bar on the first two. */
	const liveLabels = ['Counting the pumpkins', 'Delivering them to the fête', 'Labelling the jam jars'];
	const liveTotal = 40;

	let showNote = $state(false);
	let liveStep = $state(-1);
	let liveValue = $state(0);
	let timer: ReturnType<typeof setInterval> | undefined;

	const liveSteps = $derived<ProgressCheckStep[]>(
		liveLabels.map((label, index) => {
			const status = index < liveStep ? 'done' : index === liveStep ? 'active' : 'pending';
			// The last step has no known length, so it shows only a spinner.
			const hasBar = index < 2;
			return {
				id: String(index),
				label,
				status,
				// Pending steps get 0, not undefined, so their bar slot is reserved from the start.
				value: hasBar ? (status === 'done' ? liveTotal : status === 'active' ? liveValue : 0) : undefined,
				max: liveTotal
			};
		})
	);

	function startLive() {
		clearInterval(timer);
		liveStep = 0;
		liveValue = 0;
		timer = setInterval(() => {
			liveValue += 4;
			if (liveValue <= liveTotal) return;
			liveStep += 1;
			liveValue = 0;
			if (liveStep >= liveLabels.length) clearInterval(timer);
		}, 150);
	}
</script>

<Story name="Importing">
	{#snippet children()}
		<div style="width: 360px;"><ProgressChecks steps={importSteps} /></div>
	{/snippet}
</Story>

<Story name="Without progress bars">
	{#snippet children()}
		<div style="width: 360px;">
			<ProgressChecks
				steps={[
					{ id: 'a', label: 'Knitting the scarf', status: 'done' },
					{ id: 'b', label: 'Enchanting the scarf', status: 'active' },
					{ id: 'c', label: 'Gifting the scarf' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Failed step">
	{#snippet children()}
		<div style="width: 360px;"><ProgressChecks steps={failedSteps} /></div>
	{/snippet}
</Story>

<Story name="One line to two lines">
	{#snippet children()}
		<div style="width: 360px; display: flex; flex-direction: column; gap: 12px;">
			<ProgressChecks
				steps={[
					{ id: 'a', label: 'Gathering the almanac', status: 'done' },
					{
						id: 'b',
						label: 'Sorting the seed catalogue',
						status: showNote ? 'warning' : 'done',
						message: showNote ? 'Skipped duplicates: 12' : ''
					},
					{ id: 'c', label: 'Ringing the village bell', status: 'done' }
				]}
			/>
			<Button onclick={() => (showNote = !showNote)}>
				{showNote ? 'Back to one line' : 'Add a second line'}
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Custom note">
	{#snippet children()}
		<div style="width: 360px;">
			<ProgressChecks steps={importSteps}>
				{#snippet note(step)}
					{#if step.status === 'active'}Almost there, {step.max! - step.value!} to go{/if}
				{/snippet}
			</ProgressChecks>
		</div>
	{/snippet}
</Story>

<Story name="Completed with skips">
	{#snippet children()}
		<div style="width: 360px;"><ProgressChecks steps={skippedSteps} /></div>
	{/snippet}
</Story>

<Story name="All complete">
	{#snippet children()}
		<div style="width: 360px;"><ProgressChecks steps={finishedSteps} /></div>
	{/snippet}
</Story>

<Story name="Live">
	{#snippet children()}
		<div style="width: 360px; display: flex; flex-direction: column; gap: 12px;">
			<ProgressChecks steps={liveSteps} />
			<Button onclick={startLive}>Start</Button>
		</div>
	{/snippet}
</Story>

<Story name="Custom icon">
	{#snippet children()}
		<div style="width: 360px;">
			<ProgressChecks steps={importSteps}>
				{#snippet icon(step)}
					<Icon name={step.status === 'done' ? 'stars' : 'hourglass-split'} size="1.25em" />
				{/snippet}
			</ProgressChecks>
		</div>
	{/snippet}
</Story>
