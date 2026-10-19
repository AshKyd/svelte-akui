<script lang="ts">
	import Loader from '../Loader/Loader.svelte';
	import Button from '../Button/Button.svelte';
	import { WysiwygEditorController, type SlashMenuConfig } from './WysiwygEditor.svelte';
	import { getAllContexts, untrack } from 'svelte';

	interface Props {
		/** Bindable current value of the editor, as markdown. */
		value?: string;
		/** Optional placeholder text displayed when editor is empty. Defaults to empty string. */
		placeholder?: string;
		/** Callback when content changes. */
		onchange?: (value: string) => void;
		/** Custom loader snippet. If not provided, falls back to the default Loader. */
		loader?: import('svelte').Snippet;
		/** Minimum height reserved for the editor area. Any CSS length. Defaults to '250px'. */
		minHeight?: string;
		/** Additional CSS classes for the editor container. */
		class?: string;
		/** Optional hook to transform or sanitize pasted HTML before insertion. */
		transformPastedHTML?: (html: string) => string;
		/** Optional hook to transform or sanitize pasted plain text or markdown before insertion. */
		transformPastedText?: (text: string, plain: boolean) => string;
		/** Optional paste event handler. Return true to prevent default editor paste behaviour. */
		handlePaste?: (event: ClipboardEvent) => boolean | void;
		/**
		 * Opt in to the "/" slash menu. Pass `true` for the default commands, or a
		 * {@link SlashMenuConfig} to hide, reorder or add commands.
		 */
		slashMenu?: boolean | SlashMenuConfig;
		/** Move ticked task items to a collapsible "completed" section at the end of their list. Read once on load. */
		groupCompletedTasks?: boolean;
		/** Start an empty editor with an empty H1 rather than a paragraph, and focus it. */
		startWithHeading?: boolean;
		/** Turn a first-line H1 longer than this many characters into a paragraph, once. Read once on load. */
		demoteLongHeadingAt?: number;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		onchange,
		loader,
		minHeight = '250px',
		class: className = '',
		transformPastedHTML,
		transformPastedText,
		handlePaste,
		slashMenu = false,
		groupCompletedTasks = false,
		startWithHeading = false,
		demoteLongHeadingAt
	}: Props = $props();

	// Svelte components mounted inside the editor (e.g. task checkboxes) are outside this tree,
	// so hand them our context explicitly.
	const context = getAllContexts();

	// Instantiate the controller to manage the editor state and lifecycle
	const editor = new WysiwygEditorController(
		value,
		untrack(() => ({
			placeholder,
			transformPastedHTML,
			transformPastedText,
			handlePaste,
			slashMenu,
			groupCompletedTasks,
			startWithHeading,
			demoteLongHeadingAt,
			context
		})),
		(markdown) => {
			value = markdown;
			onchange?.(markdown);
		}
	);

	// Synchronise options changes to the controller
	$effect(() => {
		editor.setOptions({
			placeholder,
			transformPastedHTML,
			transformPastedText,
			handlePaste,
			slashMenu,
			groupCompletedTasks,
			startWithHeading,
			demoteLongHeadingAt,
			context
		});
	});

	// Synchronise external value changes back to the editor, avoiding loop feedback.
	$effect(() => {
		editor.updateValue(value);
	});

	/** Resolves once the editor has loaded, e.g. so a view transition can wait for its content. */
	export function whenReady() {
		return editor.whenReady();
	}

	/** Focuses the editor element. */
	export function focus(collapseToStart = true) {
		return editor.focus(collapseToStart);
	}

	/** Places the cursor at (approximately) the Nth word of the document and focuses it. */
	export async function focusAtWordIndex(index: number) {
		return editor.focusAtWordIndex(index);
	}

	/** Places the cursor `offset` characters into the first-line heading and focuses it. */
	export async function focusHeadingAt(offset: number) {
		return editor.focusHeadingAt(offset);
	}
</script>

<div
	class="akui-wysiwyg-container bespoke {className}"
	style="--akui-wysiwyg-min-height: {minHeight};"
