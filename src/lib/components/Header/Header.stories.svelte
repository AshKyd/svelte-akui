<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from './Header.svelte';
	import Button from '../Button/Button.svelte';
	import Icon from '../Icon/Icon.svelte';

	const { Story } = defineMeta({
		title: 'Components/Header',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet navigationSnippet()}
	<Button variant="ghost" icon="list" iconPosition="only" aria-label="Menu" />
{/snippet}

{#snippet titleSnippet()}
	<span style="font-weight: 600;">My Application</span>
{/snippet}

{#snippet actionsSnippet()}
	<Button variant="ghost" icon="search" iconPosition="only" />
	<Button variant="ghost" icon="gear" iconPosition="only" />
{/snippet}

<Story name="Standard">
	<Header
		navigation={navigationSnippet}
		title={titleSnippet}
		actions={actionsSnippet}
	/>
</Story>

<Story name="Title Only">
	<Header title={titleSnippet} />
</Story>

<Story name="Title and Actions">
	<Header title={titleSnippet} actions={actionsSnippet} />
</Story>
