<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DynamicImage from './DynamicImage.svelte';

	const { Story } = defineMeta({
		title: 'Components/DynamicImage',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
</script>

<Story name="Landscape in 16:9">
	<div style="width: 400px; aspect-ratio: 16/9; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
		<DynamicImage 
			src="/philip-oroni-KbusKKAZ968-unsplash.jpg" 
			alt="Landscape"
		/>
	</div>
</Story>

<Story name="Portrait in 16:9 (Smart Contain)">
	<div style="width: 400px; aspect-ratio: 16/9; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
		<DynamicImage 
			src="/bharath-kumar-csws9NlWGls-unsplash.jpg" 
			alt="Portrait"
		/>
	</div>
</Story>

<Story name="Force Cover">
	<div style="width: 400px; aspect-ratio: 16/9; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
		<DynamicImage 
			src="/bharath-kumar-csws9NlWGls-unsplash.jpg" 
			alt="Portrait forced cover"
			fit="cover"
		/>
	</div>
</Story>

<Story name="Square Container">
	<div style="width: 200px; height: 200px; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
		<DynamicImage 
			src="/faded_gallery-SiAJGyR15Aw-unsplash.jpg" 
			alt="Square"
		/>
	</div>
</Story>

<Story name="Error State">
	<div style="width: 400px; aspect-ratio: 16/9; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
		<DynamicImage 
			src="/non-existent.jpg" 
			alt="Error example"
		/>
	</div>
</Story>
