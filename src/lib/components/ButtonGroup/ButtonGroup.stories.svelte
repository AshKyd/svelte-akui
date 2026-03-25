<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ButtonGroup from './ButtonGroup.svelte';
	import Button from '../Button/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/ButtonGroup',
		component: ButtonGroup,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['small', 'medium', 'large']
			}
		}
	});
</script>

<Story name="Text Buttons">
	<ButtonGroup>
		<Button label="Left" />
		<Button label="Middle" />
		<Button label="Right" />
	</ButtonGroup>
</Story>

<Story name="Icons and Text">
	<ButtonGroup>
		<Button label="Add" icon="plus-lg" variant="accent" />
		<Button label="Edit" icon="pencil" />
		<Button label="Delete" icon="trash" />
	</ButtonGroup>
</Story>

<Story name="Icon Only">
	<ButtonGroup>
		<Button icon="align-start" iconPosition="only" label="Align Left" />
		<Button icon="align-center" iconPosition="only" label="Align Center" />
		<Button icon="align-end" iconPosition="only" label="Align Right" />
	</ButtonGroup>
</Story>

<Story name="Mixed">
	<ButtonGroup>
		<Button icon="chevron-left" iconPosition="only" label="Previous" />
		<Button label="Page 1" />
		<Button icon="chevron-right" iconPosition="only" label="Next" />
	</ButtonGroup>
</Story>

<Story name="Small Mixed" args={{ size: 'small' }}>
	<ButtonGroup size="small">
		<Button icon="play-fill" iconPosition="only" label="Play" />
		<Button label="Pause" icon="pause-fill" />
		<Button icon="stop-fill" iconPosition="only" label="Stop" />
	</ButtonGroup>
</Story>

<Story name="Large Accent">
	<ButtonGroup>
		<Button label="Download" icon="download" variant="accent" />
		<Button label="Share" icon="share" variant="accent" />
	</ButtonGroup>
</Story>
