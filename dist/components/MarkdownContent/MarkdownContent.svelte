<script lang="ts">
	import { Marked } from 'marked';
	import { sanitizeHtml } from '../../constants.js';

	interface Props {
		/** The markdown string content to render. */
		content: string;
		/** Additional CSS classes to apply to the wrapper. */
		class?: string;
	}

	let { content = '', class: className = '' }: Props = $props();

	const markedInstance = new Marked();

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
</script>

<div class="akui-markdown-content {className}">
	{@html html}
</div>

<style>
	.akui-markdown-content {
		width: 100%;
		box-sizing: border-box;
	}
</style>
