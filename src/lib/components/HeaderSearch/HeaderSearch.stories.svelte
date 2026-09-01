<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HeaderSearch from './HeaderSearch.svelte';
	import Header from '../Header/Header.svelte';
	import Button from '../Button/Button.svelte';
	import Badge from '../Badge/Badge.svelte';

	const { Story } = defineMeta({
		title: 'Components/HeaderSearch',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script lang="ts">
	let isSearching = $state(false);
	let searchQuery = $state('');
	let inlineQuery = $state('Lavender draught');
</script>

{#snippet headerTitle()}
	<span style="font-weight: 600;">Village Apothecary Archives</span>
{/snippet}

{#snippet headerActions()}
	{#if !isSearching}
		<Button
			variant="ghost"
			icon="search"
			iconPosition="only"
			onclick={() => (isSearching = true)}
			aria-label="Search apothecary records"
		/>
	{/if}
	<Button variant="ghost" icon="gear" iconPosition="only" aria-label="Apothecary Settings" />
{/snippet}

{#snippet customSuffix()}
	<Badge variant="accent">Alchemical</Badge>
{/snippet}

<Story name="Header Takeover">
	<div style="position: relative; width: 100%; border-bottom: 1px solid var(--akui-border-input);">
		<Header title={headerTitle} actions={headerActions} pinned={false} />
		<HeaderSearch
			bind:isSearching
			bind:searchQuery
			placeholder="Search herbal draughts, elixir recipes, and potion brews..."
		/>
	</div>
	<div style="padding: var(--akui-space-m);">
		<p><strong>Search State:</strong> {isSearching ? 'Active' : 'Idle'}</p>
		<p><strong>Current Query:</strong> {searchQuery || '(none)'}</p>
	</div>
</Story>

<Story name="Inline Mode with Suffix">
	<div style="width: 100%; border: 1px solid var(--akui-border-input); border-radius: var(--akui-radius-m);">
		<HeaderSearch
			mode="inline"
			bind:searchQuery={inlineQuery}
			placeholder="Find woodland creature registry entries..."
			suffix={customSuffix}
		/>
	</div>
	<div style="padding: var(--akui-space-m);">
		<p><strong>Query:</strong> {inlineQuery}</p>
	</div>
</Story>
