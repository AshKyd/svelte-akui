<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from './Header.svelte';
	import Sidebar from '../Sidebar/Sidebar.svelte';
	import Padding from '../Padding/Padding.svelte';
	import Button from '../Button/Button.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Small from '../Small/Small.svelte';
	import { ControlItem } from '../Control/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Header',
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script lang="ts">
	let isOpen = $state(false);
</script>

{#snippet sidebarFooter()}
	<Small tag="p">© 2024 Akui</Small>
	<Small tag="p">v1.0.4-beta</Small>
{/snippet}

{#snippet titleSnippet()}
	<Icon name="bolt-fill" colour="var(--akui-bg-accent)" size="1.25rem" />
	<span style="margin-left: 0.5rem;">Akui App</span>
{/snippet}

{#snippet actionsSnippet()}
	<Button variant="regular" icon="search" iconPosition="only" size="small" />
	<Button variant="accent" size="small">Upgrade</Button>
{/snippet}

{#snippet sidebarNav()}
	<ControlItem icon="house" label="Dashboard" />
	<ControlItem icon="graph-up" label="Analytics" />
	<ControlItem icon=" gear" label="Settings" />
{/snippet}

{#snippet headerWithSidebar()}
	<Header title={titleSnippet} hasSidebar={true} bind:sidebarOpen={isOpen}>
		{@render actionsSnippet()}
	</Header>
{/snippet}

<Story name="Standalone">
	<Header title={titleSnippet}>
		{@render actionsSnippet()}
	</Header>
	<Padding size="l">
		<p>Standalone header without a sidebar. The title is always visible.</p>
	</Padding>
</Story>

<Story name="Full Layout Integration">
	<Sidebar
		bind:isOpen
		sidebar={sidebarNav}
		header={headerWithSidebar}
		footer={sidebarFooter}
		title={titleSnippet}
	>
		<Padding size="l">
			<h2>Integrated Layout</h2>
			<p><strong>Desktop</strong>: Header is above the sidebar. Title is in the header.</p>
			<p>
				<strong>Mobile</strong>: Header shifts with content. Title moves into the sidebar menu.
				Hamburger menu appears in the header.
			</p>

			{#each Array.from({ length: 10 }, (_, k) => k) as i (i)}
				<p>Main content block {i + 1}...</p>
			{/each}
		</Padding>
	</Sidebar>
</Story>
