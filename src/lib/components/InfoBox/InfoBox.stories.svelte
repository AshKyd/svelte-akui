<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InfoBox from './InfoBox.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/InfoBox',
		tags: ['autodocs']
	});
</script>

<Story name="Default (Info)">
	<InfoBox title="Information" icon="info-circle-fill">
		This is a standard info box with helpful details.
	</InfoBox>
</Story>

<Story name="Success">
	<InfoBox variant="success" title="Success">
		Your changes have been saved successfully.
	</InfoBox>
</Story>

<Story name="Warning">
	<InfoBox variant="warning" title="Warning">
		This action might have unexpected side effects.
	</InfoBox>
</Story>

<Story name="Error">
	<InfoBox variant="error" title="Error">
		There was a problem processing your request.
	</InfoBox>
</Story>

<Story name="Dismissible (With Title)">
	<InfoBox title="Update Log" icon="info-circle-fill" onClose={() => alert('Closed')}>
		We've updated our terms of service. Please review them before continuing.
	</InfoBox>
</Story>

<Story name="Dismissible (No Title)">
	<InfoBox icon="info-circle-fill" onClose={() => alert('Closed')}>
		A simple dismissible alert that stays centred.
	</InfoBox>
</Story>

<Story name="With Action and Dismiss">
	<InfoBox title="Update Available" variant="info" onClose={() => alert('Closed')}>
		A new version of the app is available.
		{#snippet action()}
			<Button size="small">Update Now</Button>
		{/snippet}
	</InfoBox>
</Story>

<Story name="Message Variant">
	<InfoBox variant="message" title="Draft Note">
		This is a draft version of the document. Some sections may be incomplete.
	</InfoBox>
</Story>

<Story name="No Icon">
	<InfoBox variant="info" title="No Icon Alert" showIcon={false}>
		This alert has no icon, but the text remains aligned as if there were one.
	</InfoBox>
</Story>

<Story name="Custom Icon">
	{#snippet customIcon()}
		<div
			style="width: 20px; height: 20px; background: var(--akui-bg-accent); border-radius: 4px; display: flex; align-items: center; justify-content: center;"
		>
			<Icon name="star-fill" size={12} color="white" />
		</div>
	{/snippet}
	<InfoBox title="Premium Feature" iconSnippet={customIcon}>
		This feature is only available to premium subscribers.
	</InfoBox>
</Story>

<Story name="Without Title">
	<InfoBox icon="info-circle-fill">
		A simple message without a title for quick alerts.
	</InfoBox>
</Story>
