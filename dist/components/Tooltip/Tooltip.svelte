<script lang="ts">
	import { type Snippet, tick } from 'svelte';
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
		/** Whether the tooltip stays open for interaction. Defaults to false. */
		persistent?: boolean;
		/** How the tooltip is triggered. 'hover' is default. 'click' allows manual toggle. */
		trigger?: 'hover' | 'click';
		/** Additional CSS classes. */
		class?: string;
		/** Style overrides. */
		style?: string;
	}

	let {
		children,
		visible = $bindable(false),
		x = 0,
		y = 0,
		position = 'top',
		radius = 's',
		persistent = false,
		trigger = 'hover',
		class: className = '',
		style: styleOverride = ''
	}: Props = $props();

	let tooltipEl = $state<HTMLElement>();
	let edgeOffsets = $state({ x: 0, y: 0 });

	let tooltipStyle = $derived.by(() => {
		const base = `
			left: ${x}px;
			top: ${y}px;
			position: fixed;
			z-index: 10000;
			pointer-events: ${persistent ? 'auto' : 'none'};
			transform: ${getTranslate(position)} translate(${edgeOffsets.x}px, ${edgeOffsets.y}px);
			transition: transform 0.15s ease;
		`;
		return base + styleOverride;
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

	$effect(() => {
		if (visible && tooltipEl) {
			try {
				tooltipEl.showPopover();
				
				// Calculate clamping offsets after popover is shown
				tick().then(() => {
					if (!tooltipEl) return;
					const rect = tooltipEl.getBoundingClientRect();
					const margin = 20; // 20px padding from screen edge
					const windowWidth = window.innerWidth;
					const windowHeight = window.innerHeight;

					let ox = 0;
					let oy = 0;

					if (rect.left < margin) {
						ox = margin - rect.left;
					} else if (rect.right > windowWidth - margin) {
						ox = windowWidth - margin - rect.right;
					}

					if (rect.top < margin) {
						oy = margin - rect.top;
					} else if (rect.bottom > windowHeight - margin) {
						oy = windowHeight - margin - rect.bottom;
					}

					edgeOffsets = { x: ox, y: oy };
				});
			} catch (e) {
				// Fallback
			}
		} else if (tooltipEl) {
			try {
				tooltipEl.hidePopover();
				edgeOffsets = { x: 0, y: 0 };
			} catch (e) {
				// Fallback
			}
		}
	});

	function handleWindowAction(e: Event) {
		if (!visible || !tooltipEl) return;
		
		if (!tooltipEl.contains(e.target as Node)) {
			if (trigger === 'click') {
				visible = false;
			}
		}
	}

	function flyFromSource(node: HTMLElement, { duration = 150, distance = 10, easing = cubicOut }) {
		const pos = position;
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
					transform: ${getTranslate(pos)} translate(${edgeOffsets.x + tx}px, ${edgeOffsets.y + ty}px);
				`;
			}
		};
	}
</script>

<svelte:window onclick={handleWindowAction} onkeydown={(e) => e.key === 'Escape' && (visible = false)} />

{#if visible && children}
	<div
		bind:this={tooltipEl}
		popover="manual"
		transition:flyFromSource={{ duration: 150 }}
		class="akui-tooltip {position} {className}"
		style="{tooltipStyle}; --akui-tooltip-radius: var(--akui-radius-{radius});"
	>
		{@render children()}
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
		border: 1px solid rgba(var(--akui-fg-rgb, 0, 0, 0), 0.1);
		max-width: 90vw; /* Limit width on mobile */
	}

	:global([data-theme='dark']) .akui-tooltip {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
