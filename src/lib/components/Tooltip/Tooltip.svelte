<script lang="ts">
	import { type Snippet } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		/** Content to render inside the tooltip. Usually includes a <Padding> component. */
		children: Snippet;
		/** Whether the tooltip is currently visible. */
		visible?: boolean;
		/** Explicit X position. */
		x?: number;
		/** Explicit Y position. */
		y?: number;
		/** Arrow/Popover position relative to the source. */
		position?: 'top' | 'bottom' | 'left' | 'right';
		/** Border radius size ('s', 'm', 'l', etc.). Defaults to 's'. */
		radius?: string;
		/** Additional CSS classes. */
		class?: string;
		/** Style overrides. */
		style?: string;
	}

	let props: Props = $props();

	let tooltipStyle = $derived.by(() => {
		const base = `
			left: ${props.x ?? 0}px;
			top: ${props.y ?? 0}px;
			position: fixed;
			z-index: 10000;
			pointer-events: none;
			transform: ${getTranslate(props.position ?? 'top')};
			transition: transform 0.15s ease;
		`;
		return base + (props.style ?? '');
	});

	function getTranslate(pos: string) {
		switch (pos) {
			case 'top':
				return 'translate(-50%, -100%)';
			case 'bottom':
				return 'translate(-50%, 0)';
			case 'left':
				return 'translate(-100%, -50%)';
			case 'right':
				return 'translate(0, -50%)';
			default:
				return 'translate(-50%, -50%)';
		}
	}

	function flyFromSource(node: HTMLElement, { duration = 150, distance = 10, easing = cubicOut }) {
		const pos = props.position ?? 'top';
		const xSign = pos === 'right' ? -1 : pos === 'left' ? 1 : 0;
		const ySign = pos === 'bottom' ? -1 : pos === 'top' ? 1 : 0;

		return {
			duration,
			easing,
			css: (t: number) => {
				const u = 1 - t;
				const tx = xSign * distance * u;
				const ty = ySign * distance * u;
				return `
					opacity: ${t};
					transform: ${getTranslate(pos)} translate(${tx}px, ${ty}px);
				`;
			}
		};
	}
</script>

{#if props.visible && props.children}
	<div
		transition:flyFromSource={{ duration: 150 }}
		class="akui-tooltip {props.position ?? 'top'} {props.class ?? ''}"
		style="{tooltipStyle}; --akui-tooltip-radius: var(--akui-radius-{props.radius ?? 's'});"
	>
		{@render props.children()}
	</div>
{/if}

<style>
	.akui-tooltip {
		background: rgba(var(--akui-bg-rgb), 0.7);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-radius: var(--akui-tooltip-radius);
		box-shadow:
			var(--akui-shadow-shiny),
			0 4px 12px rgba(0, 0, 0, 0.1);
		color: var(--akui-fg);
		max-width: 300px;
		word-wrap: break-word;
		border: 1px solid rgba(var(--akui-fg-rgb, 0, 0, 0), 0.1);
	}

	/* Dark mode specific tweak if needed, but theme variables should handle it */
	:global([data-theme='dark']) .akui-tooltip {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
