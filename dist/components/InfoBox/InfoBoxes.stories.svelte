<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InfoBoxes from './InfoBoxes.svelte';
	import Icon from '../Icon/Icon.svelte';

	const { Story } = defineMeta({
		title: 'Components/InfoBoxes',
		tags: ['autodocs']
	});

	const items = [
		{
			id: '1',
			variant: 'info',
			title: 'System Update',
			message: 'A new version of the application is available for download.'
		},
		{
			id: '2',
			variant: 'success',
			message: 'Changes saved successfully.'
		},
		{
			id: '3',
			variant: 'warning',
			title: 'Low Disk Space',
			message: 'You are running low on disk space. Please clean up some files.',
			onClose: () => alert('Dismissed')
		}
	];
</script>

<Story name="Default (Stacked)">
	<div style="width: 400px;">
		<InfoBoxes {items} />
	</div>
</Story>

<Story name="With Custom Icons">
	{#snippet customIcon({ item })}
		<div
			style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 16px;"
		>
			{#if item.id === '1'}
				<span style="animation: bounce 1s infinite;">🚀</span>
			{:else if item.id === '2'}
				<div
					style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); animation: pulse 2s infinite;"
				></div>
			{:else}
				<Icon name="heart-fill" size={16} color="#ec4899" />
			{/if}
		</div>
	{/snippet}

	<style>
		@keyframes bounce {
			0%,
			100% {
				transform: translateY(0);
			}
			50% {
				transform: translateY(-4px);
			}
		}
		@keyframes pulse {
			0% {
				transform: scale(0.95);
				box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
			}
			70% {
				transform: scale(1);
				box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
			}
			100% {
				transform: scale(0.95);
				box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
			}
		}
	</style>

	<div style="width: 400px;">
		<InfoBoxes {items} icon={customIcon} />
	</div>
</Story>

<Story name="Bare (Inline)">
	<div style="width: 400px;">
		<InfoBoxes {items} />
	</div>
</Story>
