<script lang="ts">
	import { Modal, Button, Padding } from '../../../index.js';

	/** Which inline modals are currently shown; closing one hides it until reopened. */
	let shown = $state({ plain: true, icon: true, actions: true, bare: true });
	type ModalKey = keyof typeof shown;

	const close = (key: ModalKey) => () => (shown[key] = false);
</script>

<section>
	<h2>Modal (inline)</h2>

	<div class="demo-row">
		{#each Object.keys(shown) as key (key)}
			<Button size="small" onclick={() => (shown[key as ModalKey] = true)}>Show {key}</Button>
		{/each}
	</div>

	<div class="demo-row">
		{#if shown.plain}
			<Modal inline title="Plain modal" onClose={close('plain')}>
				<Padding>Modal body text.</Padding>
			</Modal>
		{/if}

		{#if shown.icon}
			<Modal inline title="With icon" icon="gear" onClose={close('icon')}>
				<Padding>Icon in the header.</Padding>
			</Modal>
		{/if}

		{#if shown.actions}
			<Modal inline title="Delete item?" icon="exclamation-triangle" onClose={close('actions')}>
				<Padding>This action cannot be undone.</Padding>
				{#snippet footer()}
					<Button onclick={close('actions')}>Cancel</Button>
					<Button variant="accent" onclick={close('actions')}>Delete</Button>
				{/snippet}
			</Modal>
		{/if}

		{#if shown.bare}
			<Modal inline showCloseButton={false} onClose={close('bare')}>
				<Padding>No header at all.</Padding>
			</Modal>
		{/if}
	</div>
</section>
