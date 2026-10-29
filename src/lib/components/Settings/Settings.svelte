<script lang="ts">
	import { type Snippet } from 'svelte';
	import Header from '../Header/Header.svelte';
	import Button from '../Button/Button.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Padding from '../Padding/Padding.svelte';
	import { surfaceStyle, type SurfaceStyle } from '../../utils/surface.js';
	import { ControlGroup, ControlItemText } from '../ControlGroup/index.js';
	import SettingsNavItem from './SettingsNavItem/SettingsNavItem.svelte';
	import type { SettingsSection } from './types.js';

	interface Props {
		/** The sections to show, in order. */
		sections: SettingsSection[];
		/** Id of the open section. `null` shows the overview on mobile (desktop falls back to the first section). */
		selectedId?: string | null;
		/** Called with the new id when a section is chosen, or `null` when going back to the overview. Use it to navigate with the router. */
		onselect?: (id: string | null) => void;
		/** Called when the back button on the overview is pressed (e.g. to leave settings). The button is hidden when omitted. */
		onback?: () => void;
		/** Title of the top header (the overview on mobile, the tab column on desktop). */
		title?: string;
		/** Overrides `title` in the top header. */
		titleSnippet?: Snippet;
		/** Overrides the detail header title, which defaults to the section's `title` or `label`. */
		detailTitle?: Snippet<[SettingsSection]>;
		/** Actions on the right of the top header. */
		headerActions?: Snippet;
		/** Actions on the right of the detail header. */
		detailActions?: Snippet<[SettingsSection]>;
		/** Custom navigation (left) content for the top header, shown instead of the back button. */
		headerNavigation?: Snippet;
		/** Overrides the background, text and border of Settings and its headers, e.g. `{ background: 'transparent' }` to show a page background through it. */
		surface?: SurfaceStyle;
		/** Desktop tab size, as `Tree`'s `size`. Defaults to 'small'. */
		size?: 'small' | 'large';
		/** Space around the desktop tab list, from the theme spacing scale (as `Padding`'s `size`). Defaults to 's'. */
		padding?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
		/** Container width in px below which the mobile layout is used. */
		mobileBreakpoint?: number;
		/** Additional CSS classes. */
		class?: string;
	}

	let {
		sections,
		selectedId = $bindable(null),
		onselect,
		onback,
		title = 'Settings',
		titleSnippet,
		detailTitle,
		headerActions,
		detailActions,
		headerNavigation,
		surface,
		size = 'small',
		padding = 's',
		mobileBreakpoint = 768,
		class: className = ''
	}: Props = $props();

	let containerWidth = $state(0);
	let navElement = $state<HTMLElement>();

	// Width is 0 until measured; assume desktop so the first paint doesn't flash the mobile layout.
	const isMobile = $derived(containerWidth > 0 && containerWidth < mobileBreakpoint);

	// Desktop always shows a section, so an unselected state falls back to the first one.
	const desktopSection = $derived(
		sections.find((section) => section.id === selectedId) ?? sections[0]
	);

	// On mobile the detail layer slides out after going back, so it must keep rendering the last
	// section it showed rather than going blank mid-animation.
	let lastOpenSection: SettingsSection | undefined;
	const mobileDetailSection = $derived.by(() => {
		const open = sections.find((section) => section.id === selectedId);
		if (open) lastOpenSection = open;
		return open ?? sections.find((section) => section.id === lastOpenSection?.id);
	});
	const isDetailOpen = $derived(isMobile && selectedId !== null && !!mobileDetailSection);

	function select(id: string | null) {
		selectedId = id;
		onselect?.(id);
	}

	// Roving tabindex arrow-key navigation for the desktop tab column; arrows also select, like native tabs.
	function handleTabKeydown(event: KeyboardEvent) {
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		const home = event.key === 'Home';
		const end = event.key === 'End';
		if (!step && !home && !end) return;
		event.preventDefault();
		const currentIndex = sections.findIndex((section) => section.id === desktopSection?.id);
		const nextIndex = home
			? 0
			: end
				? sections.length - 1
				: (currentIndex + (step ?? 0) + sections.length) % sections.length;
		select(sections[nextIndex].id);
		navElement?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex]?.focus();
	}
</script>

