<script lang="ts">
	import { marked } from 'marked';

	interface Props {
		/** The markdown string content to render. */
		content: string;
		/** Additional CSS classes to apply to the wrapper. */
		class?: string;
	}

	let { content = '', class: className = '' }: Props = $props();

	// Derived HTML compiled from markdown
	const html = $derived.by(() => {
		try {
			return marked.parse(content) as string;
		} catch (e) {
			console.error('Failed to parse markdown', e);
			return content;
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
