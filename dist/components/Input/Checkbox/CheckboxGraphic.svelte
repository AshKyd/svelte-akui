<script lang="ts">
	/**
	 * @component CheckboxGraphic
	 * The `Checkbox` look with no `<input>` behind it: a drawn box that shows a state and cannot be
	 * changed. For read-only displays such as checklists in note card previews, where a real
	 * (disabled) input would be focusable noise. It takes no pointer events, so clicks pass through
	 * to whatever contains it. Use `Checkbox` for anything the user can change or submit.
	 */
	import { getContext } from 'svelte';
	import Glow from '../../Glow/Glow.svelte';
	import { INPUT_GROUP_CONTEXT, type InputGroupContext } from '../context.js';
	import CheckMark from './CheckMark.svelte';
	import '../choice.css';

	export interface Props {
		/** Whether the box is ticked. */
		checked?: boolean;
		/** Shows a dash instead of a tick. */
		indeterminate?: boolean;
		/** Optional size override. Falls back to group context. */
		size?: 'small' | 'medium' | 'large';
		/** Additional CSS classes for the outer element. */
		class?: string;
	}

	let { checked = false, indeterminate = false, size, class: className = '' }: Props = $props();

	const groupContext = getContext<InputGroupContext | undefined>(INPUT_GROUP_CONTEXT);
	const effectiveSize = $derived(size ?? groupContext?.size ?? 'medium');
	const on = $derived(checked || indeterminate);
</script>

<!-- Exposed as a read-only checkbox, so assistive tech still hears the state. -->
<span
	class="akui-choice akui-choice-graphic {effectiveSize} {className}"
	role="checkbox"
	aria-checked={indeterminate ? 'mixed' : checked}
	aria-readonly="true"
>
	<span class="akui-choice-box" class:checked={on} class:indeterminate>
		<CheckMark />
		<Glow inset={!on} />
	</span>
</span>
