<script lang="ts" module>
	export interface AvatarProps {
		/** Image URL. Falls back to `initials` (then a person icon) when missing or broken. */
		src?: string;
		/** Alt text for the image. Leave empty for a decorative avatar. */
		alt?: string;
		/** One or two letters shown when there is no usable image. */
		initials?: string;
		/** `rounded` is a square with rounded corners. `round` is a circle. */
		shape?: 'rounded' | 'round';
		/** Any CSS length. */
		size?: string;
	}
</script>

<script lang="ts">
	import Icon from '../Icon/Icon.svelte';
	import Glow from '../Glow/Glow.svelte';

	let { src, alt = '', initials, shape = 'rounded', size }: AvatarProps = $props();

	/** Tracks which `src` failed, so a new `src` gets a fresh attempt. */
	let failedSrc = $state<string>();
	const showImage = $derived(Boolean(src) && src !== failedSrc);
</script>

<span
	class={['akui-avatar', shape]}
	style:--_size={size}
	role={showImage || !alt ? undefined : 'img'}
	aria-label={showImage ? undefined : alt || undefined}
>
	{#if showImage}
		<img {src} {alt} onerror={() => (failedSrc = src)} />
	{:else if initials}
		<span class="akui-avatar-initials" aria-hidden="true">{initials.slice(0, 2)}</span>
	{:else}
		<Icon name="person-fill" size="60%" />
	{/if}
	<Glow />
</span>

<style>
	.akui-avatar {
		--_size: 2.5rem;
		position: relative; /* For the `Glow` overlay. */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--_size);
		height: var(--_size);
		flex-shrink: 0;
		overflow: hidden;
		border-radius: 22%;
		background: var(--akui-bg-secondary);
		color: var(--akui-fg-secondary);
	}

	.akui-avatar.round {
		border-radius: 50%;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Scales with the avatar. */
	.akui-avatar-initials {
		font-size: calc(var(--_size) * 0.38);
		font-weight: 600;
		text-transform: uppercase;
		color: var(--akui-fg);
	}
</style>
