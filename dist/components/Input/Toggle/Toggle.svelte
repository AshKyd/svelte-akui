<script lang="ts">
	/**
	 * @component Toggle
	 * An on/off switch built on a native `<input type="checkbox" role="switch">`, so it submits
	 * with forms, resets and responds to Space like a checkbox while being announced as a switch.
	 */
	import { getContext, type Snippet } from 'svelte';
	import Glow from '../../Glow/Glow.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.js';
	import '../choice.css';

	export interface Props {
		/** Whether the switch is on. */
		checked?: boolean;
		/** Label text. Use `children` instead for rich content. */
		label?: string;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Submitted with the form when on. */
		value?: string;
		/** Form field name. */
		name?: string;
		/** Whether the field is required. */
		required?: boolean;
		/** Whether the field is disabled. */
		disabled?: boolean;
		/** Additional CSS classes for the outer label. */
		class?: string;
		/** Rich label content, shown instead of `label`. */
		children?: Snippet;
		/** Spread remaining attributes to the input element. */
		[key: string]: unknown;
	}

	let {
		checked = $bindable(false),
		label,
		size,
		value,
		name,
		required = false,
		disabled = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const groupContext = getContext<InputGroupContext>(INPUT_GROUP_CONTEXT);
	const effectiveSize = $derived(size ?? groupContext?.size ?? 'medium');

	let inputEl = $state<HTMLInputElement>();
	let boxEl = $state<HTMLSpanElement>();

	/** Focuses the input element. */
	export function focus() {
		inputEl?.focus();
	}

	// ── Dragging the knob ──────────────────────────────────────────────────────
	// The native input stays the source of truth. A drag only decides which way to flip it, then
	// hands the result to the input so `change` events, bindings and forms behave as for a click.

	/** Gap between the thumb and the track's padding edge. Matches `--thumb-inset` in the CSS. */
	const THUMB_INSET = 2;
	/** Pointer travel (px) before a press becomes a drag; below it, it is still a plain click. */
	const DRAG_THRESHOLD = 3;
	/** Thumb length multiplier while dragged. Matches `--thumb-stretch` in the CSS. */
	const THUMB_STRETCH = 1.2;

	let pressed = $state(false);
	let dragging = $state(false);
	/** Keeps the thumb at its snapped position between pointer release and `checked` updating. */
	let settling = $state(false);
	let thumbOffset = $state(0);
	let travel = $state(0);
	/** Furthest the thumb can sit while stretched, so its longer body stays inside the track. */
	let maxDragOffset = 0;
	let pressStartX = 0;
	let pressStartOffset = 0;
	/** Set when a drag ends, so the click the browser fires straight after it is cancelled. */
	let dragJustEnded = false;
	let dropWillBeOn = $state(false);

	/** True briefly after `checked` changes (click, keyboard, drop or code), while the thumb travels. */
	let travelling = $state(false);
	let previousChecked = checked;

	$effect(() => {
		const nowChecked = checked;
		if (nowChecked === previousChecked) return;
		previousChecked = nowChecked;
		travelling = true;
		// Roughly half the thumb's slide, so it stretches out and back within the one move.
		const timer = setTimeout(() => (travelling = false), 150);
		return () => clearTimeout(timer);
	});

	/** Whether the thumb is currently past the halfway mark, i.e. would land "on". */
	const draggedPastHalf = $derived(thumbOffset > travel / 2);

	function handlePointerDown(event: PointerEvent) {
		if (disabled || event.button !== 0 || !inputEl || !boxEl) return;
		// Only the track and knob start a drag, not the label text.
		const target = event.target as Node;
		if (target !== inputEl && !boxEl.contains(target)) return;
		const thumbSize = boxEl.offsetHeight - THUMB_INSET * 2 - 2;
		travel = boxEl.clientWidth - thumbSize - THUMB_INSET * 2;
		maxDragOffset = travel - thumbSize * (THUMB_STRETCH - 1);
		pressStartX = event.clientX;
		pressStartOffset = checked ? travel : 0;
		dragJustEnded = false;
		pressed = true;
		// Capture on the label so the drag keeps tracking when the pointer leaves the track.
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!pressed) return;
		const deltaX = event.clientX - pressStartX;
		if (!dragging && Math.abs(deltaX) < DRAG_THRESHOLD) return;
		dragging = true;
		thumbOffset = Math.min(maxDragOffset, Math.max(0, pressStartOffset + deltaX));
	}

	function handlePointerUp() {
		if (!pressed) return;
		pressed = false;
		if (!dragging) return;
		dragging = false;
		dropWillBeOn = draggedPastHalf;
		// Snap the thumb to its end so it doesn't spring back while `checked` updates. The "on" end
		// leaves room for the still-stretched thumb, matching the CSS rest position while stretching.
		thumbOffset = dropWillBeOn ? maxDragOffset : 0;
		settling = true;

		// Apply the drop straight away, as a normal change. Don't wait for the click: some browsers
		// don't fire one after a drag.
		if (inputEl && inputEl.checked !== dropWillBeOn) {
			inputEl.checked = dropWillBeOn;
			inputEl.dispatchEvent(new Event('input', { bubbles: true }));
			inputEl.dispatchEvent(new Event('change', { bubbles: true }));
		}
		settling = false;

		// If a click does follow, it is swallowed below. Expire the flag in case none comes.
		dragJustEnded = true;
		setTimeout(() => (dragJustEnded = false), 100);
	}

	function handlePointerCancel() {
		pressed = false;
		dragging = false;
		settling = false;
	}

	/**
	 * A drag can still end in a click, which would flip the switch again. Cancelling it makes the
	 * browser restore the value the drop just set. Handled on the label so it also catches clicks
	 * that land on the track or knob and reach the input through label activation.
	 */
	function handleClick(event: MouseEvent) {
		if (!dragJustEnded) return;
		dragJustEnded = false;
		event.preventDefault();
	}

	const thumbStyle = $derived(
		dragging || settling
			? `transform: translateX(${thumbOffset}px); background-color: ${
					(dragging ? draggedPastHalf : dropWillBeOn) ? '#fff' : 'var(--akui-fg-secondary)'
				};${dragging ? ' transition: none;' : ''}`
			: undefined
	);
	const dragState = $derived(dragging ? (draggedPastHalf ? 'on' : 'off') : undefined);
