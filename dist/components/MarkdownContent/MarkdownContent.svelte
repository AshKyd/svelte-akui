<script lang="ts">
	import { getAllContexts, mount, unmount, untrack } from 'svelte';
	import { Marked } from 'marked';
	import { sanitizeHtml } from '../../constants.js';
	import CheckboxGraphic from '../Input/Checkbox/CheckboxGraphic.svelte';

	interface Props {
		/** The markdown string content to render. */
		content: string;
		/**
		 * How task-list checkboxes (`- [x]`) are drawn. `native` keeps the browser's disabled
		 * checkbox. `graphic` swaps each for a `CheckboxGraphic`: the same look as `Checkbox`, with
		 * no input behind it. Read when the content changes.
		 */
		checkboxes?: 'native' | 'graphic';
		/** Size of `graphic` checkboxes. Defaults to `small`. */
		checkboxSize?: 'small' | 'medium' | 'large';
		/** Additional CSS classes to apply to the wrapper. */
		class?: string;
	}

	let {
		content = '',
		checkboxes = 'native',
		checkboxSize = 'small',
		class: className = ''
	}: Props = $props();

	const markedInstance = new Marked();
	const context = getAllContexts();

	// Derived HTML compiled from markdown and passed through the central sanitiser
	const html = $derived.by(() => {
		try {
			const compiled = markedInstance.parse(content) as string;
			return sanitizeHtml(compiled);
		} catch (e) {
			console.error('Failed to parse markdown', e);
			return sanitizeHtml(content);
		}
	});

	let container = $state<HTMLElement>();

	/**
	 * Components can't be written into `{@html}`, so for `graphic` checkboxes the rendered inputs are
	 * replaced with mounted components after each render. Only `html` is tracked: the options are
	 * read untracked, because re-running on a size change would find the inputs already replaced.
	 * Each host keeps `data-task-checkbox` so layout CSS can target it in place of the input.
	 */
	$effect(() => {
		html;
		const target = container;
		if (!target || untrack(() => checkboxes) !== 'graphic') return;
		const size = untrack(() => checkboxSize);

		const mounted = [...target.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].map(
			(input) => {
				const host = document.createElement('span');
				host.setAttribute('data-task-checkbox', '');
				input.replaceWith(host);
				return mount(CheckboxGraphic, {
					target: host,
					props: { checked: input.checked, size },
					context
				});
			}
		);

		return () => mounted.forEach((instance) => unmount(instance));
	});
</script>

<div class="akui-markdown-content {className}" bind:this={container}>
	{@html html}
</div>

<style>
	.akui-markdown-content {
		width: 100%;
		box-sizing: border-box;
	}
</style>