>
	{#if editor.loading}
		<div class="akui-wysiwyg-loader" role="status" aria-busy="true">
			{#if loader}
				{@render loader()}
			{:else}
				<Loader size="2rem" label="Loading editor..." delay={200} />
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
		min-height: var(--akui-wysiwyg-min-height, 250px);
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

	/*
	 * The typing area fills the height the container reserves, so the whole panel stays
	 * clickable rather than only the first line of text.
	 */
	.akui-wysiwyg-container :global(.tiptap) {
		flex: 1;
		min-height: var(--akui-wysiwyg-min-height, 250px);
		outline: none;
		font-family: inherit;
		font-size: inherit;
		color: var(--akui-fg);
		background-color: transparent;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		overflow-wrap: anywhere;
	}

	.akui-wysiwyg-container :global(.tiptap > *:first-child) {
		margin-top: 0;
	}

	.akui-wysiwyg-container :global(.tiptap p) {
		margin: 0 0 0.5em;
	}

	.akui-wysiwyg-container :global(.tiptap h1),
	.akui-wysiwyg-container :global(.tiptap h2),
	.akui-wysiwyg-container :global(.tiptap h3) {
		margin: 0.8em 0 0.4em;
		line-height: 1.25;
	}

	.akui-wysiwyg-container :global(.tiptap h1) {
		font-size: 1.6em;
	}

	.akui-wysiwyg-container :global(.tiptap h2) {
		font-size: 1.3em;
	}

	.akui-wysiwyg-container :global(.tiptap h3) {
		font-size: 1.1em;
	}

	/* Links follow --akui-fg-link so a host can keep them readable on custom backgrounds. */
	.akui-wysiwyg-container :global(.tiptap a) {
		color: var(--akui-fg-link, var(--akui-bg-accent));
		cursor: pointer;
	}

	.akui-wysiwyg-container :global(.tiptap a:hover) {
		color: var(--akui-fg-link-hover, var(--akui-bg-accent-hover));
	}

	/* Text selection styling using akui theme tokens */
	.akui-wysiwyg-container ::selection,
	.akui-wysiwyg-container :global(::selection),
	.akui-wysiwyg-container :global(*::selection) {
		background-color: var(--akui-bg-accent, #2563eb) !important;
		color: var(--akui-fg-accent, #ffffff) !important;
		-webkit-text-fill-color: var(--akui-fg-accent, #ffffff) !important;
	}

	/* Code styling matching svelte-akui design tokens */
	.akui-wysiwyg-container :global(.tiptap code) {
		font-family: monospace;
		font-size: 0.9em;
		background-color: var(--akui-bg-secondary);
		color: var(--akui-fg);
		border-radius: var(--akui-radius-s);
		padding: 0.2em 0.4em;
	}

	.akui-wysiwyg-container :global(.tiptap pre) {
		background-color: var(--akui-bg-secondary);
		border: 1px solid var(--akui-border-input);
		border-radius: var(--akui-radius-m);
		color: var(--akui-fg);
		padding: 1rem;
		overflow-x: auto;
		margin: 0.5em 0;
	}

	.akui-wysiwyg-container :global(.tiptap pre code) {
		background: transparent;
		padding: 0;
		border-radius: 0;
		color: inherit;
	}

	.akui-wysiwyg-container :global(.tiptap blockquote) {
		margin: 0.5em 0;
		padding-left: 1em;
		border-left: 3px solid var(--akui-border-input);
		color: var(--akui-fg-secondary);
	}

	.akui-wysiwyg-container :global(.tiptap hr) {
		border: none;
		border-top: 1px solid var(--akui-border-input);
		margin: 1em 0;
	}

	/* Lists */
	.akui-wysiwyg-container :global(.tiptap ul),
	.akui-wysiwyg-container :global(.tiptap ol) {
		margin: 0 0 0.5em;
		padding-left: 1.5em;
	}

	.akui-wysiwyg-container :global(.tiptap li > p) {
		margin: 0;
	}

	.akui-wysiwyg-container :global(.tiptap ol li::marker),
	.akui-wysiwyg-container :global(.tiptap ul li::marker) {
		color: var(--akui-fg);
	}

	/* Task lists: checkbox then content on one line */
	.akui-wysiwyg-container :global(.tiptap ul[data-type='taskList']) {
		list-style: none;
		padding-left: 0;
	}

	.akui-wysiwyg-container :global(.tiptap ul[data-type='taskList'] ul[data-type='taskList']) {
		padding-left: 1.5em;
	}

	.akui-wysiwyg-container :global(.tiptap ul[data-type='taskList'] li) {
		display: flex;
		align-items: flex-start;
		gap: 0.5em;
	}

	/* The checkbox is an akui `Checkbox` (see extensions/TaskItemView.svelte), centred on the first line. */
	.akui-wysiwyg-container :global(.tiptap ul[data-type='taskList'] li > .akui-task-checkbox) {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		min-height: 1.5em;
		user-select: none;
	}

	/*
	 * Drag handle (extensions/taskItemDrag.ts). Sits in the left margin so checkboxes don't shift.
	 * Shown on hover and on the item holding the cursor; always faintly visible on touch screens.
	 */
	.akui-wysiwyg-container :global(.tiptap ul[data-type='taskList'] li) {
		position: relative;
	}

	.akui-wysiwyg-container :global(.tiptap .akui-task-handle) {
		position: absolute;
		left: -1.1em;
		top: 0;
		display: flex;
		align-items: center;
		min-height: 1.5em;
		padding: 0 0.15em;
		color: var(--akui-fg-placeholder);
		cursor: grab;
		touch-action: none;
		user-select: none;
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.akui-wysiwyg-container :global(.tiptap li:hover > .akui-task-handle),
	.akui-wysiwyg-container :global(.tiptap li.akui-task-active > .akui-task-handle),
	.akui-wysiwyg-container :global(.tiptap li.akui-task-dragging > .akui-task-handle) {
		opacity: 1;
	}

	@media (hover: none) {
		.akui-wysiwyg-container :global(.tiptap .akui-task-handle) {
			opacity: 0.5;
		}
	}

	.akui-wysiwyg-container :global(.tiptap .akui-task-handle:hover) {
		color: var(--akui-fg);
	}

	/* The dragged item follows the pointer (no transition), siblings slide out of its way. */
	.akui-wysiwyg-container :global(.tiptap li.akui-task-dragging) {
		z-index: 1;
		cursor: grabbing;
		background: var(--akui-bg);
		box-shadow: var(--akui-shadow-s, 0 2px 8px rgb(0 0 0 / 0.2));
	}

	.akui-wysiwyg-container :global(.tiptap li.akui-task-shifting) {
		transition: transform 150ms ease;
	}

	.akui-wysiwyg-container :global(.tiptap ul[data-type='taskList'] li > div) {
		flex: 1;
		min-width: 0;
	}

	/* Tables (kept when pasted or already in a note; no tools to create or restructure them) */
	.akui-wysiwyg-container :global(.tiptap table) {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: 0.5em 0;
		overflow: hidden;
	}

	.akui-wysiwyg-container :global(.tiptap th),
	.akui-wysiwyg-container :global(.tiptap td) {
		border: 1px solid var(--akui-border-input);
		padding: 0.4em 0.6em;
		vertical-align: top;
		position: relative;
	}

	.akui-wysiwyg-container :global(.tiptap th) {
		background-color: var(--akui-bg-secondary);
		text-align: left;
		font-weight: 600;
	}

	.akui-wysiwyg-container :global(.tiptap .selectedCell::after) {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--akui-bg-hover);
		pointer-events: none;
	}

	/* Placeholder (Tiptap marks the empty first node) */
	.akui-wysiwyg-container :global(.tiptap .is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		color: var(--akui-fg-placeholder);
	}

	/* Completed tasks section (groupCompletedTasks, see completedTasks.ts). */
	/* `!important`: task items set `display: flex` with higher specificity (`ul[data-type='taskList'] li`). */
	.akui-wysiwyg-container :global(.tiptap .akui-wysiwyg-completed-hidden) {
		display: none !important;
	}

	.akui-wysiwyg-container :global(.tiptap .akui-wysiwyg-completed-toggle) {
		display: flex;
		align-items: center;
		gap: var(--akui-space-xs, 0.25rem);
		width: 100%;
		margin: var(--akui-space-s, 0.5rem) 0 var(--akui-space-xs, 0.25rem);
		padding: var(--akui-space-s, 0.5rem) 0 0;
		border: none;
		border-top: 1px solid var(--akui-border-input);
		background: transparent;
		color: var(--akui-fg-secondary);
		font: inherit;
		font-size: 0.875rem;
		text-align: left;
		cursor: pointer;
	}

	.akui-wysiwyg-container :global(.tiptap .akui-wysiwyg-completed-toggle::before) {
		content: '';
		width: 0.4em;
		height: 0.4em;
		margin: 0 0.3em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 150ms ease;
	}

	.akui-wysiwyg-container
		:global(.tiptap .akui-wysiwyg-completed-toggle[aria-expanded='false']::before) {
		transform: rotate(-45deg);
	}

	.akui-wysiwyg-container :global(.tiptap .akui-wysiwyg-completed-toggle:hover) {
		color: var(--akui-fg);
	}

	.akui-wysiwyg-container :global(.tiptap .akui-wysiwyg-completed-toggle:focus-visible) {
		outline: 3px solid var(--akui-bg-accent);
		outline-offset: 2px;
	}
</style>
