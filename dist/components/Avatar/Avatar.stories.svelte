<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Avatar from './Avatar.svelte';

	const { Story } = defineMeta({
		title: 'Components/Avatar',
		component: Avatar,
		tags: ['autodocs'],
		argTypes: {
			shape: {
				control: { type: 'select' },
				options: ['rounded', 'round']
			},
			size: { control: { type: 'text' } }
		},
		args: {
			src: '/bharath-kumar-csws9NlWGls-unsplash.jpg',
			alt: 'Mabel Bramblewick',
			initials: 'MB',
			shape: 'rounded',
			size: '4rem'
		}
	});
</script>

<Story name="Photo" />

<Story name="Initials" args={{ src: undefined }} />

<Story name="Broken image falls back to initials" args={{ src: '/missing.jpg' }} />

<Story name="No image or initials" args={{ src: undefined, initials: undefined }} />
