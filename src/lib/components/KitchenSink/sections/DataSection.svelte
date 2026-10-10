<script lang="ts">
	import {
		Table,
		Tree,
		FeedItemRow,
		RelativeTime,
		MarkdownContent,
		ReaderTypography,
		ImageMosaic,
		SwipeAction,
		Padding,
		type TableColumn,
		type TreeItemData
	} from '$lib/index.js';

	const columns: TableColumn[] = [
		{ key: 'name', label: 'Name', sortable: true },
		{ key: 'role', label: 'Role' },
		{ key: 'count', label: 'Count', align: 'right', sortable: true }
	];
	const rows = [
		{ name: 'Ada', role: 'Author', count: 12 },
		{ name: 'Brin', role: 'Editor', count: 7 },
		{ name: 'Cass', role: 'Reader', count: 31 }
	];

	const treeItems: TreeItemData[] = [
		{
			id: 'folder',
			label: 'Folder',
			isFolder: true,
			status: '2',
			children: [
				{ id: 'one', label: 'Child one', icon: 'file-text' },
				{ id: 'two', label: 'Child two', icon: 'file-text', status: '1' }
			]
		},
		{ id: 'loose', label: 'Loose item', icon: 'box' }
	];
	const expanded = new Set(['folder']);

	const mosaicItems = Array.from({ length: 6 }, (_, index) => ({
		id: index,
		colour: `hsl(${index * 55} 60% 55%)`
	}));

	const markdown = '### Markdown\n\nSome **bold**, *italic*, `code` and a [link](#).\n\n- List item\n- Another item';
</script>

<section>
	<h2>Data and content</h2>

	<div class="demo-row">
		<div class="demo-cell"><Table data={rows} {columns} /></div>
		<div class="demo-cell"><Tree items={treeItems} {expanded} /></div>
	</div>

	<h3>Feed rows</h3>
	<div class="demo-row">
		<div class="demo-cell">
			<FeedItemRow
				title="Compact feed row"
				excerpt="Short excerpt text for the row."
				tag="Tag"
				time="12m ago"
				icon="rss"
				unread
			/>
		</div>
		<div class="demo-cell">
			<FeedItemRow
				layout="hero"
				title="Hero feed row"
				excerpt="Short excerpt text for the row."
				tag="Tag"
				time="2h ago"
				active
				bookmarked
			/>
		</div>
	</div>

	<h3>Text, time and swipe</h3>
	<div class="demo-row">
		<div class="demo-cell"><MarkdownContent content={markdown} /></div>
		<div class="demo-cell">
			<ReaderTypography>
				<h3>Reader typography</h3>
				<p>Body copy rendered with reading-friendly spacing.</p>
			</ReaderTypography>
		</div>
		<div class="demo-cell">
			<RelativeTime date={new Date(Date.now() - 3_600_000)} />
			<RelativeTime date={new Date(Date.now() - 86_400_000 * 40)} />
		</div>
		<div class="demo-cell demo-box">
			<SwipeAction leftIcon="trash" rightIcon="archive">
				<Padding>Swipe me sideways</Padding>
			</SwipeAction>
		</div>
	</div>

	<h3>Mosaic</h3>
	<div class="demo-row">
		<div class="demo-cell">
			<ImageMosaic items={mosaicItems} minWidth="5rem" gap="0.5rem">
				{#snippet children(item)}
					<div style="background: {item.colour}; height: 5rem; border-radius: var(--akui-radius-m);"></div>
				{/snippet}
			</ImageMosaic>
		</div>
	</div>
</section>
