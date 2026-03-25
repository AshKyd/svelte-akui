<script lang="ts">
	import { UIRoot, Panel, Button, Icon, InputGroup } from '$lib';

	let mode = $state<'light' | 'dark' | undefined>(undefined);
	let resolvedMode = $state<'light' | 'dark'>('light');
</script>

<UIRoot bind:mode bind:resolvedMode>
	<div class="demo-container">
		<header>
			<h1>AKUI Design System</h1>
			<p>Current Mode: <strong>{resolvedMode}</strong> (Configured: {mode ?? 'system'})</p>

			<select bind:value={mode} class="theme-toggle">
				<option value={undefined}>System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</header>

		<section class="demo-section">
			<h2>Button Groups</h2>
			<div class="row">
				<InputGroup joined>
					<Button label="Left" />
					<Button label="Middle" />
					<Button label="Right" />
				</InputGroup>
			</div>
			<div class="row" style="margin-top: 1rem;">
				<InputGroup joined>
					<Button icon="plus-lg" label="Add" variant="accent" />
					<Button icon="pencil" label="Edit" variant="accent" />
					<Button icon="trash" label="Delete" variant="accent" />
				</InputGroup>
			</div>
			<div class="row" style="margin-top: 1rem;">
				<InputGroup joined size="small">
					<Button icon="align-left" iconPosition="only" label="Align Left" />
					<Button icon="align-center" iconPosition="only" label="Align Center" />
					<Button icon="align-right" iconPosition="only" label="Align Right" />
				</InputGroup>
			</div>
		</section>

		<section class="demo-section">
			<h2>Icons</h2>
			<div class="row">
				<Icon name="activity" size="2rem" />
				<Icon name="search" size="2rem" colour="var(--akui-bg-accent)" />
				<Icon name="trash" size="2rem" colour="#ef4444" alt="Delete" />
				<Icon name="gear-fill" size="2rem" />
				<Icon name="check-circle-fill" size="2rem" colour="#22c55e" />
			</div>
			<div class="row" style="margin-top: 1rem;">
				<Button variant="accent" icon="plus-lg" label="Add Item" />
				<Button icon="pencil" label="Edit" />
				<Button icon="trash" iconPosition="only" label="Delete" variant="regular" />
			</div>
		</section>

		<section class="demo-section">
			<h2>3D Buttons</h2>
			<div class="row">
				<Button label="Regular Button" />
				<Button variant="accent" label="Accent Button" />
				<Button variant="accent" style="background-color: #8b5cf6;" label="Custom Color" />
			</div>
		</section>

		<section class="demo-section">
			<h2>Button Sizes</h2>
			<div class="row">
				<Button size="small" label="Small" />
				<Button size="medium" label="Medium" />
				<Button size="large" label="Large" />
			</div>
		</section>

		<section class="demo-section">
			<h2>Button Groups</h2>
			<InputGroup joined>
				<Button label="Profile" />
				<Button label="Settings" />
				<Button label="Logout" />
			</InputGroup>
		</section>

		<section class="demo-section">
			<h2>Panels & Glow Effects</h2>
			<div class="row">
				<Panel colour="regular">
					<h3>Regular Panel</h3>
					<p>With subtle 3D glow.</p>
					<Button label="Action" />
				</Panel>

				<Panel colour="secondary">
					<h3>Secondary</h3>
					<p>Alternative surface style.</p>
					<Button label="Action" />
				</Panel>

				<Panel colour="accent">
					<h3>Accent Panel</h3>
					<p>Prominent brand background.</p>
					<Button style="background: white; color: var(--akui-bg-accent);" label="Action" />
				</Panel>
			</div>
		</section>

		<section class="demo-section">
			<h2>Cards & Nested Radii</h2>
			<div class="akui-card">
				<h3>Card Title</h3>
				<p>
					This card uses <code>--akui-radius-l</code>. The button inside uses
					<code>--akui-radius-m</code> to maintain visual harmony.
				</p>
				<div class="row">
					<button class="akui-btn">Nested Button</button>
					<button class="akui-btn accent">Nested Accent</button>
				</div>
			</div>
		</section>

		<section class="demo-section">
			<h2>Color Grid</h2>
			<div class="color-grid">
				<div class="color-box bg-main">
					<span>Background / Foreground</span>
				</div>
				<div class="color-box bg-secondary">
					<span>Secondary BG / FG</span>
				</div>
				<div class="color-box bg-accent">
					<span>Accent BG / FG</span>
				</div>
			</div>
		</section>
	</div>
</UIRoot>

<style>
	.demo-container {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.demo-section {
		margin-bottom: 3rem;
	}

	.demo-section h2 {
		margin-bottom: 1rem;
		font-size: 1.25rem;
		opacity: 0.8;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin: 1rem 0;
	}

	.color-box {
		padding: 2rem;
		border-radius: var(--akui-radius-m);
		border: 1px solid var(--akui-fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.bg-main {
		background-color: var(--akui-bg);
		color: var(--akui-fg);
	}

	.bg-secondary {
		background-color: var(--akui-bg-secondary);
		color: var(--akui-fg-secondary);
	}

	.bg-accent {
		background-color: var(--akui-accent-bg);
		color: var(--akui-accent-fg);
	}

	.theme-toggle {
		margin-bottom: 2rem;
		padding: 0.5rem 1rem;
		background: #eee;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		color: #333;
	}
</style>
