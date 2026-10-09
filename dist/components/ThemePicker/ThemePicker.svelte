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

	/** Inline `--akui-*` overrides for a preview. */
	const tokenStyle = (theme: AkuiTheme) =>
		Object.entries(theme.tokens ?? {})
			.map(([name, value]) => `${name}:${value}`)
			.join(';');

	/** The radios' `group` follows `store.selectedId`, so a pick only has to update the store. */
	function pick(option: ThemeOption) {
		store.select(option.theme);
		onchange?.(option.theme);
	}
</script>

{#snippet preview(theme: AkuiTheme | null)}
	{#if theme}
		<span class="sample">
			<span class="accent"></span>
		</span>
	{:else}
		<span class="sample split">
			{#each [LIGHT_THEME, DARK_THEME] as fallback (fallback.id)}
				<!-- Use the app's own Light/Dark definitions, which may be re-branded. -->
				{@const half = store.themes.find(({ id }) => id === fallback.id) ?? fallback}
				<span class="sample half" data-theme={half.scheme} style={tokenStyle(half)}>
					<span class="accent"></span>
				</span>
			{/each}
		</span>
	{/if}
{/snippet}

{#snippet optionList(groupOptions: ThemeOption[])}
	<div class="options">
		{#each groupOptions as option (option.id)}
			<!-- System has no theme of its own, so its card takes the one matching the OS scheme. -->
			{@const faceTheme =
				option.theme ?? store.themes.find(({ id }) => id === store.systemScheme) ?? LIGHT_THEME}
			<SelectableItem
				class="option"
				{name}
				value={option.id}
				group={store.selectedId}
				onchange={() => pick(option)}
			>
				<!-- The whole card is scoped to the theme, so its background and text are the theme's own. -->
				<span class="face" data-theme={faceTheme.scheme} style={tokenStyle(faceTheme)}>
					<span class="preview">
						{@render preview(option.theme)}
					</span>
					<span class="caption">
						<Small tag="span" colour={store.selectedId === option.id ? 'regular' : 'secondary'}>
							{option.label}
						</Small>
					</span>
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

	/* The card frame: one border. The background and text come from the theme in `.face`. */
	.theme-picker :global(.option) {
		width: 6rem;
		text-align: center;
		border: 1px solid var(--akui-border-input);
		transition:
			transform 0.1s ease,
			border-color 0.2s ease;
	}

	.theme-picker :global(.option[data-checked='true']) {
		border-color: rgba(var(--akui-bg-accent-rgb), 0.7);
	}

	/* Re-scoped to the theme (data-theme and inline tokens), so these vars are the theme's own. */
	.face {
		display: block;
		color: var(--akui-fg);
		background: var(--akui-bg);
	}

	.preview {
		display: flex;
		height: 3.5rem;
	}

	.caption {
		display: block;
		padding: var(--akui-space-xs) var(--akui-space-s);
	}

	.sample {
		display: flex;
		flex: 1;
		align-items: flex-end;
		justify-content: flex-end;
		padding: var(--akui-space-xs);
		background: var(--akui-bg-secondary);
	}

	.split {
		padding: 0;
	}

	.half {
		height: 100%;
	}

	.accent {
		width: 1rem;
		height: 1rem;
		background: var(--akui-bg-accent);
		border-radius: 50%;
	}
</style>
