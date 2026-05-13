<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from './Badge.svelte';

	const { Story } = defineMeta({
		title: 'Components/Badge',
		tags: ['autodocs']
	});
</script>

<Story name="Default (Blue)">
	<Badge label="Blue Badge" />
</Story>

<Story name="Accent (Solid)">
	<Badge variant="accent" label="Accent Badge" />
</Story>

<Story name="Coloured Tactile">
	<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
		<Badge colour="green">Mutual</Badge>
		<Badge colour="blue">Following</Badge>
		<Badge colour="orange">Restricted</Badge>
		<Badge colour="pink">Follower</Badge>
		<Badge colour="purple">Internal</Badge>
		<Badge colour="amber">Warning</Badge>
	</div>
</Story>

<Story name="Auto Coloring">
	<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
		<Badge label="Svelte" colour="auto" />
		<Badge label="TypeScript" colour="auto" />
		<Badge label="Storybook" colour="auto" />
		<Badge label="Vite" colour="auto" />
		<Badge label="Tailwind" colour="auto" />
		<Badge label="Node.js" colour="auto" />
	</div>
</Story>

<Story name="Closable Tags">
	<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
		<Badge colour="auto" label="React" onClose={() => {}} />
		<Badge colour="auto" label="Vue" onClose={() => {}} />
		<Badge colour="auto" label="Angular" onClose={() => {}} />
	</div>
</Story>

<Story name="Sizes">
	<div style="display: flex; flex-direction: column; gap: 1rem;">
		<Badge size="x-small" colour="green">X-Small</Badge>
		<Badge size="small" colour="blue">Small</Badge>
		<Badge size="medium" colour="orange">Medium (Default)</Badge>
		<Badge size="large" colour="pink">Large</Badge>
	</div>
</Story>

<Story name="With Icons">
	<div style="display: flex; gap: 0.5rem;">
		<Badge icon="check-circle" colour="green">Verified</Badge>
		<Badge icon="bell" colour="orange">Alert</Badge>
		<Badge icon="trophy" colour="amber">Winner</Badge>
	</div>
</Story>

<Story name="Links">
	<Badge href="#" colour="blue">Clickable Link</Badge>
</Story>
