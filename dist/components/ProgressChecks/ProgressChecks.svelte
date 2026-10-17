<script lang="ts">
	import { type Snippet } from 'svelte';
	import ControlGroup from '../ControlGroup/ControlGroup.svelte';
	import ProgressCheckItem from './ProgressCheckItem.svelte';
	import type { ProgressCheckStep } from './types.js';

	interface Props {
		/** The steps to show, in order. */
		steps: ProgressCheckStep[];
		/** Snippet that replaces a step's second line (its note). */
		note?: Snippet<[ProgressCheckStep]>;
		/**
		 * Keeps a second line on every step, so rows are a fixed two lines tall instead of sliding
		 * open when a note appears. Defaults to false.
		 */
		reserveNote?: boolean;
		/** Snippet that replaces a step's status icon. */
		icon?: Snippet<[ProgressCheckStep]>;
		/** Additional CSS classes. */
		class?: string;
	}

	let { steps, reserveNote = false, note, icon, class: className = '' }: Props = $props();
</script>

<ControlGroup role="list" class="akui-progress-checks {className}">
	{#each steps as step (step.id)}
		<ProgressCheckItem
			label={step.label}
			status={step.status}
			value={step.value}
			max={step.max}
			detail={step.detail}
			message={step.message}
			skipped={step.skipped}
			failed={step.failed}
			{reserveNote}
			note={note ? stepNote : undefined}
			icon={icon ? stepIcon : undefined}
		/>
		{#snippet stepNote()}
			{@render note?.(step)}
		{/snippet}
		{#snippet stepIcon()}
			{@render icon?.(step)}
		{/snippet}
	{/each}
</ControlGroup>