{#snippet headerTitle()}
	{#if titleSnippet}
		{@render titleSnippet()}
	{:else}
		{title}
	{/if}
{/snippet}

{#snippet backButton(label: string, onpress: () => void)}
	<Button
		variant="ghost"
		icon="chevron-left"
		iconPosition="only"
		aria-label={label}
		onclick={onpress}
	/>
{/snippet}

{#snippet topNavigation()}
	{#if headerNavigation}
		{@render headerNavigation()}
	{:else if onback}
		{@render backButton('Back', onback)}
	{/if}
{/snippet}

{#snippet detailHeader(section: SettingsSection, showBack: boolean)}
	{#snippet detailNavigation()}
		{#if showBack}
			{@render backButton(`Back to ${title}`, () => select(null))}
		{/if}
	{/snippet}
	{#snippet detailHeading()}
		{#if detailTitle}
			{@render detailTitle(section)}
		{:else}
			{section.title ?? section.label}
		{/if}
	{/snippet}
	{#snippet detailHeaderActions()}
		{#if detailActions}
			{@render detailActions(section)}
		{/if}
	{/snippet}
	<Header
		pinned={false}
		{surface}
		navigation={showBack ? detailNavigation : undefined}
		title={detailHeading}
		actions={detailActions ? detailHeaderActions : undefined}
	/>
{/snippet}

<div
	class="akui-settings {className}"
	class:mobile={isMobile}
	style={surfaceStyle('settings', surface)}
	bind:clientWidth={containerWidth}
>
	{#if isMobile}
		<!-- Mobile: overview and detail are stacked layers that slide horizontally. -->
		<div class="akui-settings-layer overview" class:covered={isDetailOpen} inert={isDetailOpen}>
			<Header pinned={false} {surface} navigation={topNavigation} title={headerTitle} actions={headerActions} />
			<div class="akui-settings-scroll">
				<ControlGroup>
					{#each sections as section (section.id)}
						<ControlItemText icon={section.icon} onclick={() => select(section.id)}>
							<span class="akui-settings-row">
								<span class="akui-settings-row-text">
									<span>{section.label}</span>
									{#if section.description}
										<span class="akui-settings-row-description">{section.description}</span>
									{/if}
								</span>
								<Icon name="chevron-right" size="1em" class="akui-settings-row-chevron" />
							</span>
						</ControlItemText>
					{/each}
				</ControlGroup>
			</div>
		</div>

		<div class="akui-settings-layer detail" class:open={isDetailOpen} inert={!isDetailOpen}>
			{#if mobileDetailSection}
				{@render detailHeader(mobileDetailSection, true)}
				<div class="akui-settings-scroll akui-settings-content">
					{@render mobileDetailSection.children()}
				</div>
			{/if}
		</div>
	{:else}
		<!-- Desktop: tab column beside the section content. -->
		<div class="akui-settings-column">
			<Header pinned={false} {surface} navigation={topNavigation} title={headerTitle} actions={headerActions} />
			<!-- Focus lives on the tabs (roving tabindex), not the list. -->
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<div
				class="akui-settings-tabs"
				role="tablist"
				aria-orientation="vertical"
				aria-label={title}
				bind:this={navElement}
				onkeydown={handleTabKeydown}
			>
				<Padding size={padding}>
					{#each sections as section (section.id)}
						<SettingsNavItem
							label={section.label}
							icon={section.icon}
							{size}
							selected={section.id === desktopSection?.id}
							onclick={() => select(section.id)}
						/>
					{/each}
				</Padding>
			</div>
		</div>

		<div class="akui-settings-pane" role="tabpanel">
			{#if desktopSection}
				{#key desktopSection.id}
					{@render detailHeader(desktopSection, false)}
					<div class="akui-settings-scroll akui-settings-content">
						{@render desktopSection.children()}
					</div>
				{/key}
			{/if}
		</div>
	{/if}
</div>

<style>
	.akui-settings {
		position: relative;
		display: flex;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		background-color: var(--akui-settings-bg, var(--akui-bg));
		color: var(--akui-settings-fg, var(--akui-fg));
	}

	/* Desktop */
	.akui-settings-column {
		display: flex;
		flex-direction: column;
		flex: 0 0 16rem;
		min-width: 0;
		border-right: 1px solid var(--akui-settings-border, var(--akui-border-input));
	}

	.akui-settings-tabs {
		overflow-y: auto;
	}

	.akui-settings-pane {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	/* Shared */
	.akui-settings-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}

	.akui-settings-content {
		padding: var(--akui-space-l, 1.5rem) var(--akui-space-m);
		box-sizing: border-box;
	}

	.akui-settings:not(.mobile) .akui-settings-content > :global(*) {
		max-width: 44rem;
		margin-inline: auto;
	}

	/* Mobile: layered drill-down. With reduced motion the layers fade instead of sliding (see the end of this block). */
	.akui-settings-layer {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--akui-settings-bg, var(--akui-bg));
		transition:
			transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
			opacity 0.3s ease;
	}

	/* Fades fully out (not part way) so a transparent surface doesn't show the overview through the detail. */
	.akui-settings-layer.overview.covered {
		transform: translateX(-30%);
		opacity: 0;
	}

	.akui-settings-layer.detail {
		transform: translateX(100%);
		box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
	}

	.akui-settings-layer.detail.open {
		transform: translateX(0);
	}

	.akui-settings-layer.overview .akui-settings-scroll {
		padding: var(--akui-space-m);
	}

	.akui-settings-row {
		display: flex;
		align-items: center;
		gap: var(--akui-space-s);
	}

	.akui-settings-row-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.akui-settings-row-description {
		font-size: 0.8rem;
		font-weight: 400;
		color: var(--akui-fg-secondary);
	}

	:global(.akui-settings-row-chevron) {
		color: var(--akui-fg-secondary);
	}

	:global(html[data-reduced-motion='true']) .akui-settings-layer {
		transition: opacity 0.12s ease;
	}
</style>
