<script lang="ts">
	import { Menu, MenuItem, MenuContent, MenuDivider } from './index.js';

	let coords = $state({ x: 100, y: 100 });
	let visible = $state(false);

	function handleClick(e: MouseEvent) {
		coords = { x: e.clientX, y: e.clientY };
		visible = true;
	}
</script>

<div
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent)}
	tabindex="0"
	role="button"
	style="height: 400px; border: 1px dashed var(--akui-border-input); position: relative; border-radius: 8px; cursor: crosshair; display: flex; align-items: center; justify-content: center;"
>
	<div style="color: var(--akui-fg-secondary); text-align: center; pointer-events: none;">
		Click anywhere in this area to spawn the menu at the cursor.<br />
		The menu will stay within viewport bounds.
	</div>

	{#if visible}
		<Menu x={coords.x} y={coords.y} onClose={() => (visible = false)}>
			<MenuItem icon="person" label="Profile" />
			<MenuItem icon="gear" label="Settings" />
			<MenuDivider />
			<MenuContent>
				<div style="display: flex; flex-direction: column; gap: 0.5rem;">
					<span
						style="font-size: 0.75rem; font-weight: 600; color: var(--akui-fg-secondary); text-transform: uppercase;"
						>Volume</span
					>
					<input type="range" style="width: 100%;" />
				</div>
			</MenuContent>
			<MenuDivider />
			<MenuItem icon="box-arrow-right" label="Logout" />
		</Menu>
	{/if}
</div>
