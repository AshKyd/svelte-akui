<script lang="ts">
	import Loader from '../Loader/Loader.svelte';
	import Button from '../Button/Button.svelte';
	import { WysiwygEditorController } from './WysiwygEditor.svelte';

	// Static imports of style files so the CSS is bundled by the application builder
	import '@milkdown/crepe/theme/common/style.css';
	import '@milkdown/crepe/theme/frame.css';

	interface Props {
		/** Bindable current value of the editor. */
		value?: string;

		/** Callback when content changes. */
		onchange?: (value: string) => void;
		/** Custom loader snippet. If not provided, falls back to the default Loader. */
		loader?: import('svelte').Snippet;
		/** Additional CSS classes for the editor container. */
		class?: string;
	}

	let { value = $bindable(''), onchange, loader, class: className = '' }: Props = $props();

	// Instantiate the controller to manage the editor state and lifecycle
	const editor = new WysiwygEditorController(value, (markdown) => {
		value = markdown;
		onchange?.(markdown);
	});

	// Synchronise external value changes back to the editor, avoiding loop feedback.
	$effect(() => {
		editor.updateValue(value);
	});
</script>

<div class="akui-wysiwyg-container bespoke {className}">
	{#if editor.loading}
		<div class="akui-wysiwyg-loader" role="status" aria-busy="true">
			{#if loader}
				{@render loader()}
			{:else}
				<Loader size="2rem" label="Loading editor..." />
			{/if}
		</div>
	{:else if editor.loadError}
		<div class="akui-wysiwyg-error">
			<p>Failed to load the visual editor.</p>
			<Button size="small" onclick={() => editor.retry()}>Try again</Button>
		</div>
	{/if}

	<div use:editor.init class="akui-wysiwyg-editor" class:akui-hidden={editor.loadError}></div>
</div>

<style>
	.akui-wysiwyg-container {
		position: relative;
		width: 100%;
		border: none;
		background-color: transparent;
		color: var(--akui-fg);
		min-height: 250px;
		display: flex;
		flex-direction: column;
		transition: var(--akui-transition-theme);
	}

	.akui-wysiwyg-loader,
	.akui-wysiwyg-error {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: transparent;
		z-index: 10;
	}

	.akui-wysiwyg-error {
		gap: var(--akui-space-s);
		color: var(--akui-fg-secondary);
		font-size: 0.875rem;
	}

	.akui-wysiwyg-editor {
		flex: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.akui-wysiwyg-editor.akui-hidden {
		display: none;
	}

	/* Map milkdown crepe theme variables to svelte-akui design tokens */
	.akui-wysiwyg-container :global(.milkdown) {
		--crepe-color-background: transparent;
		--crepe-color-on-background: var(--akui-fg);
		--crepe-color-surface: var(--akui-bg-secondary);
		--crepe-color-surface-low: var(--akui-bg-input);
		--crepe-color-on-surface: var(--akui-fg);
		--crepe-color-on-surface-variant: var(--akui-fg-secondary);
		--crepe-color-outline: var(--akui-border-input);
		--crepe-color-primary: var(--akui-bg-accent);
		--crepe-color-secondary: var(--akui-bg-button);
		--crepe-color-on-secondary: var(--akui-fg-button);
		--crepe-color-inline-code: var(--akui-color-orange-fg);
		--crepe-color-hover: var(--akui-bg-hover);
		--crepe-color-selected: var(--akui-bg-hover);

		/* Reset built-in fonts to inherit svelte-akui styling */
		--crepe-font-default: inherit;
		--crepe-font-title: inherit;
		--crepe-font-code: inherit;

		font-family: inherit;
		font-size: inherit !important;
		background-color: transparent;
		color: var(--akui-fg);
		padding: 0;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
	}

	/* Reset default block indentation inside the editor content area */
	.akui-wysiwyg-container :global(.milkdown .editor > *) {
		margin-left: 0 !important;
		padding-left: 0 !important;
	}

	.akui-wysiwyg-container :global(.milkdown .editor),
	.akui-wysiwyg-container :global(.milkdown .editor-container),
	.akui-wysiwyg-container :global(.milkdown .prose),
	.akui-wysiwyg-container :global(.milkdown .prose *) {
		outline: none;
		min-height: 200px;
		flex: 1;
		box-sizing: border-box;
		max-width: 100% !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	/* Ensure Milkdown dropdowns, popups, and floating menus sit above surrounding UI */
	.akui-wysiwyg-container :global(.milkdown-slash-menu),
	.akui-wysiwyg-container :global(.milkdown-toolbar),
	.akui-wysiwyg-container :global(.milkdown-block-handle),
	.akui-wysiwyg-container :global(.milkdown-link-preview),
	.akui-wysiwyg-container :global(.milkdown-link-edit),
	.akui-wysiwyg-container :global(.milkdown-top-bar),
	.akui-wysiwyg-container :global(.milkdown-ai) {
		z-index: 1000;
	}

	/* Style Crepe dropdowns, toolbars, and popups to match akui design tokens */
	.akui-wysiwyg-container :global(.milkdown-slash-menu),
	.akui-wysiwyg-container :global(.milkdown-toolbar),
	.akui-wysiwyg-container :global(.milkdown-link-preview > .link-preview),
	.akui-wysiwyg-container :global(.milkdown-link-edit > .link-edit),
	.akui-wysiwyg-container :global(.milkdown-ai) {
		border: 1px solid var(--akui-border-input) !important;
		border-radius: var(--akui-radius-m) !important;
		background-color: var(--akui-bg) !important;
		color: var(--akui-fg) !important;
		box-shadow:
			var(--akui-shadow-shiny),
			0 4px 12px rgba(0, 0, 0, 0.15) !important;
		transition: var(--akui-transition-theme);
	}

	/* Prevent horizontal scrollbars inside the slash menu list dropdown container */
	.akui-wysiwyg-container :global(.milkdown-slash-menu .menu-groups) {
		overflow-x: hidden;
	}
</style>
