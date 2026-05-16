<script lang="ts">
	interface Props {
		/** Current value of the progress bar (0 to max) */
		value: number;
		/** Maximum value (defaults to 1) */
		max?: number;
		/** Additional CSS classes for the container */
		class?: string;
	}

	let { 
		value = 0, 
		max = 1, 
		class: className = '' 
	}: Props = $props();

	const progress = $derived(Math.min(Math.max(value / max, 0), 1));
</script>

<div class="akui-progress-bar {className}" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
	<div class="akui-progress-bar-track">
		<div 
			class="akui-progress-bar-fill" 
			style:width="{progress * 100}%"
		></div>
	</div>
</div>

<style>
	.akui-progress-bar {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.akui-progress-bar-track {
		flex: 1;
		height: 4px;
		background-color: var(--akui-bg-secondary);
		border-radius: 2px;
		overflow: hidden;
		position: relative;
	}

	.akui-progress-bar-fill {
		height: 100%;
		background-color: var(--akui-bg-accent);
		transition: width 0.3s ease-out;
		border-radius: 2px;
	}
</style>
