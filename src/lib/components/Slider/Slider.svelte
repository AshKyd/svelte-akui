<script lang="ts">
	/**
	 * @component Slider
	 * A split-bar slider with a scrubber (`mode="range"`, a native `<input type="range">` underneath
	 * for keyboard, touch and forms) or a read-only progress bar (`mode="progress"`).
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Glow from '../Glow/Glow.svelte';
	import type { SliderColour, SliderSegment } from './types.js';

	export interface Props extends Omit<
		HTMLInputAttributes,
		'value' | 'min' | 'max' | 'step' | 'type' | 'class' | 'disabled' | 'height' | 'size'
	> {
		/** Current value. Bindable in `range` mode. */
		value?: number;
		/** Lowest value. */
		min?: number;
		/** Highest value. */
		max?: number;
		/** Step for the range input. */
		step?: number | 'any';
		/** `range` has a draggable scrubber; `progress` is a read-only bar. */
		mode?: 'range' | 'progress';
		/** Bar thickness. A number is px; a string is any CSS length. */
		height?: number | string;
		/** Default fill colour, and the colour of any segment without its own. */
		colour?: SliderColour;
		/** Splits the bar into separate coloured stages. Each ends at `to`; the last runs to `max`. */
		segments?: SliderSegment[];
		/** Turns the bar into a loader: the scrubber fades out and the fill becomes a candy cane. */
		loading?: boolean;
		/** Thins and dims the bar and blocks input. */
		disabled?: boolean;
		/** Accessible name. */
		label?: string;
		/** Accessible text for the value, e.g. "1:32 of 4:10". */
		valueText?: string;
		/** Removes the gaps between segments so they read as one bar. Only the outer ends and the split are rounded. */
		joined?: boolean;
		/** Replaces the scrubber's face. It is centred on the scrubber, which keeps its position, bounce and fade. */
		thumb?: Snippet<[ThumbState]>;
		/** `circle` is a round handle; `rect` is a tall, narrow handle with lightly rounded corners. */
		thumbShape?: 'circle' | 'rect';
		/** Scrubber height (and width, for `circle`). A number is px; a string is any CSS length. Defaults to a size based on `height`. */
		thumbSize?: number | string;
		/** Additional CSS classes for the container. */
		class?: string;
	}

	/** What a custom `thumb` snippet is given. */
	export interface ThumbState {
		/** Current value. */
		value: number;
		/** Position along the bar, 0 to 1. */
		fraction: number;
		/** CSS colour of the segment the value is in. */
		colour: string;
		loading: boolean;
		disabled: boolean;
	}

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		mode = 'range',
		height = 6,
		colour = 'accent',
		segments = [],
		loading = false,
		disabled = false,
		label,
		valueText,
		joined = false,
		thumb,
		thumbSize,
		thumbShape = 'circle',
		class: className = '',
		...rest
	}: Props = $props();

	const isRange = $derived(mode === 'range');
	const barHeight = $derived(typeof height === 'number' ? `${height}px` : height);

	/** Position of a value along the bar, 0 to 1. */
	const toFraction = (amount: number) => {
		const span = max - min;
		if (span <= 0) return 0;
		return Math.min(Math.max((amount - min) / span, 0), 1);
	};
	const valueFraction = $derived(toFraction(value));

	const colourToCss = (name: SliderColour) =>
		name === 'accent' ? 'var(--akui-bg-accent)' : `var(--akui-color-${name}-solid)`;

	/**
	 * Bar x-position (CSS) for a fraction. In range mode the scrubber's centre never reaches the ends
	 * of the bar, it stops half a thumb in, exactly as the native input places its thumb. Mapping every
	 * segment edge through the same formula keeps fills, gaps and thumb lined up. `--tw` is the thumb
	 * width in range mode and 0 in progress mode.
	 */
	const barX = (fraction: number) => `(var(--tw) / 2 + ${fraction} * (100cqw - var(--tw)))`;

	/** Segments with their CSS edges. With none given, one segment spans the whole bar. */
	const layout = $derived.by(() => {
		const stages = segments.length ? segments : [{ to: max } satisfies SliderSegment];
		return stages.map((stage, index) => {
			const isFirst = index === 0;
			const isLast = index === stages.length - 1;
			const startFraction = isFirst ? 0 : toFraction(stages[index - 1].to);
			const endFraction = isLast ? 1 : toFraction(stage.to);
			return {
				label: stage.label,
				isFirst,
				isLast,
				endFraction,
				colour: colourToCss(stage.colour ?? colour),
				// Interior edges sit half the segment gap back from their boundary, so neighbours leave a gap.
				left: isFirst ? '0px' : `calc(${barX(startFraction)} + var(--seg-gap) / 2)`,
				right: isLast ? '100cqw' : `calc(${barX(endFraction)} - var(--seg-gap) / 2)`
			};
		});
	});

	/** The segment the value sits in; its colour tints the scrubber. */
	const activeColour = $derived(
		(layout.find((segment) => valueFraction <= segment.endFraction) ?? layout.at(-1))?.colour ??
			colourToCss(colour)
	);

	/**
	 * Corner radii for a segment's fill and track. Apart, every end is round. Joined, interior edges
	 * are square so neighbours meet flush; the ends the scrubber cuts stay round: the fill's right end
	 * in the segment holding the value, and that segment's track start (range mode only).
	 */
	const cornerRadii = (segment: (typeof layout)[number], index: number) => {
		const round = '100vw';
		const corners = (left: string, right: string) => `${left} ${right} ${right} ${left}`;
		if (!joined) return { fill: corners(round, round), track: corners(round, round) };
		const isActive = index === activeIndex;
		return {
			fill: corners(segment.isFirst ? round : '0', segment.isLast || isActive ? round : '0'),
			track: corners(
				segment.isFirst || (isActive && isRange) ? round : '0',
				segment.isLast ? round : '0'
			)
		};
	};

	let dragging = $state(false);

	// ── Segment-change bounce ──────────────────────────────────────────────────
	// Crossing into a new segment gives the scrubber a small scale bounce, like a detent clicking.

	const activeIndex = $derived(
		Math.max(
			0,
			layout.findIndex((segment) => valueFraction <= segment.endFraction)
		)
	);
	let thumbEl = $state<HTMLDivElement>();
	/** Starts at the initial segment on purpose, so first render doesn't bounce. */
	// svelte-ignore state_referenced_locally
	let previousIndex = activeIndex;

	$effect(() => {
		const index = activeIndex;
		if (index === previousIndex) return;
		previousIndex = index;
		if (loading || disabled || !thumbEl) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (document.documentElement.dataset.reducedMotion === 'true') return;
		// Animates the individual `scale` property, which stacks on the thumb's own `transform` scale.
		thumbEl.animate([{ scale: 1 }, { scale: 1.1 }, { scale: 1 }], {
			duration: 150,
			easing: 'ease-out'
		});
	});
