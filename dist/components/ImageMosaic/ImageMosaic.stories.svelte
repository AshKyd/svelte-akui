<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/ImageMosaic'
	});
</script>

<script lang="ts">
	import { ImageMosaic } from './index.js';

	// The 4 local unsplash images from /static
	const localImages = [
		{
			width: 1600,
			height: 900,
			src: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			alt: 'Landscape with abstract pastel layers'
		},
		{
			width: 800,
			height: 1200,
			src: '/bharath-kumar-csws9NlWGls-unsplash.jpg',
			alt: 'Portrait of dry grass heads in golden light'
		},
		{
			width: 1000,
			height: 1000,
			src: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg',
			alt: 'Square format showing a moody architectural window'
		},
		{
			width: 1200,
			height: 800,
			src: '/puscas-adryan-48sADbm-Zvg-unsplash.jpg',
			alt: 'Mountain landscape with pines and mist'
		}
	];

	// Generates items by cycling through local images
	const generateItems = (count: number) => {
		const items = [];
		for (let i = 0; i < count; i++) {
			const baseImg = localImages[i % localImages.length];
			items.push({
				...baseImg,
				alt: `${baseImg.alt} (Item ${i + 1})`
			});
		}
		return items;
	};

	const whimsicalItems = [
		{
			width: 1600,
			height: 900,
			src: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			alt: 'The local coven preparing herbal teas'
		},
		{
			width: 800,
			height: 1200,
			src: '/bharath-kumar-csws9NlWGls-unsplash.jpg',
			alt: 'A gnome carefully polishing a particularly shiny acorn'
		},
		{
			width: 1000,
			height: 1000,
			src: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg',
			alt: 'A familiar napping on a stack of spellbooks'
		},
		{
			width: 1200,
			height: 800,
			src: '/puscas-adryan-48sADbm-Zvg-unsplash.jpg',
			alt: 'Water sprites organizing the village stream'
		},
		// Repeat to have 6 items
		{
			width: 1600,
			height: 900,
			src: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
			alt: 'Enchanted bread rising in the communal ovens'
		},
		{
			width: 800,
			height: 1200,
			src: '/bharath-kumar-csws9NlWGls-unsplash.jpg',
			alt: 'The magical creatures local council meeting'
		}
	];
</script>

<Story name="Auto Balancing">
	{#snippet children()}
		<div style="width: 100%; max-width: 1000px; margin: 0 auto;">
			<h2>Auto Balancing Layout</h2>
			<p>Items are automatically grouped by aspect ratio to form perfectly fitting rows.</p>
			<ImageMosaic items={whimsicalItems} />
		</div>
	{/snippet}
</Story>

<Story name="Explicit Rows">
	{#snippet children()}
		<div style="width: 100%; max-width: 1000px; margin: 0 auto;">
			<h2>Explicit Rows [1, 2, 3]</h2>
			<p>Items are forced into predefined row lengths.</p>
			<ImageMosaic items={whimsicalItems} rows={[1, 2, 3]} />
		</div>
	{/snippet}
</Story>

<Story name="Custom Rendering Snippet">
	{#snippet children()}
		<div style="width: 100%; max-width: 1000px; margin: 0 auto;">
			<h2>Custom Render</h2>
			<p>The components can render anything using a snippet. Here we just use background colors.</p>
			<ImageMosaic items={whimsicalItems}>
				{#snippet children(item)}
					<div
						style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--ak-color-surface-sunken); padding: 1rem; text-align: center; border-radius: var(--ak-radius-md);"
					>
						<div>
							<strong>{item.width} x {item.height}</strong>
							<div style="font-size: 0.8em; margin-top: 0.5rem; color: var(--ak-color-text-muted);">
								{item.alt}
							</div>
						</div>
					</div>
				{/snippet}
			</ImageMosaic>
		</div>
	{/snippet}
</Story>

<Story name="Lots of Items">
	{#snippet children()}
		<div style="width: 100%; max-width: 1200px; margin: 0 auto;">
			<h2>Stress Test (Auto Balancing)</h2>
			<ImageMosaic items={generateItems(20)} />
		</div>
	{/snippet}
</Story>
