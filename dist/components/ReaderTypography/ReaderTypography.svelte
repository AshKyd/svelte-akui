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
		font-family: Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif;
		letter-spacing: 0.01em;
		/* Prevent any child with an inline width (e.g. PDF embeds) from causing
		   a horizontal scrollbar on the page. */
		overflow-x: clip;
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

	.reader-typography :global(h1) {
		font-size: 2.25rem;
	}
	.reader-typography :global(h2) {
		font-size: 1.875rem;
	}
	.reader-typography :global(h3) {
		font-size: 1.5rem;
	}
	.reader-typography :global(h4) {
		font-size: 1.25rem;
	}

	@media (max-width: 640px) {
		.reader-typography :global(h1) {
			font-size: 1.875rem;
		}
		.reader-typography :global(h2) {
			font-size: 1.5rem;
		}
		.reader-typography :global(h3) {
			font-size: 1.25rem;
		}
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
		transition:
			text-decoration-color 0.2s ease,
			color 0.2s ease;
	}

	.reader-typography :global(a:hover) {
		color: var(--akui-bg-accent-hover, #1d4ed8);
		text-decoration-thickness: 2px;
	}

	/* Images, videos, iframes, and figures with border radius and akui glow */
	.reader-typography :global(img),
	.reader-typography :global(video),
	.reader-typography :global(iframe),
	.reader-typography :global(figure) {
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

	/* cite element: attribution line — sans, upright, smaller, em-dash prefix */
	.reader-typography :global(blockquote cite),
	.reader-typography :global(blockquote p:has(cite)) {
		font-style: normal;
		font-family: sans-serif;
		font-size: 0.825rem;
		color: var(--akui-fg-secondary);
		letter-spacing: 0.02em;
		margin-top: -0.25rem;
	}

	.reader-typography :global(blockquote cite)::before {
		content: '— ';
	}

	/* Tables: scroll container on the figure wrapper, clean sans interior */
	.reader-typography :global(figure:has(table)) {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.reader-typography :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-family: sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
		word-break: normal;
	}

	.reader-typography :global(th),
	.reader-typography :global(td) {
		padding: 0.6rem 0.9rem;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--akui-border-input, #d1d5db);
	}

	.reader-typography :global(thead th) {
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--akui-fg-secondary, #4b5563);
		background: var(--akui-bg-secondary, #f3f4f6);
		box-shadow: var(--akui-shadow-shiny);
		border-bottom: 2px solid var(--akui-border-input, #d1d5db);
	}

	.reader-typography :global(tbody tr:last-child td) {
		border-bottom: none;
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

	/* ─── Koenig (Ghost) card styles ──────────────────────────────────────────── */

	/* kg-bookmark-card: link preview card with title, description, meta, thumbnail */

	.reader-typography :global(.kg-bookmark-container) {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas: 'content thumb';
		gap: 1rem;
		padding: 1rem;
		text-decoration: none;
		color: inherit;
		font-family: sans-serif;
		background: var(--akui-bg-secondary, #f3f4f6);
		border-radius: var(--akui-radius-m, 8px);
		box-shadow: var(
			--akui-shadow-shiny,
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			inset 0 -1px 0 rgba(0, 0, 0, 0.05),
			0 1px 2px rgba(0, 0, 0, 0.05)
		);
		transition:
			background 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.1s ease;
		align-items: start;
		/* outline replaced by custom ring; use outline-offset to push it outside */
		outline: 3px solid transparent;
		outline-offset: 2px;
	}

	.reader-typography :global(.kg-bookmark-container:hover) {
		background: var(--akui-bg-hover, rgba(0, 0, 0, 0.05));
		color: inherit;
		text-decoration: none;
		box-shadow:
			var(--akui-glow-top, inset 0 1px 0 rgba(255, 255, 255, 0.4)),
			var(--akui-glow-bottom, inset 0 -1px 0 rgba(0, 0, 0, 0.05)),
			0 4px 12px rgba(0, 0, 0, 0.1);
	}

	/* outline is not clipped by overflow:hidden, so the ring reliably appears */
	.reader-typography :global(.kg-bookmark-container:focus-visible) {
		outline-color: var(--akui-ring-focus, rgba(37, 99, 235, 0.4));
		box-shadow:
			var(--akui-glow-top, inset 0 1px 0 rgba(255, 255, 255, 0.4)),
			var(--akui-glow-bottom, inset 0 -1px 0 rgba(0, 0, 0, 0.05)),
			0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.reader-typography :global(.kg-bookmark-container:active) {
		background: var(--akui-bg-hover, rgba(0, 0, 0, 0.05));
		box-shadow: var(
			--akui-shadow-sunken,
			inset 0 1px 0 rgba(0, 0, 0, 0.05),
			inset 0 -1px 0 rgba(255, 255, 255, 0.4)
		);
		transform: scale(0.995);
	}

	/* Content column: title, description, metadata */
	.reader-typography :global(.kg-bookmark-content) {
		grid-area: content;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;
	}

	.reader-typography :global(.kg-bookmark-title) {
		font-weight: 600;
		font-size: 0.95rem;
		line-height: 1.4;
		color: var(--akui-fg);
	}

	.reader-typography :global(.kg-bookmark-description) {
		font-size: 0.825rem;
		line-height: 1.5;
		color: var(--akui-fg-secondary, #4b5563);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Meta row: favicon icon + author + publisher */
	.reader-typography :global(.kg-bookmark-metadata) {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.75rem;
		color: var(--akui-fg-secondary, #4b5563);
		margin-top: 0.15rem;
		flex-wrap: wrap;
	}

	/* Favicon: constrain to a small inline icon, overriding the general img rules */
	.reader-typography :global(.kg-bookmark-icon) {
		width: 16px !important;
		height: 16px !important;
		max-width: 16px;
		border-radius: 2px;
		box-shadow: none;
		margin: 0;
		flex-shrink: 0;
		object-fit: contain;
		display: inline-block;
		vertical-align: middle;
	}

	.reader-typography :global(.kg-bookmark-author)::after {
		content: '·';
		margin-left: 0.4rem;
	}

	/* Thumbnail column */
	.reader-typography :global(.kg-bookmark-thumbnail) {
		grid-area: thumb;
		width: 120px;
		height: 90px;
		flex-shrink: 0;
		border-radius: var(--akui-radius-s, 4px);
		overflow: hidden;
		box-shadow: none;
		align-self: start;
	}

	.reader-typography :global(.kg-bookmark-thumbnail img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 0;
		box-shadow: none;
		margin: 0;
		display: block;
	}

	@media (max-width: 480px) {
		.reader-typography :global(.kg-bookmark-container) {
			grid-template-columns: 1fr;
			grid-template-areas:
				'thumb'
				'content';
		}

		.reader-typography :global(.kg-bookmark-thumbnail) {
			width: 100%;
			height: 160px;
		}
	}

	/* kg-gallery-card: rows of images with an optional caption */
	.reader-typography :global(.kg-gallery-container) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.reader-typography :global(.kg-gallery-row) {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.reader-typography :global(.kg-gallery-image) {
		flex: 1 1 0;
		min-width: 0;
		overflow: hidden;
		border-radius: var(--akui-radius-s, 4px);
	}

	.reader-typography :global(.kg-gallery-image img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		margin: 0;
		border-radius: 0;
		box-shadow: none;
	}

	/* figcaption: subdued, centred, beneath the figure content */
	.reader-typography :global(figcaption) {
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--akui-fg-secondary, #4b5563);
		text-align: center;
		padding: 0.5rem 0.25rem 0;
		font-style: italic;
		font-family: sans-serif;
	}

	.reader-typography :global(figcaption p) {
		margin: 0;
	}
</style>
