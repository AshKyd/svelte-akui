<script lang="ts">
	import {
		DARK_THEME,
		LIGHT_THEME,
		getThemeStore,
		type AkuiTheme
	} from '../../hooks/themeStore.svelte.js';
	import Fieldset from '../Fieldset/Fieldset.svelte';
	import SelectableItem from '../SelectableItem/SelectableItem.svelte';
	import Small from '../Small/Small.svelte';
	import {
		buildThemeOptions,
		groupThemeOptions,
		themeScopeStyle,
		type ThemeGroupBy,
		type ThemeOption
	} from './themePickerOptions.js';

	interface Props {
		/** Show the "System" option, which follows the OS colour scheme. */
		includeSystem?: boolean;
		/** Headed groups: `scheme` (light/dark), `group` (each theme's `group` field) or `none`. */
		groupBy?: ThemeGroupBy;
		/** Accessible label for the radio group. */
		label?: string;
		/** Called after the user picks a theme (`null` = System). */
		onchange?: (theme: AkuiTheme | null) => void;
	}

	let { includeSystem = true, groupBy = 'none', label = 'Theme', onchange }: Props = $props();

	const store = getThemeStore();
	/** Radios sharing this name form one native group, so arrow keys and Tab behave as usual. */
	const uid = $props.id();
	const name = `akui-theme-${uid}`;
	const groups = $derived(
		groupThemeOptions(buildThemeOptions({ themes: store.themes, includeSystem }), groupBy)
	);

	/** The radios' `group` follows `store.selectedId`, so a pick only has to update the store. */
	function pick(option: ThemeOption) {
		store.select(option.theme);
		onchange?.(option.theme);
	}
</script>

{#snippet preview(theme: AkuiTheme | null)}
	{#if theme}
		<span class="sample"></span>
	{:else}
		<span class="sample">
			{#each [LIGHT_THEME, DARK_THEME] as fallback (fallback.id)}
				<!-- Use the app's own Light/Dark definitions, which may be re-branded. -->
				{@const half = store.themes.find(({ id }) => id === fallback.id) ?? fallback}
				<span class="sample half" style={themeScopeStyle(half)}></span>
			{/each}
		</span>
	{/if}
{/snippet}

{#snippet optionList(groupOptions: ThemeOption[])}
	<div class="options">
		{#each groupOptions as option (option.id)}
			<!-- System has no theme of its own, so its card takes the one matching the OS scheme. -->
			{@const cardTheme =
				option.theme ?? store.themes.find(({ id }) => id === store.systemScheme) ?? LIGHT_THEME}
			<!-- The inline style scopes the whole card to the theme: its background, text and border. -->
			<SelectableItem
				class="option"
				style={themeScopeStyle(cardTheme)}
				{name}
				value={option.id}
				group={store.selectedId}
				onchange={() => pick(option)}
			>
				<span class="preview">
					{@render preview(option.theme)}
				</span>
				<span class="caption">
					<Small tag="span" colour={store.selectedId === option.id ? 'regular' : 'secondary'}>
						{option.label}
					</Small>
				</span>
			</SelectableItem>
		{/each}
	</div>
{/snippet}

<div class="theme-picker" role="radiogroup" aria-label={label}>
	{#each groups as group (group.label)}
		{#if group.label}
			<Fieldset legend={group.label} level={3} isInForm>
				{@render optionList(group.options)}
			</Fieldset>
		{:else}
			<!-- Inset to line up with the options inside the Fieldsets below it. -->
			<div class:aligned-with-groups={groups.length > 1}>
				{@render optionList(group.options)}
			</div>
		{/if}
	{/each}
</div>

<style>
	.theme-picker {
		display: flex;
		flex-direction: column;
		gap: var(--akui-space-m);
	}

	/* Fieldset's side padding (1.25rem) plus its 1px border. */
	.aligned-with-groups {
		padding-inline: calc(1.25rem + 1px);
	}

	.options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--akui-space-m);
	}

	/*
	 * One ordinary rounded box: background and border on the same element, so the browser draws
	 * them together with no seam. The colour variables come from the item's inline theme style, so
	 * they are the theme's own, not the page's. `SelectableItem` clips the contents (overflow hidden).
	 */
	.theme-picker :global(.option) {
		width: 6rem;
		color: var(--akui-fg);
		text-align: center;
		background: var(--akui-bg);
		border: 1px solid var(--akui-border-input);
		transition:
			top 0.1s ease,
			border-color 0.2s ease;
	}

	.theme-picker :global(.option[data-checked='true']) {
		border-color: var(--akui-bg-accent);
	}

	/* The Glow fills the padding box, which is one border-width smaller than the outer radius. */
	.theme-picker :global(.option .akui-glow) {
		border-radius: calc(var(--akui-radius-m) - 1px);
	}

	.preview {
		display: flex;
		height: 3.5rem;
	}

	.caption {
		display: block;
		padding: var(--akui-space-xs) var(--akui-space-s);
	}

	/* A flat block of the theme's secondary colour; System shows two side by side. */
	.sample {
		display: flex;
		flex: 1;
		background: var(--akui-bg-secondary);
	}

	.half {
		height: 100%;
	}
</style>
