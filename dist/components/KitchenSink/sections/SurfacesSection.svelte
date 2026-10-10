<script lang="ts">
	import {
		Panel,
		Padding,
		Divider,
		Glow,
		Tabs,
		Tooltip,
		createTooltip,
		Button,
		Header,
		HeaderSearch,
		Sidebar,
		ControlItemText,
		Icon
	} from '../../../index.js';

	const panelColours = ['regular', 'secondary', 'accent'] as const;

	const hoverTooltip = createTooltip({ position: 'top' });
	const clickTooltip = createTooltip({ position: 'bottom', trigger: 'click' });

	let searchQuery = $state('');
	let isSearching = $state(false);
</script>

<section>
	<h2>Surfaces and layout</h2>

	<h3>Panel</h3>
	<div class="demo-row">
		{#each panelColours as colour (colour)}
			<Panel {colour}><Padding>{colour} panel</Padding></Panel>
			<Panel {colour} radius="full"><Padding>{colour}, full radius</Padding></Panel>
		{/each}
	</div>

	<h3>Divider, Glow and Tooltip</h3>
	<div class="demo-row">
		<div style="width: 12rem;"><Divider /></div>
		<div style="height: 3rem;"><Divider orientation="vertical" /></div>
		<div class="demo-box" style="width: 10rem; height: 4rem;"><Glow /><Padding>Glow</Padding></div>
		<Button {...hoverTooltip.handlers}>Hover for tooltip</Button>
		<Tooltip
			visible={hoverTooltip.visible}
			x={hoverTooltip.x}
			y={hoverTooltip.y}
			position={hoverTooltip.position}
		>
			<Padding size="s">Hover tooltip</Padding>
		</Tooltip>
		<Button {...clickTooltip.handlers}>Click for tooltip</Button>
		<Tooltip
			visible={clickTooltip.visible}
			x={clickTooltip.x}
			y={clickTooltip.y}
			position={clickTooltip.position}
		>
			<Padding size="s">Click tooltip</Padding>
		</Tooltip>
	</div>

	<h3>Tabs</h3>
	<div class="demo-row">
		<div class="demo-cell">
			<Tabs
				items={[
					{ id: 'one', label: 'One', content: tabOne },
					{ id: 'two', label: 'Two', content: tabTwo }
				]}
				activeId="one"
			/>
		</div>
	</div>

	<h3>Header and sidebar</h3>
	<div class="demo-row">
		<div class="demo-cell demo-box">
			<Header>
				{#snippet navigation()}<Button variant="ghost" icon="list" iconPosition="only" aria-label="Menu" />{/snippet}
				{#snippet title()}<strong>Header title</strong>{/snippet}
				{#snippet actions()}<Button variant="ghost" icon="gear" iconPosition="only" aria-label="Settings" />{/snippet}
			</Header>
		</div>
		<div class="demo-cell demo-box">
			<HeaderSearch bind:searchQuery bind:isSearching mode="inline" placeholder="Search…" />
		</div>
		<div class="demo-box" style="width: 18rem; height: 18rem; transform: translateZ(0);">
			<Sidebar title="Sidebar" icon="list" mode="permanent" isOpen>
				{#snippet content()}
					<ControlItemText icon="house" label="Dashboard" />
					<ControlItemText icon="gear" label="Settings" />
				{/snippet}
				{#snippet footer()}<small>Footer</small>{/snippet}
			</Sidebar>
		</div>
	</div>

	<h3>Icons</h3>
	<div class="demo-row">
		<Icon name="star" size="1rem" />
		<Icon name="star-fill" size="1.5rem" />
		<Icon name="heart-fill" size="2rem" colour="var(--akui-bg-accent)" />
	</div>
</section>

{#snippet tabOne()}<Padding>First tab content</Padding>{/snippet}
{#snippet tabTwo()}<Padding>Second tab content</Padding>{/snippet}
