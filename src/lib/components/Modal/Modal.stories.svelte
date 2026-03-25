<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Modal from './Modal.svelte';
	import Button from '../Button/Button.svelte';
	import Padding from '../Padding/Padding.svelte';

	const { Story } = defineMeta({
		title: 'Components/Modal',
		component: Modal,
		tags: ['autodocs']
	});
</script>

<Story name="Basic">
	<Modal title="Basic Modal" onClose={() => console.log('Close requested')}>
		<Padding>
			<p>This is a basic modal rendered directly. In Storybook, it opens automatically on mount.</p>
			<p>
				You can click the backdrop, the close button, or press ESC to trigger the close callback.
			</p>
		</Padding>
	</Modal>
</Story>

<Story name="With Icon">
	<Modal title="Settings" icon="gear" onClose={() => console.log('Close requested')}>
		<Padding>
			<p>This modal has an icon in the header.</p>
		</Padding>
	</Modal>
</Story>

<Story name="With Actions">
	<Modal
		title="Delete item?"
		icon="exclamation-triangle"
		onClose={() => console.log('Close requested')}
	>
		{#snippet footer()}
			<Button>Cancel</Button>
			<Button variant="accent">Delete</Button>
		{/snippet}
		<Padding>
			<p>Are you sure you want to delete this item? This action cannot be undone.</p>
		</Padding>
	</Modal>
</Story>
<Story name="Mobile Fullscreen">
	<Modal
		title="Mobile View"
		icon="phone"
		fullscreenOnMobile={true}
		onClose={() => console.log('Close')}
	>
		<Padding>
			<h2>Fullscreen Content</h2>
			<p>On devices smaller than 720px, this modal takes up the entire screen.</p>
			{#each Array(20) as _, i (i)}
				<p>
					This is some scrolling example content to verify the header and footer behavior. The modal
					body will scroll while the title and actions stay fixed.
				</p>
			{/each}
		</Padding>
	</Modal>
</Story>

<Story name="Custom Padding">
	<Modal title="No Padding" onClose={() => console.log('Close requested')}>
		<div
			style="background: var(--akui-bg-accent); color: white; height: 100px; display: flex; align-items: center; justify-content: center;"
		>
			Content with zero default padding
		</div>
	</Modal>
</Story>
