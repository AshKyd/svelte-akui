<script lang="ts">
	import { Button, FeedbackButton, FilePicker, MenuButton, MenuItem } from '$lib/index.js';

	const variants = ['regular', 'accent', 'ghost'] as const;
	const sizes = ['small', 'medium', 'large'] as const;

	/** Resolves or rejects after a short wait so `FeedbackButton` shows each state. */
	const wait = (shouldFail: boolean) => () =>
		new Promise<void>((resolve, reject) => setTimeout(shouldFail ? reject : resolve, 800));
</script>

<section>
	<h2>Buttons</h2>

	{#each variants as variant (variant)}
		<h3>{variant}</h3>
		<div class="demo-row">
			{#each sizes as size (size)}
				<Button {variant} {size}>{size}</Button>
			{/each}
			<Button {variant} radius="full">Full radius</Button>
			<Button {variant} icon="star" iconPosition="left">Icon left</Button>
			<Button {variant} icon="arrow-right" iconPosition="right">Icon right</Button>
			<Button {variant} icon="gear" iconPosition="only" aria-label="Settings" />
			<Button {variant} loading>Loading</Button>
			<Button {variant} disabled>Disabled</Button>
		</div>
	{/each}

	<h3>Other actions</h3>
	<div class="demo-row">
		<FeedbackButton variant="accent" onclick={wait(false)}>Succeeds</FeedbackButton>
		<FeedbackButton onclick={wait(true)}>Fails</FeedbackButton>
		<FilePicker label="Pick a file" icon="upload" />
		<MenuButton>
			Menu
			{#snippet menu()}
				<MenuItem icon="pencil" label="Edit" />
				<MenuItem icon="copy" label="Duplicate" />
				<MenuItem icon="trash" label="Delete" />
			{/snippet}
		</MenuButton>
	</div>
</section>
