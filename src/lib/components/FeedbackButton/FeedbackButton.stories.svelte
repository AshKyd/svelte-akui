<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeedbackButton from './FeedbackButton.svelte';

	const { Story } = defineMeta({
		title: 'Components/FeedbackButton',
		component: FeedbackButton,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['regular', 'accent', 'ghost']
			},
			size: {
				control: { type: 'select' },
				options: ['small', 'medium', 'large']
			},
			status: {
				control: { type: 'select' },
				options: ['idle', 'loading', 'success', 'error']
			}
		},
		args: {
			label: 'Feedback Button'
		}
	});
</script>

<Story name="Success Action" args={{
	label: 'Save Changes',
	variant: 'accent',
	onclick: () => new Promise(resolve => setTimeout(resolve, 1500))
}} />

<Story name="Error Action" args={{
	label: 'Delete Item',
	variant: 'regular',
	onclick: () => new Promise((_, reject) => setTimeout(reject, 1500))
}} />

<Story name="Icon Only" args={{
	label: 'Mark all as read',
	icon: 'check2-all',
	iconPosition: 'only',
	variant: 'ghost',
	onclick: () => new Promise(resolve => setTimeout(resolve, 1200))
}} />
