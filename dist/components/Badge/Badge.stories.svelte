<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'Components/Badge',
		tags: ['autodocs']
	});
</script>

<Story name="Regular (Outlined)">
	<Badge>
		Outlined Badge
	</Badge>
</Story>

<Story name="Regular with Background">
	<Badge hasBackground>
		Glass Badge
	</Badge>
</Story>

<Story name="Accent (Outlined)">
	<Badge variant="accent">
		Accent Outlined
	</Badge>
</Story>

<Story name="Accent with Background">
	<Badge variant="accent" hasBackground>
		Accent Glass
	</Badge>
</Story>

<Story name="Clickable Link">
	<Badge href="https://google.com" variant="accent" hasBackground>
		Clickable Badge
	</Badge>
</Story>

<Story name="Small">
	<Badge size="small">Small</Badge>
</Story>

<Story name="X-Small">
	<Badge size="x-small">X-Small</Badge>
</Story>

<Story name="With Icon">
	<Badge icon="check-circle" size="small">Verified</Badge>
</Story>

<Story name="Small with Icon">
	<Badge icon="bell" size="x-small">Alert</Badge>
</Story>

<Story name="Large with Icon">
	<Badge size="large" variant="accent" icon="trophy" hasBackground>
		Winner
	</Badge>
</Story>
