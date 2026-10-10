<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component` here: the story renders the page itself. The Storybook decorator already
	// provides UIRoot, so the light/dark toolbar and `ThemePicker` both drive the same theme.
	const { Story } = defineMeta({
		title: 'Kitchen Sink',
		parameters: { layout: 'fullscreen' }
	});
</script>

<script lang="ts">
	import { ThemePicker, Divider } from '$lib/index.js';
	import ButtonsSection from './sections/ButtonsSection.svelte';
	import BadgesSection from './sections/BadgesSection.svelte';
	import FormsSection from './sections/FormsSection.svelte';
	import FeedbackSection from './sections/FeedbackSection.svelte';
	import ModalSection from './sections/ModalSection.svelte';
	import SurfacesSection from './sections/SurfacesSection.svelte';
	import DataSection from './sections/DataSection.svelte';
	import FocusShellSection from './sections/FocusShellSection.svelte';
</script>

<Story name="All components">
	{#snippet children()}
		<div class="kitchen-sink">
			<header class="kitchen-sink__bar">
				<strong>akui kitchen sink</strong>
				<ThemePicker includeSystem />
			</header>

			<main class="kitchen-sink__main">
				<ButtonsSection />
				<Divider />
				<BadgesSection />
				<Divider />
				<FormsSection />
				<Divider />
				<FeedbackSection />
				<Divider />
				<ModalSection />
				<Divider />
				<SurfacesSection />
				<Divider />
				<DataSection />
				<Divider />
				<FocusShellSection />
			</main>
		</div>
	{/snippet}
</Story>

<style>
	.kitchen-sink {
		min-height: 100dvh;
		background: var(--akui-bg);
		color: var(--akui-fg);
	}

	.kitchen-sink__bar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.5rem;
		background: var(--akui-bg-secondary);
		border-bottom: 1px solid var(--akui-border-input);
	}

	.kitchen-sink__main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 1.5rem;
		max-width: 80rem;
		margin: 0 auto;
	}

	/* Shared by every section: headings and a wrapping flex row of demos. */
	.kitchen-sink :global(h2) {
		margin: 0 0 1rem;
		font-size: 1.25rem;
	}

	.kitchen-sink :global(h3) {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--akui-fg-secondary);
	}

	.kitchen-sink :global(.demo-row) {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.kitchen-sink :global(.demo-cell) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 16rem;
		flex: 1 1 16rem;
	}

	.kitchen-sink :global(.demo-box) {
		position: relative;
		border: 1px dashed var(--akui-border-input);
		border-radius: var(--akui-radius-m);
		overflow: hidden;
	}
</style>
