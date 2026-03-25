<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		/** The padding size from our theme. */
		size?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
		/** Shorthand to apply padding to all sides (default). */
		all?: boolean;
		/** Shorthand for horizontal padding (left and right). */
		x?: boolean;
		/** Shorthand for vertical padding (top and bottom). */
		y?: boolean;
		/** Specific side: top. */
		top?: boolean;
		/** Specific side: bottom. */
		bottom?: boolean;
		/** Specific side: left. */
		left?: boolean;
		/** Specific side: right. */
		right?: boolean;
		/** Content to wrap. */
		children: Snippet;
		/** Additional CSS classes. */
		class?: string;
		/** Additional style overrides. */
		style?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let {
		size = 'm',
		all,
		x,
		y,
		top,
		bottom,
		left,
		right,
		children,
		class: className = '',
		style: styleOverride = '',
		...rest
	}: Props = $props();

	// Determine which sides to apply padding to
	const isSpecific = $derived(x || y || top || bottom || left || right);
	const applyAll = $derived(!isSpecific || all);

	const paddingStyle = $derived.by(() => {
		const varName = `--akui-space-${size}`;
		const styles: string[] = [];

		if (applyAll) {
			styles.push(`padding: var(${varName});`);
		} else {
			if (y || top) styles.push(`padding-top: var(${varName});`);
			if (y || bottom) styles.push(`padding-bottom: var(${varName});`);
			if (x || left) styles.push(`padding-left: var(${varName});`);
			if (x || right) styles.push(`padding-right: var(${varName});`);
		}

		return styles.join(' ');
	});
</script>

<div class="akui-padding {className}" style="{paddingStyle} {styleOverride}" {...rest}>
	{@render children()}
</div>

<style>
	.akui-padding {
		display: block;
		box-sizing: border-box;
		width: 100%;
	}
</style>
