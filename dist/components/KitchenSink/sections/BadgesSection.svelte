<script lang="ts">
	import { Badge, Small } from '../../../index.js';

	const colours = ['blue', 'green', 'orange', 'pink', 'purple', 'amber', 'auto'] as const;
	const sizes = ['x-small', 'small', 'medium', 'large'] as const;
</script>

<section>
	<h2>Badges and small text</h2>

	<div class="demo-row">
		{#each colours as colour (colour)}
			<Badge {colour}>{colour}</Badge>
		{/each}
	</div>

	<div class="demo-row">
		{#each sizes as size (size)}
			<Badge {size} colour="purple">{size}</Badge>
		{/each}
		<Badge colour="green" icon="check-circle">With icon</Badge>
		<Badge colour="pink" onClose={() => {}}>Closable</Badge>
		<Badge colour="blue" href="#">Link</Badge>
	</div>

	<div class="demo-row">
		<Small>Regular small text</Small>
		<Small colour="secondary">Secondary small text</Small>
	</div>
</section>