</script>

<!--
	Pointer handlers sit on the label, not the input: events from anywhere on the track or knob
	bubble here, so the drag doesn't depend on which element is under the pointer.
-->
<!-- The click only cancels the click that follows a drag; keyboard use goes through the input. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
<label
	class="akui-choice toggle {effectiveSize} {className}"
	class:disabled
	class:dragging
	class:travelling
	data-drag={dragState}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onclick={handleClick}
>
	<input
		bind:this={inputEl}
		bind:checked
		type="checkbox"
		role="switch"
		class="akui-choice-input bespoke"
		{value}
		{name}
		{required}
		{disabled}
		{...rest}
	/>
	<span class="akui-choice-box" bind:this={boxEl}>
		<span class="thumb" style={thumbStyle}>
			<!-- The thumb is its own raised surface, so it gets its own Glow. -->
			<Glow />
		</span>
		<!-- Always recessed; the thumb is what sits proud of it. -->
		<Glow inset />
	</span>
	{#if children}
		<span class="akui-choice-label">{@render children()}</span>
	{:else if label}
		<span class="akui-choice-label">{label}</span>
	{/if}
</label>

<style>
	.toggle {
		/* Track is twice as wide as it is tall; the thumb travels the difference. */
		--akui-choice-width: calc(var(--akui-choice-size) * 1.8);
		--akui-choice-radius: 999px;
		--thumb-inset: 2px;
		/** How much longer the thumb is while dragged. Keep in step with `THUMB_STRETCH` in the script. */
		--thumb-stretch: 1.2;
		/** Extra length the thumb gains when stretched. */
		--thumb-extra: calc(var(--thumb-size) * (var(--thumb-stretch) - 1));
		/** 1 while the thumb is stretched, else 0. Lets the "on" position shift to make room. */
		--thumb-stretching: 0;
		--thumb-size: calc(var(--akui-choice-size) - var(--thumb-inset) * 2 - 2px);
	}

	.toggle .akui-choice-box {
		display: block;
	}

	.thumb {
		position: absolute;
		top: var(--thumb-inset);
		left: var(--thumb-inset);
		width: var(--thumb-size);
		height: var(--thumb-size);
		border-radius: 50%;
		background-color: var(--akui-fg-secondary);
		/* The thumb sits above the input (z-index 12 vs 11), so without this a press on the knob never reaches the input's pointer handlers. */
		pointer-events: none;
		/* Above the track Glow (z-index 10) so the thumb stays crisp. */
		z-index: 12;
		transition:
			transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1),
			width 0.15s ease,
			background-color 0.2s ease;
	}

	.akui-choice-input:checked + .akui-choice-box .thumb {
		background-color: #fff;
		/* While stretched, rest `--thumb-extra` further left so the longer thumb still ends at the track's inner edge. */
		transform: translateX(
			calc(
				var(--akui-choice-width) - var(--thumb-size) - var(--thumb-inset) * 2 - 2px -
					var(--thumb-extra) * var(--thumb-stretching)
			)
		);
	}

	/* The thumb only elongates while it is moving: being dragged, or sliding after a change. */
	.toggle.dragging:not(.disabled),
	.toggle.travelling:not(.disabled) {
		--thumb-stretching: 1;
	}

	.toggle.dragging:not(.disabled) .thumb,
	.toggle.travelling:not(.disabled) .thumb {
		width: calc(var(--thumb-size) * var(--thumb-stretch));
	}

	/* Horizontal drags move the knob; vertical ones still scroll the page (touch). */
	.toggle .akui-choice-input {
		touch-action: pan-y;
	}

	/* A toggle should not shrink on press: the thumb already responds. */
	.toggle:not(.disabled):active .akui-choice-box {
		transform: none;
	}
</style>
