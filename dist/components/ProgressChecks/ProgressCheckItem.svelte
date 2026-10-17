<script lang="ts">
	import { type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import Icon from '../Icon/Icon.svelte';
	import Loader from '../Loader/Loader.svelte';
	import Padding from '../Padding/Padding.svelte';
	import { motion } from '../../hooks/reducedMotion.svelte.js';
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
		icon,
		class: className = ''
	}: Props = $props();

	/** The spinner and this text carry progress, e.g. "188 / 412". There is no bar. */
	const detailText = $derived(detail ?? (value !== undefined && max !== 1 ? `${value} / ${max}` : ''));

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

	/** Whether the row has a second line: a `note` snippet, or any message or count. */
	const hasNote = $derived(Boolean(note) || noteText !== '');

	const statusIcons: Record<Exclude<ProgressCheckStatus, 'active'>, string> = {
		pending: 'circle',
		done: 'check-circle-fill',
		warning: 'exclamation-circle-fill',
		error: 'x-circle-fill'
	};
</script>

<li
	class="akui-control-item-progress-wrapper akui-progress-check {status} {className}"
	aria-busy={status === 'active'}
	data-status={status}
>
	<Padding size="m">
		<div class="akui-progress-check-content">
			<span class="akui-progress-check-icon">
				{#if icon}
					{@render icon(status)}
				{:else if status === 'active'}
					<Loader size="1.25em" {label} />
				{:else}
					<Icon name={statusIcons[status]} size="1.25em" />
				{/if}
			</span>
			<span class="akui-progress-check-text">
				<span class="akui-progress-check-label">{label}</span>
				<!-- One line until there is a note; the second line then slides open (and shut again). -->
				{#if hasNote || reserveNote}
					<span class="akui-progress-check-note" transition:slide={motion({ duration: 200 })}>
						{#if note}{@render note()}{:else}{noteText ||' '}{/if}
					</span>
				{/if}
			</span>
			{#if detailText}
				<span class="akui-progress-check-detail">{detailText}</span>
			{/if}
		</div>
	</Padding>
</li>

<style>
	.akui-progress-check {
		position: relative;
		display: block;
		list-style: none;
		color: var(--akui-fg);
	}

	.akui-progress-check.pending {
		color: var(--akui-fg-secondary);
	}

	/* Only the icon carries the status colour. It has no text, so it uses the -solid tokens. */
	.akui-progress-check-icon {
		color: var(--akui-fg-secondary);
		transition: color 0.3s ease;
	}

	.akui-progress-check.active .akui-progress-check-icon {
		color: var(--akui-color-blue-solid);
	}

	.akui-progress-check.done .akui-progress-check-icon {
		color: var(--akui-color-green-solid);
	}

	.akui-progress-check.warning .akui-progress-check-icon {
		color: var(--akui-color-orange-solid);
	}

	.akui-progress-check.error .akui-progress-check-icon {
		color: var(--akui-color-red-solid);
	}

	.akui-progress-check-content {
		display: flex;
		align-items: center;
		gap: var(--akui-space-m);
	}

	.akui-progress-check-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.akui-progress-check-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.akui-progress-check-label {
		font-size: 0.95rem;
		font-weight: 500;
	}

	.akui-progress-check-note {
		font-size: 0.8rem;
		opacity: 0.85;
		overflow-wrap: anywhere;
	}

	.akui-progress-check-detail {
		font-size: 0.85rem;
		font-variant-numeric: tabular-nums;
		opacity: 0.8;
	}

</style>
