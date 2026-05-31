<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Snippet containing the elements to style and format */
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="reader-typography">
	{@render children?.()}
</div>

<style>
	.reader-typography {
		font-size: 1.15rem;
		line-height: 1.85;
		word-break: break-word;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		font-family: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
		letter-spacing: 0.01em;
	}

	/* Spacing for layout elements */
	.reader-typography :global(p),
	.reader-typography :global(div),
	.reader-typography :global(ul),
	.reader-typography :global(ol),
	.reader-typography :global(figure),
	.reader-typography :global(table),
	.reader-typography :global(pre) {
		margin: 0;
	}

	.reader-typography :global(h1),
	.reader-typography :global(h2),
	.reader-typography :global(h3),
	.reader-typography :global(h4),
	.reader-typography :global(h5),
	.reader-typography :global(h6) {
		font-family: sans-serif;
		text-wrap: balance;
		margin-top: 1.5rem;
		margin-bottom: -0.25rem;
		line-height: 1.3;
		font-weight: 700;
		color: var(--akui-fg);
	}

	.reader-typography :global(h1),
	.reader-typography :global(h2) {
		border-bottom: 1px solid var(--akui-border-input, rgba(0, 0, 0, 0.1));
		padding-bottom: 0.5rem;
	}

	.reader-typography :global(h1) { font-size: 2.25rem; }
	.reader-typography :global(h2) { font-size: 1.875rem; }
	.reader-typography :global(h3) { font-size: 1.5rem; }
	.reader-typography :global(h4) { font-size: 1.25rem; }

	@media (max-width: 640px) {
		.reader-typography :global(h1) { font-size: 1.875rem; }
		.reader-typography :global(h2) { font-size: 1.50rem; }
		.reader-typography :global(h3) { font-size: 1.25rem; }
	}

	.reader-typography :global(li) {
		margin-bottom: 0.5rem;
		padding-left: 0.25rem;
	}

	/* Support nested paragraphs in list items (listicles) */
	.reader-typography :global(li > p),
	.reader-typography :global(li > div) {
		margin: 0;
	}

	.reader-typography :global(li > p + p),
	.reader-typography :global(li > div + div) {
		margin-top: 0.5rem;
	}

	/* Premium link styles with offset and colour transition */
	.reader-typography :global(a) {
		color: var(--akui-bg-accent, #2563eb);
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-thickness: 1px;
		transition: text-decoration-color 0.2s ease, color 0.2s ease;
	}

	.reader-typography :global(a:hover) {
		color: var(--akui-bg-accent-hover, #1d4ed8);
		text-decoration-thickness: 2px;
	}

	/* Images, videos, iframes with border radius and akui glow */
	.reader-typography :global(img),
	.reader-typography :global(video),
	.reader-typography :global(iframe) {
		max-width: 100%;
		border-radius: var(--akui-radius-m, 8px);
		box-shadow: var(--akui-shadow-shiny, 0 4px 12px rgba(0, 0, 0, 0.08));
	}

	.reader-typography :global(img) {
		height: auto;
		display: block;
		margin: 0 auto;
	}

	.reader-typography :global(video) {
		display: block;
		margin: 0 auto;
		width: 100%;
	}

	/* Responsive 16:9 aspect ratio iframe embeds */
	.reader-typography :global(iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		height: auto;
		border: none;
		display: block;
		margin: 0 auto;
	}

	/* Blockquotes as a vertical stack for multiple paragraphs */
	.reader-typography :global(blockquote) {
		margin: 0.5rem 0;
		padding: 0.5rem 0 0.5rem 1.25rem;
		border-left: 4px solid var(--akui-border-input, #ccc);
		color: var(--akui-fg-secondary);
		font-style: italic;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.reader-typography :global(pre) {
		background: var(--akui-bg-secondary, #f5f5f5);
		border-radius: var(--akui-radius-m, 8px);
		padding: 1.25rem;
		overflow-x: auto;
		font-size: 0.9rem;
	}

	.reader-typography :global(code) {
		font-family: monospace;
		font-size: 0.9em;
		background: var(--akui-bg-secondary, #f5f5f5);
		padding: 0.2em 0.4em;
		border-radius: var(--akui-radius-s, 4px);
	}

	.reader-typography :global(pre code) {
		background: none;
		padding: 0;
	}

	.reader-typography :global(hr) {
		border: none;
		border-top: 1px solid var(--akui-border-input, #e0e0e0);
		margin: 1rem 0;
	}
</style>
