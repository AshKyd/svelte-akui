<script lang="ts">
	import { type Snippet } from 'svelte';
	import Button from '../Button/Button.svelte';
	import Menu from '../Menu/Menu.svelte';

	interface Props {
		/** The content to render inside the menu. */
		menu: Snippet;
		/** The content to render inside the button. */
		children?: Snippet;
		/** The menu's origin relative to the button. */
		origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		/** All other props are forwarded to the Button component. */
		[key: string]: unknown;
	}

	let { menu, children, origin = 'bottom-left', ...rest }: Props = $props();

	let showMenu = $state(false);
	let buttonEl = $state<HTMLButtonElement>();
	let coords = $state({ x: 0, y: 0 });

	let menuOrigin = $state<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-left');

	function handleToggle(e: MouseEvent) {
		e.stopPropagation();

		if (!showMenu && buttonEl) {
			const rect = buttonEl.getBoundingClientRect();

			// Calculate coordinates and map to the correct Menu origin
			// If we anchor to the bottom of the button, the menu's origin should be 'top'
			if (origin === 'bottom-left') {
				coords = { x: rect.left, y: rect.bottom };
				menuOrigin = 'top-left';
			} else if (origin === 'bottom-right') {
				coords = { x: rect.right, y: rect.bottom };
				menuOrigin = 'top-right';
			} else if (origin === 'top-left') {
				coords = { x: rect.left, y: rect.top };
				menuOrigin = 'bottom-left';
			} else if (origin === 'top-right') {
				coords = { x: rect.right, y: rect.top };
				menuOrigin = 'bottom-right';
			}
		}
		showMenu = !showMenu;
	}
</script>

<Button {...rest} {children} bind:element={buttonEl} onclick={handleToggle} />

{#if showMenu}
	<Menu x={coords.x} y={coords.y} origin={menuOrigin} onClose={() => (showMenu = false)}>
		{@render menu()}
	</Menu>
{/if}
