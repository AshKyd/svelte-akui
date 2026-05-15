<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Typeahead from './Typeahead.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input/Typeahead',
		tags: ['autodocs']
	});
</script>

<Story name="Basic">
	{@const values = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'date', label: 'Date' }
	]}
	<div style="max-width: 400px;">
		<Typeahead {values} placeholder="Choose fruits..." />
	</div>
</Story>

<Story name="Tagging (Freetext)">
	<div style="max-width: 400px;">
		<p>Type anything and hit comma or Enter to create a tag.</p>
		<Typeahead 
			allowFreetext 
			placeholder="Add tags..." 
			value={['svelte', 'akui']}
		/>
	</div>
</Story>

<Story name="Sizes">
	{@const values = [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }]}
	<div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
		<Typeahead size="small" {values} placeholder="Small" />
		<Typeahead size="medium" {values} placeholder="Medium" />
		<Typeahead size="large" {values} placeholder="Large" />
	</div>
</Story>

<Story name="Expanding Height">
	<div style="max-width: 300px;">
		<Typeahead 
			allowFreetext 
			value={['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8']} 
			placeholder="More..."
		/>
	</div>
</Story>

<Story name="Disabled">
	<div style="max-width: 400px;">
		<Typeahead 
			disabled 
			value={['locked']} 
			placeholder="Disabled..."
		/>
	</div>
</Story>
