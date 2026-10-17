<script lang="ts">
	import { type Snippet } from 'svelte';
	import Icon from '../Icon/Icon.svelte';
	import Loader from '../Loader/Loader.svelte';
	import ControlItemExpanded from '../ControlGroup/ControlItemExpanded/ControlItemExpanded.svelte';
	import type { ProgressCheckStatus } from './types.js';

	interface Props {
		/** The step's name, e.g. "Uploading notes". */
		label: string;
		/** Where the step is up to. Sets the icon: a spinner while active, then a coloured check or cross. */
		status?: ProgressCheckStatus;
		/** Progress so far. Shown on the right as "value / max" when `max` is above 1. */
		value?: number;
		/** The value that counts as complete. Defaults to 1. */
		max?: number;
		/** Text on the right hand side. Defaults to "value / max" when `value` is set. */
		detail?: string;
		/** Explains the outcome under the label, e.g. why the step failed. */
		message?: string;
		/** Items left out on purpose. Shown under the label. */
		skipped?: number;
		/** Items that could not be processed. Shown under the label. */
		failed?: number;
		/** Snippet for the second line. Replaces the text built from `message`, `skipped` and `failed`. */
		note?: Snippet;
		/** Always keeps the second line, so the row is a fixed two lines tall. Defaults to false. */
		reserveNote?: boolean;
		/** Snippet that replaces the status icon. */
		icon?: Snippet<[ProgressCheckStatus]>;
		/** Additional CSS classes. */
		class?: string;
	}

	let {
		label,
		status = 'pending',
		value,
		max = 1,
		detail,
		message,
		skipped = 0,
		failed = 0,
		note,
		reserveNote = false,
		icon: iconOverride,
		class: className = ''
	}: Props = $props();

	/** The spinner and this text carry progress, e.g. "188 / 412". There is no bar. */
	const detailText = $derived(
		detail ?? (value !== undefined && max !== 1 ? `${value} / ${max}` : '')
	);

	/** The counts and message joined into one line, e.g. "22 skipped · 3 failed · Owl unavailable". */
	const noteText = $derived(
		[
			skipped > 0 ? `${skipped} skipped` : '',
			failed > 0 ? `${failed} failed` : '',
			message ?? ''
		]
			.filter(Boolean)
			.join(' · ')
	);

	/**
	 * The second line: the note text, or a non-breaking space that keeps the row two lines tall when
	 * `reserveNote` is set. Empty means one line; the line then slides open when a note arrives.
	 */
	const description = $derived(noteText || (reserveNote ? ' ' : ''));

	const statusIcons: Record<Exclude<ProgressCheckStatus, 'active'>, string> = {
		pending: 'circle',
		done: 'check-circle-fill',
		warning: 'exclamation-circle-fill',
		error: 'x-circle-fill'
	};
</script>

<!-- A static row from ControlItemExpanded: no onclick or controlType, so it renders as a plain div. -->
<ControlItemExpanded
	wrapperRole="listitem"
	{label}
	{description}
	descriptionSnippet={note}
	animateDescription
	extra={detailText}
	class="akui-progress-check {status} {className}"
	aria-busy={status === 'active'}
	data-status={status}
>
	{#snippet icon()}
		<span class="akui-progress-check-icon {status}">
			{#if iconOverride}
				{@render iconOverride(status)}
			{:else if status === 'active'}
				<Loader size="1.25em" {label} />
			{:else}
				<Icon name={statusIcons[status]} size="1.25em" />
			{/if}
		</span>
	{/snippet}
</ControlItemExpanded>

<style>
	/* Only the icon carries the status colour. It has no text, so it uses the -solid tokens. */
	.akui-progress-check-icon {
		display: inline-flex;
		color: var(--akui-fg-secondary);
		transition: color 0.3s ease;
	}

	.akui-progress-check-icon.active {
		color: var(--akui-color-blue-solid);
	}

	.akui-progress-check-icon.done {
		color: var(--akui-color-green-solid);
	}

	.akui-progress-check-icon.warning {
		color: var(--akui-color-orange-solid);
	}

	.akui-progress-check-icon.error {
		color: var(--akui-color-red-solid);
	}

	/* A step that hasn't started reads as quiet text. */
	:global(.akui-progress-check.pending) {
		color: var(--akui-fg-secondary);
	}
</style>
