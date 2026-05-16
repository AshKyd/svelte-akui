<script lang="ts">
	interface Props {
		/** Current value of the progress bar (0 to max) */
		value: number;
		/** Maximum value (defaults to 1) */
		max?: number;
		/** The color of the progress bar fill */
		colour?: 'accent' | 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'amber';
		/** The size of the progress bar */
		size?: 'small' | 'medium' | 'large';
		/** Additional CSS classes for the container */
		class?: string;
	}

	let {
		value = 0,
		max = 1,
		colour = 'accent',
		size = 'medium',
		class: className = ''
	}: Props = $props();

	const progress = $derived(Math.min(Math.max(value / max, 0), 1));
	
	const progressColour = $derived(
		colour === 'accent' ? 'var(--akui-bg-accent)' : `var(--akui-color-${colour}-fg)`
	);
</script>

<div
	class="akui-progress-bar {className}"
	class:small={size === 'small'}
	class:medium={size === 'medium'}
	class:large={size === 'large'}
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	style="--progress-colour: {progressColour};"
>
	<div class="akui-progress-bar-track">
		<div class="akui-progress-bar-fill" style="width: {progress * 100}%;">
			<div class="akui-progress-bar-glow"></div>
		</div>
	</div>
</div>

<style>
	.akui-progress-bar {
		width: 100%;
		display: flex;
		align-items: center;
		--track-h: 8px;
	}

	.akui-progress-bar-track {
		flex: 1;
		height: var(--track-h);
		background-color: var(--akui-bg-secondary);
		border-radius: 100vw;
		overflow: hidden;
		position: relative;
		box-shadow: var(--akui-shadow-sunken);
	}

	.akui-progress-bar-fill {
		height: 100%;
		background-color: var(--progress-colour);
		transition: width 0.3s ease-out;
		border-radius: 100vw;
		position: relative;
		box-shadow: var(--akui-shadow-glow);
	}

	/* Add a subtle shine effect to the fill */
	.akui-progress-bar-fill::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
		pointer-events: none;
	}

	.akui-progress-bar-glow {
		position: absolute;
		inset: 0;
		box-shadow: 0 0 12px var(--progress-colour);
		opacity: 0.2;
		pointer-events: none;
	}

	/* Sizes */
	.akui-progress-bar.small {
		--track-h: 4px;
	}
	.akui-progress-bar.large {
		--track-h: 12px;
	}

	:global([data-theme='dark']) .akui-progress-bar-glow {
		opacity: 0.4;
	}
</style>
