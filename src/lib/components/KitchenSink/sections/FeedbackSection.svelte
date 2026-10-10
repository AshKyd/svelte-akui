<script lang="ts">
	import {
		InfoBox,
		InfoBoxes,
		NotificationArea,
		Loader,
		LoaderOverlay,
		ProgressBar,
		ProgressXmasTree,
		Button,
		type NotificationItem
	} from '$lib/index.js';

	const variants = ['info', 'success', 'warning', 'error', 'message'] as const;
	const progressColours = ['accent', 'blue', 'green', 'orange', 'pink', 'purple', 'amber'] as const;
	const sizes = ['small', 'medium', 'large'] as const;

	const notifications: NotificationItem[] = variants.map((variant) => ({
		id: variant,
		variant,
		title: `${variant} notification`,
		message: 'Notification body text.',
		dismissible: false
	}));

	const infoBoxItems = variants.map((variant) => ({
		id: variant,
		variant,
		title: `${variant} item`,
		message: 'Rendered through InfoBoxes.'
	}));

	const xmasItems = [
		{ id: 1, complete: true },
		{ id: 2, complete: true },
		{ id: 3, complete: false },
		{ id: 4, complete: false },
		{ id: 5, complete: true, colour: 'pink' as const }
	];
</script>

<section>
	<h2>Feedback and colourised components</h2>

	{#each variants as variant (variant)}
		<h3>InfoBox: {variant}</h3>
		<div class="demo-row">
			<div class="demo-cell"><InfoBox {variant}>Default body text.</InfoBox></div>
			<div class="demo-cell"><InfoBox {variant} title="With title">Body text.</InfoBox></div>
			<div class="demo-cell"><InfoBox {variant} naked>Naked variant.</InfoBox></div>
			<div class="demo-cell"><InfoBox {variant} showIcon={false}>No icon.</InfoBox></div>
			<div class="demo-cell">
				<InfoBox {variant} title="Closable" onClose={() => {}}>
					With an action.
					{#snippet action()}<Button size="small">Act</Button>{/snippet}
				</InfoBox>
			</div>
		</div>
	{/each}

	<h3>InfoBoxes and NotificationArea</h3>
	<div class="demo-row">
		<div class="demo-cell"><InfoBoxes items={infoBoxItems} /></div>
		<div class="demo-cell">
			<NotificationArea items={notifications} position="inline" onDismiss={() => {}} />
		</div>
	</div>

	<h3>Loaders</h3>
	<div class="demo-row">
		<Loader size="1rem" />
		<Loader size="2rem" />
		<Loader size="3rem" colour="var(--akui-bg-accent)" label="Accent loader" />
		<div class="demo-box" style="width: 12rem; height: 6rem;">
			<LoaderOverlay label="Overlay" />
		</div>
	</div>

	<h3>Progress</h3>
	<div class="demo-row">
		{#each progressColours as colour, index (colour)}
			<div class="demo-cell">
				<ProgressBar {colour} value={20 + index * 12} max={100} size={sizes[index % 3]} />
			</div>
		{/each}
	</div>
	<div class="demo-row">
		<div style="width: 100%; max-width: 300px;">
			<ProgressXmasTree items={xmasItems} colour="green" />
		</div>
		<div style="width: 100%; max-width: 300px;">
			<ProgressXmasTree items={xmasItems} colour="purple" />
		</div>
	</div>
</section>
