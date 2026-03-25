<script lang="ts">
	interface Props {
		/** Vertical margin size. */
		margin?: 'none' | 's' | 'm' | 'l';
		/** Additional CSS classes. */
		class?: string;
		/** Spread remaining attributes. */
		[key: string]: unknown;
	}

	let { margin = 'm', class: className = '', ...rest }: Props = $props();
</script>

<hr class="akui-divider margin-{margin} {className}" {...rest} />

<style>
	.akui-divider {
		border: none;
		border-top: 1px solid var(--akui-border, rgba(255, 255, 255, 0.1));
		width: 100%;
		display: block;
	}

	.margin-none {
		margin: 0;
	}
	.margin-s {
		margin: 0.25rem 0;
	}
	.margin-m {
		margin: 0.5rem 0;
	}
	.margin-l {
		margin: 1rem 0;
	}

	:global([data-theme='dark']) .akui-divider {
		border-top-color: rgba(255, 255, 255, 0.05);
	}
</style>
