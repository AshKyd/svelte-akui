<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { AkuiTheme } from '../../hooks/themeStore.svelte.js';

	// No `component` here: each story renders ThemePicker itself. The Storybook decorator wraps it
	// in a UIRoot, and the `akuiThemes` story parameter becomes that UIRoot's `themes`.
	const { Story } = defineMeta({
		title: 'Components/ThemePicker'
	});

	const cosyThemes: AkuiTheme[] = [
		{
			id: 'mushroom-cottage',
			label: 'Mushroom Cottage',
			scheme: 'light',
			tokens: {
				'--akui-bg': '#f6ecdc',
				'--akui-bg-secondary': '#ead9bd',
				'--akui-fg': '#3b2a1e',
				'--akui-bg-accent': '#b4482f',
				'--akui-bg-accent-rgb': '180, 72, 47'
			}
		},
		{
			id: 'moonlit-bakery',
			label: 'Moonlit Bakery',
			scheme: 'dark',
			tokens: {
				'--akui-bg': '#1a1530',
				'--akui-bg-secondary': '#262046',
				'--akui-fg': '#f4e9c9',
				'--akui-bg-accent': '#e8a838',
				'--akui-bg-accent-rgb': '232, 168, 56'
			}
		}
	];

	const groupedThemes: AkuiTheme[] = [
		...cosyThemes.map((theme) => ({ ...theme, group: 'Village bakeries' })),
		{
			id: 'gnome-allotment',
			label: 'Gnome Allotment',
			scheme: 'light',
			group: 'Gardens',
			tokens: {
				'--akui-bg': '#e8f1dc',
				'--akui-fg': '#23331c',
				'--akui-bg-accent': '#4f8a3c',
				'--akui-bg-accent-rgb': '79, 138, 60'
			}
		},
		{
			id: 'witchs-greenhouse',
			label: "Witch's Greenhouse",
			scheme: 'dark',
			group: 'Gardens',
			tokens: {
				'--akui-bg': '#11261c',
				'--akui-fg': '#dff5e3',
				'--akui-bg-accent': '#6fd39a',
				'--akui-bg-accent-rgb': '111, 211, 154'
			}
		}
	];
</script>

<script lang="ts">
	import ThemePicker from './ThemePicker.svelte';
</script>

<Story name="Default">
	{#snippet children()}
		<div style="padding: 1rem"><ThemePicker /></div>
	{/snippet}
</Story>

<Story name="With custom themes" parameters={{ akuiThemes: cosyThemes }}>
	{#snippet children()}
		<div style="padding: 1rem"><ThemePicker /></div>
	{/snippet}
</Story>

<Story name="Grouped by scheme" parameters={{ akuiThemes: cosyThemes }}>
	{#snippet children()}
		<div style="padding: 1rem"><ThemePicker groupBy="scheme" /></div>
	{/snippet}
</Story>

<Story name="Grouped by custom group" parameters={{ akuiThemes: groupedThemes }}>
	{#snippet children()}
		<div style="padding: 1rem"><ThemePicker groupBy="group" /></div>
	{/snippet}
</Story>
