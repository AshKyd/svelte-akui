<script lang="ts">
  /**
   * @component Slider
   * A split-bar slider with a scrubber (`mode="range"`, a native `<input type="range">` underneath
   * for keyboard, touch and forms) or a read-only progress bar (`mode="progress"`).
   */
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import Glow from "../Glow/Glow.svelte";
  import type { SliderFillColour, SliderSegment, SliderTick } from "./types.js";

  export interface Props extends Omit<
    HTMLInputAttributes,
    | "value"
    | "min"
    | "max"
    | "step"
    | "type"
    | "class"
    | "disabled"
    | "height"
    | "size"
  > {
    /** Current value. Bindable in `range` mode. */
    value?: number;
    /** Lowest value. */
    min?: number;
    /** Highest value. */
    max?: number;
    /** Step for the range input. */
    step?: number | "any";
    /** `range` has a draggable scrubber; `progress` is a read-only bar. */
    mode?: "range" | "progress";
    /** Bar thickness. A number is px; a string is any CSS length. */
    height?: number | string;
    /** Fill colour before the value, and for any segment without its own. `none` leaves it empty track. */
    colour?: SliderFillColour;
    /**
     * Fill colour after the value. Default `none` (empty track). For a ratio of two things set a
     * different colour on each side; set both the same for an all-one-colour bar; set both `none`
     * for an all-empty track with just the scrubber. `segment` keeps every segment in its own
     * colour on both sides, so the whole bar shows all the stages.
     */
    afterColour?: SliderFillColour | "segment";
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
    /** Tick marks under the bar. A number is an unlabelled tick; `{ value, label }` adds a label. */
    ticks?: (number | SliderTick)[];
    /** Adds an unlabelled tick every this many units from `min`. `ticks` can relabel any of them. */
    tickStep?: number;
    /** `edges` left-aligns the first tick label and right-aligns the last so they stay inside the slider; `centre` centres every label under its mark. */
    tickLabelAlign?: "edges" | "centre";
    /** Snaps the value to the nearest tick (from `ticks` or `tickStep`). The arrow, Home and End keys jump tick to tick. */
    snap?: boolean;
    /** `circle` is a round handle; `rect` is a tall, narrow handle with lightly rounded corners. */
    thumbShape?: "circle" | "rect";
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
    mode = "range",
    height = 6,
    colour = "accent",
    afterColour = "none",
    segments = [],
    loading = false,
    disabled = false,
    label,
    valueText,
    joined = false,
    thumb,
    thumbSize,
    thumbShape = "circle",
    ticks = [],
    tickStep,
    tickLabelAlign = "edges",
    snap = false,
    oninput,
    onkeydown,
    class: className = "",
    ...rest
  }: Props = $props();

  const isRange = $derived(mode === "range");
  const barHeight = $derived(
    typeof height === "number" ? `${height}px` : height,
  );

  /** Position of a value along the bar, 0 to 1. */
  const toFraction = (amount: number) => {
    const span = max - min;
    if (span <= 0) return 0;
    return Math.min(Math.max((amount - min) / span, 0), 1);
  };
  const valueFraction = $derived(toFraction(value));

  /** CSS colour for a fill, or undefined for `none` (nothing is drawn). */
  const colourToCss = (name: SliderFillColour) => {
    if (name === "none") return undefined;
    return name === "accent"
      ? "var(--akui-bg-accent)"
      : `var(--akui-color-${name}-solid)`;
  };
  const afterColourCss = $derived(
    afterColour === "segment" ? undefined : colourToCss(afterColour),
  );

  /**
   * Bar x-position (CSS) for a fraction. In range mode the scrubber's centre never reaches the ends
   * of the bar, it stops half a thumb in, exactly as the native input places its thumb. Mapping every
   * segment edge through the same formula keeps fills, gaps and thumb lined up. `--tw` is the thumb
   * width in range mode and 0 in progress mode.
   */
  const barX = (fraction: number) =>
    `(var(--tw) / 2 + ${fraction} * (100cqw - var(--tw)))`;

  /** Segments with their CSS edges. With none given, one segment spans the whole bar. */
  const layout = $derived.by(() => {
    const stages = segments.length
      ? segments
      : [{ to: max } satisfies SliderSegment];
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
        left: isFirst
          ? "0px"
          : `calc(${barX(startFraction)} + var(--seg-gap) / 2)`,
        right: isLast
          ? "100cqw"
          : `calc(${barX(endFraction)} - var(--seg-gap) / 2)`,
      };
    });
  });

  /** The segment the value sits in; its colour tints the scrubber. Accent when that segment has no fill. */
  const activeColour = $derived(
    (
      layout.find((segment) => valueFraction <= segment.endFraction) ??
      layout.at(-1)
    )?.colour ?? "var(--akui-bg-accent)",
  );

  /**
   * Corner radii for a segment's fill and track. Apart, every end is round. Joined, interior edges
   * are square so neighbours meet flush; the ends the scrubber cuts stay round: the fill's right end
   * in the segment holding the value, and that segment's track start (range mode only).
   */
  const cornerRadii = (segment: (typeof layout)[number], index: number) => {
    const round = "100vw";
    const corners = (left: string, right: string) =>
      `${left} ${right} ${right} ${left}`;
    if (!joined)
      return { fill: corners(round, round), track: corners(round, round) };
    const isActive = index === activeIndex;
    return {
      fill: corners(
        segment.isFirst ? round : "0",
        segment.isLast || isActive ? round : "0",
      ),
      track: corners(
        segment.isFirst || (isActive && isRange) ? round : "0",
        segment.isLast ? round : "0",
      ),
    };
  };

  // ── Ticks ──────────────────────────────────────────────────────────────────

  /** Explicit ticks win over generated ones at the same value, so a `tickStep` row can be relabelled. */
  const tickList = $derived.by(() => {
    const generated =
      tickStep && tickStep > 0
        ? Array.from(
            { length: Math.floor((max - min) / tickStep) + 1 },
            (_, index) => ({
              value: min + index * tickStep,
            }),
          )
        : [];
    const explicit = ticks.map((tick) =>
      typeof tick === "number" ? { value: tick } : tick,
    );
    const byValue = new Map<number, SliderTick>(
      [...generated, ...explicit].map((tick) => [tick.value, tick]),
    );
    return [...byValue.values()];
  });
  const firstTickValue = $derived(
    Math.min(...tickList.map((tick) => tick.value)),
  );
  const lastTickValue = $derived(
    Math.max(...tickList.map((tick) => tick.value)),
  );
  /** Edge alignment needs two or more ticks; with one, "first" and "last" are the same label. */
  const alignTickEdges = $derived(
    tickLabelAlign === "edges" && tickList.length > 1,
  );
  const hasTickLabels = $derived(
    tickList.some((tick) => tick.label !== undefined),
  );

  // ── Snapping ───────────────────────────────────────────────────────────────
  // The native input only knows a regular `step`, so snapping to irregular ticks is done here.

  /** Tick values inside the range, ascending. */
  const snapPoints = $derived(
    tickList
      .map((tick) => tick.value)
      .filter((tickValue) => tickValue >= min && tickValue <= max)
      .sort((first, second) => first - second),
  );
  const isSnapping = $derived(snap && snapPoints.length > 0);

  const nearestSnapPoint = (target: number) =>
    snapPoints.reduce((best, point) =>
      Math.abs(point - target) < Math.abs(best - target) ? point : best,
    );

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    if (isSnapping) {
      const snapped = nearestSnapPoint(event.currentTarget.valueAsNumber);
      event.currentTarget.value = String(snapped);
      value = snapped;
    }
    oninput?.(event);
  }

  /** Arrow keys on a snapping slider move one tick, since a native step would land back on the same tick. */
  function handleKeydown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement },
  ) {
    onkeydown?.(event);
    if (!isSnapping || event.defaultPrevented) return;
    const direction = {
      ArrowRight: 1,
      ArrowUp: 1,
      PageUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageDown: -1,
    }[event.key];
    const target =
      event.key === "Home"
        ? snapPoints[0]
        : event.key === "End"
          ? snapPoints.at(-1)
          : direction === undefined
            ? undefined
            : direction > 0
              ? snapPoints.find((point) => point > value)
              : snapPoints.findLast((point) => point < value);
    const handled =
      ["Home", "End"].includes(event.key) || direction !== undefined;
    if (!handled) return;
    event.preventDefault();
    if (target === undefined) return;
    event.currentTarget.value = String(target);
    value = target;
    // Keeps listeners (forms, `oninput`) in the loop, as a native key press would.
    event.currentTarget.dispatchEvent(new Event("change", { bubbles: true }));
  }

  let dragging = $state(false);

  // ── Segment-change bounce ──────────────────────────────────────────────────
  // Crossing into a new segment gives the scrubber a small scale bounce, like a detent clicking.

  const activeIndex = $derived(
    Math.max(
      0,
      layout.findIndex((segment) => valueFraction <= segment.endFraction),
    ),
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
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.reducedMotion === "true") return;
    // Animates the individual `scale` property, which stacks on the thumb's own `transform` scale.
    thumbEl.animate([{ scale: 1 }, { scale: 1.1 }, { scale: 1 }], {
      duration: 150,
      easing: "ease-out",
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
  class:snapping={isSnapping}
  class:rect={thumbShape === "rect"}
  role={isRange ? undefined : "progressbar"}
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
  <div
    class="surface"
    style="--f: {valueFraction}; --thumb-colour: {activeColour};"
  >
    <div class="bar">
      {#each layout as segment, index (index)}
        <!-- `display: contents` lets each piece position itself against the bar while sharing the segment's edges. -->
        {@const radii = cornerRadii(segment, index)}
        {@const afterCss =
          afterColour === "segment" ? segment.colour : afterColourCss}
        <div
          class="segment"
          style="--seg-left: {segment.left}; --seg-right: {segment.right}; --seg-colour: {segment.colour}; --after-colour: {afterCss}; --fill-radius: {radii.fill}; --track-radius: {radii.track};"
        >
          <div class="track" title={segment.label}><Glow inset /></div>
          {#if afterCss}
            <!-- Same shape as the track: the part after the value, coloured instead of empty. -->
            <div class="after"><Glow /></div>
          {/if}
          {#if segment.colour}
            <div class="fill"><Glow /></div>
          {:else}
            <!-- No fill colour: the part before the value is empty track too, so the bar has no hole. -->
            <div class="fill empty"><Glow inset /></div>
          {/if}
        </div>
      {/each}
    </div>

    {#if isRange}
      <div class="thumb" class:custom={!!thumb} bind:this={thumbEl}>
        {#if thumb}
          {@render thumb({
            value,
            fraction: valueFraction,
            colour: activeColour,
            loading,
            disabled,
          })}
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
        {disabled}
        tabindex={loading ? -1 : undefined}
        aria-label={label}
        aria-valuetext={valueText}
        aria-busy={loading || undefined}
        oninput={handleInput}
        onkeydown={handleKeydown}
        {...rest}
      />
    {/if}
  </div>

  {#if tickList.length}
    <!-- Decorative: the value is already exposed by the input or progressbar. -->
    <div class="ticks" class:labelled={hasTickLabels} aria-hidden="true">
      {#each tickList as tick (tick.value)}
        <div
          class="tick"
          class:first={alignTickEdges && tick.value === firstTickValue}
          class:last={alignTickEdges && tick.value === lastTickValue}
          style="--tick-x: calc{barX(toFraction(tick.value))};"
        >
          <span class="tick-mark"></span>
          {#if tick.label !== undefined}<span class="tick-label"
              >{tick.label}</span
            >{/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /*
	 * The value's fraction is animated, not each piece's width. Every fill, track edge and the
	 * scrubber derive from `--f` (via `--c`), so one tween sweeps across all segments in order.
	 * Registering the properties is what lets the browser interpolate them. `--f` is a plain
	 * number, not a length, so resizing the bar never triggers a tween (and neither does first render).
	 */
  @property --f {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
  }

  @property --split {
    syntax: "<number>";
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
    min-width: 0;
  }

  /* Thumb width in range mode, none in progress mode. On the root so the tick row can use it too. */
  .akui-slider.range {
    --tw: var(--thumb-w);
  }

  .akui-slider.progress {
    --tw: 0px;
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
    height: var(--thumb);
    /** 1 when the bar is split around the scrubber; 0 when it is one continuous bar. */
    --split: 1;
    transition:
      --f 0.25s ease-out,
      --split 0.25s ease;
    /* The value's x-position; `cqw` resolves where this is used. */
    --c: calc(var(--tw) / 2 + var(--f) * (100cqw - var(--tw)));
  }

  .range .surface {
    /* Where the filled part stops and the empty part starts, either side of the scrubber. */
    --fill-to: calc(
      var(--c) - (var(--tw) / 2 + var(--thumb-gap)) * var(--split)
    );
    --track-from: calc(
      (var(--c) + (var(--tw) / 2 + var(--thumb-gap))) * var(--split)
    );
  }

  .progress .surface {
    height: var(--bar-h);
    --fill-to: var(--c);
    --track-from: 0px;
  }

  .loading .surface {
    --split: 0;
  }

  /* ── Ticks ───────────────────────────────────────────────────────────────── */

  .ticks {
    position: relative;
    height: 6px;
    margin-top: 2px;
  }

  .ticks.labelled {
    height: calc(6px + 1.3em);
    font-size: 0.75rem;
  }

  /* Zero-width anchor at the tick's x-position; the mark and label hang off it. */
  .tick {
    position: absolute;
    top: 0;
    left: var(--tick-x);
    width: 0;
    color: var(--akui-fg-secondary);
  }

  .tick-mark {
    position: absolute;
    top: 0;
    left: -0.5px;
    width: 1px;
    height: 4px;
    background-color: currentColor;
    opacity: 0.6;
  }

  /* Centred under its mark. */
  .tick-label {
    position: absolute;
    top: 6px;
    left: 0;
    white-space: nowrap;
    line-height: 1.2;
    translate: -50% 0;
  }

  /*
	 * With `tickLabelAlign="edges"` the first label sits flush with the slider's left edge and the
	 * last flush with its right edge, so they can't overflow. The marks stay on their ticks.
	 */
  .tick.first .tick-label {
    left: calc(-1 * var(--tick-x));
    translate: none;
  }

  .tick.last .tick-label {
    left: auto;
    right: calc(var(--tick-x) - 100cqw);
    translate: none;
  }

  .disabled .ticks {
    opacity: 0.5;
  }

  /* Following the pointer must be instant, unless snapping: then the scrubber glides tick to tick. */
  .dragging:not(.snapping) .surface {
    transition: none;
  }

  /* A shorter glide while snapping, so the scrubber keeps up with the pointer. */
  .dragging.snapping .surface {
    transition:
      --f 0.1s ease-out,
      --split 0.25s ease;
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
  .after,
  .fill {
    position: absolute;
    top: 0;
    height: 100%;
  }

  /* `.after` covers the same span as the track, so the empty side can be coloured instead. */
  .track,
  .after {
    border-radius: var(--track-radius);
    left: max(var(--seg-left), var(--track-from));
    width: max(
      0px,
      calc(var(--seg-right) - max(var(--seg-left), var(--track-from)))
    );
  }

  .track {
    background-color: var(--akui-bg-secondary);
  }

  .after {
    background-color: var(--after-colour);
  }

  .fill {
    border-radius: var(--fill-radius);
    background-color: var(--seg-colour);
    left: var(--seg-left);
    width: max(
      0px,
      calc(min(var(--seg-right), var(--fill-to)) - var(--seg-left))
    );
  }

  .fill.empty {
    background-color: var(--akui-bg-secondary);
  }

  .disabled .track,
  .disabled .fill.empty {
    opacity: 0.6;
  }

  .disabled .fill:not(.empty),
  .disabled .after {
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

  .loading .fill:not(.empty),
  .loading .after {
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
    .loading .fill,
    .loading .after {
      animation: none;
    }
  }

  :global(html[data-reduced-motion="true"]) .loading .fill,
  :global(html[data-reduced-motion="true"]) .loading .after {
    animation: none;
  }
</style>
