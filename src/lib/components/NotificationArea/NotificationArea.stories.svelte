<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/NotificationArea',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	import NotificationArea from './NotificationArea.svelte';
	import { type NotificationItem } from './types.js';
	import Button from '../Button/Button.svelte';

	let items = $state<NotificationItem[]>([]);
	let counter = 0;

	function push(item: Omit<NotificationItem, 'id'>) {
		items = [...items, { id: `demo-${counter++}`, ...item }];
	}

	function dismiss(id: string) {
		items = items.filter((item) => item.id !== id);
	}
</script>

<Story name="Playground">
	{#snippet children()}
		<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-width: 32rem;">
			<Button
				size="small"
				onclick={() =>
					push({ variant: 'info', message: 'The gnome census has been filed.', timeout: 6000 })}
			>
				Timed info
			</Button>
			<Button
				size="small"
				onclick={() =>
					push({ variant: 'success', title: 'Saved', message: 'Your spellbook is up to date.', timeout: 6000 })}
			>
				Timed success
			</Button>
			<Button
				size="small"
				onclick={() =>
					push({ variant: 'warning', message: 'The moat is running low.', timeout: 6000 })}
			>
				Warning (assertive)
			</Button>
			<Button
				size="small"
				onclick={() =>
					push({
						variant: 'error',
						title: 'Sync conflict',
						message: '"Herb inventory" has conflicting changes. Open to review.',
						timeout: 0,
						onClick: () => alert('Would open the note')
					})}
			>
				Sticky, click-through
			</Button>
			<Button
				size="small"
				onclick={() =>
					push({
						variant: 'message',
						message: 'Note moved to Bin',
						actionLabel: 'Undo',
						onAction: () => alert('Would restore the note'),
						timeout: 6000
					})}
			>
				With Undo action
			</Button>
		</div>

		<NotificationArea position="inline" {items} onDismiss={dismiss} />
	{/snippet}
</Story>