</script>

<svelte:window
	onpointerup={() => (dragging = false)}
	onpointercancel={() => (dragging = false)}
/>

<div
	class="akui-slider {mode} {className}"
	class:disabled
	class:loading
	class:dragging
	class:joined
	class:rect={thumbShape === 'rect'}
	role={isRange ? undefined : 'progressbar'}
	aria-label={isRange ? undefined : label}
	aria-valuenow={isRange ? undefined : value}
	aria-valuemin={isRange ? undefined : min}
	aria-valuemax={isRange ? undefined : max}
	aria-valuetext={isRange ? undefined : valueText}
	aria-busy={loading || undefined}
	style="--h: {barHeight};{thumbSize === undefined
		? ''
		: ` --thumb: ${typeof thumbSize === 'number' ? `${thumbSize}px` : thumbSize};`}"
	onpointerdown={() => (dragging = isRange && !disabled && !loading)}
>
	<!-- Not the container itself: `--c` is a registered length, and `cqw` must resolve against the container above it. -->
	<div class="surface" style="--f: {valueFraction}; --thumb-colour: {activeColour};">
	<div class="bar">
		{#each layout as segment, index (index)}
			<!-- `display: contents` lets each piece position itself against the bar while sharing the segment's edges. -->
			{@const radii = cornerRadii(segment, index)}
			<div
				class="segment"
				style="--seg-left: {segment.left}; --seg-right: {segment.right}; --seg-colour: {segment.colour}; --fill-radius: {radii.fill}; --track-radius: {radii.track};"
			>
				<div class="track" title={segment.label}><Glow inset /></div>
				<div class="fill"><Glow /></div>
			</div>
		{/each}
	</div>

	{#if isRange}
		<div class="thumb" class:custom={!!thumb} bind:this={thumbEl}>
			{#if thumb}
				{@render thumb({ value, fraction: valueFraction, colour: activeColour, loading, disabled })}
			{:else}
				<Glow />
			{/if}
		</div>
		<input
			type="range"
			class="input bespoke"
			bind:value
			{min}
			{max}
			{step}
			disabled={disabled}
			tabindex={loading ? -1 : undefined}
			aria-label={label}
			aria-valuetext={valueText}
			aria-busy={loading || undefined}
			{...rest}
		/>
	{/if}
	</div>
</div>

<style>
	/*
	 * The value's fraction is animated, not each piece's width. Every fill, track edge and the
	 * scrubber derive from `--f` (via `--c`), so one tween sweeps across all segments in order.
	 * Registering the properties is what lets the browser interpolate them. `--f` is a plain
	 * number, not a length, so resizing the bar never triggers a tween (and neither does first render).
	 */
	@property --f {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	@property --split {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.akui-slider {
		/* Container so `cqw` in the segment maths means "the bar's width". */
		container-type: inline-size;
		position: relative;
		width: 100%;
		/* Scrubber width: grows with the bar so a thick bar still gets a proportionate handle. */
		--thumb: max(16px, calc(var(--h) * 2 + 6px));
		/* Scrubber width: the same as its height for a circle, a narrow bar for `rect`. */
		--thumb-w: var(--thumb);
		--thumb-radius: 50%;
		--thumb-gap: 4px;
		--seg-gap: 3px;
		--bar-h: var(--h);
		height: var(--thumb);
		min-width: 0;
	}

	.akui-slider.rect {
		--thumb-w: max(6px, calc(var(--thumb) * 0.4));
		--thumb-radius: 3px;
	}

	.akui-slider.joined {
		--seg-gap: 0px;
	}

	.surface {
		position: relative;
		width: 100%;
		height: 100%;
		/** 1 when the bar is split around the scrubber; 0 when it is one continuous bar. */
		--split: 1;
		transition:
			--f 0.25s ease-out,
			--split 0.25s ease;
		/* The value's x-position; `cqw` resolves where this is used. */
		--c: calc(var(--tw) / 2 + var(--f) * (100cqw - var(--tw)));
	}

	.range .surface {
		--tw: var(--thumb-w);
		/* Where the filled part stops and the empty part starts, either side of the scrubber. */
		--fill-to: calc(var(--c) - (var(--tw) / 2 + var(--thumb-gap)) * var(--split));
		--track-from: calc((var(--c) + (var(--tw) / 2 + var(--thumb-gap))) * var(--split));
	}

	.progress {
		height: var(--bar-h);
	}

	.progress .surface {
		--tw: 0px;
		--fill-to: var(--c);
		--track-from: 0px;
	}

	.loading .surface {
		--split: 0;
	}

	/* Following the pointer must be instant. */
	.dragging .surface {
		transition: none;
	}

	.akui-slider.disabled {
		--bar-h: calc(var(--h) * 0.5);
		cursor: not-allowed;
	}

	.bar {
		position: absolute;
		inset-inline: 0;
		top: calc(50% - var(--bar-h) / 2);
		height: var(--bar-h);
	}

	/* ── Pieces ──────────────────────────────────────────────────────────────── */

	.segment {
		display: contents;
	}

	.track,
	.fill {
		position: absolute;
		top: 0;
		height: 100%;
	}

	.track {
		border-radius: var(--track-radius);
		background-color: var(--akui-bg-secondary);
		left: max(var(--seg-left), var(--track-from));
		width: max(0px, calc(var(--seg-right) - max(var(--seg-left), var(--track-from))));
	}

	.fill {
		border-radius: var(--fill-radius);
		background-color: var(--seg-colour);
		left: var(--seg-left);
		width: max(0px, calc(min(var(--seg-right), var(--fill-to)) - var(--seg-left)));
	}

	.disabled .track {
		opacity: 0.6;
	}

	.disabled .fill {
		opacity: 0.45;
		filter: saturate(0.5);
	}

	/* ── Scrubber ────────────────────────────────────────────────────────────── */

	.thumb {
		position: absolute;
		top: 50%;
		left: var(--c);
		width: var(--thumb-w);
		height: var(--thumb);
		border-radius: var(--thumb-radius);
		background-color: var(--thumb-colour);
		pointer-events: none;
		transform: translate(-50%, -50%) scale(var(--thumb-scale, 1));
		transition:
			/* Same length as the segment-change bounce (150ms in the script). */
			background-color 0.15s ease-out,
			transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1),
			opacity 0.25s ease;
	}

	/* A custom face draws itself: no colour or glow, just centred content. */
	.thumb.custom {
		display: grid;
		place-items: center;
		background-color: transparent;
	}

	/* Zoom out and fade while loading. */
	.loading .thumb {
		--thumb-scale: 0;
		opacity: 0;
	}

	.disabled .thumb {
		--thumb-scale: 0.6;
		opacity: 0.55;
		filter: saturate(0.5);
	}

	.akui-slider:not(.disabled):not(.loading):has(.input:active) .thumb {
		--thumb-scale: 1.12;
	}

	.akui-slider:has(.input:focus-visible) .thumb {
		outline: 3px solid var(--akui-bg-accent-focus);
		outline-offset: 2px;
	}

	/* ── Native input ────────────────────────────────────────────────────────── */

	/* Invisible but on top, so pointer, touch and keyboard use stay native. */
	.input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		opacity: 0;
		appearance: none;
		background: transparent;
		cursor: pointer;
		z-index: 11;
		/* Horizontal drags move the scrubber; vertical swipes still scroll. */
		touch-action: pan-y;
	}

	.input:disabled {
		cursor: not-allowed;
	}

	.loading .input {
		pointer-events: none;
	}

	/* The native thumb must match `--thumb` so the input's drag range matches the drawn scrubber. */
	.input::-webkit-slider-thumb {
		appearance: none;
		width: var(--thumb-w);
		height: var(--thumb);
	}

	.input::-moz-range-thumb {
		width: var(--thumb-w);
		height: var(--thumb);
		border: 0;
	}

	/* ── Loading: candy cane ─────────────────────────────────────────────────── */

	.loading .fill {
		background-image: linear-gradient(
			135deg,
			rgb(255 255 255 / 0.5) 25%,
			transparent 25%,
			transparent 50%,
			rgb(255 255 255 / 0.5) 50%,
			rgb(255 255 255 / 0.5) 75%,
			transparent 75%
		);
		/* Soft-light shifts the fill's own tone rather than painting white over it, so the stripes stay tinted. */
		background-blend-mode: soft-light;
		background-size: 16px 16px;
		animation: akui-slider-candy-cane 0.6s linear infinite;
	}

	/* One tile across: the stripes line up again, so the loop is seamless. */
	@keyframes akui-slider-candy-cane {
		to {
			background-position-x: 16px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading .fill {
			animation: none;
		}
	}

	:global(html[data-reduced-motion='true']) .loading .fill {
		animation: none;
	}
</style>
