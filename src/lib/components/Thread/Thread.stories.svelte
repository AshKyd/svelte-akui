<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// No `component`: the stories render the tags themselves, reading `size` from the controls.
	const { Story } = defineMeta({
		title: 'Components/Thread',
		parameters: { layout: 'padded' },
		argTypes: {
			collapsible: { control: { type: 'boolean' } },
			size: {
				control: { type: 'select' },
				options: ['small', 'medium', 'large']
			}
		},
		args: { size: 'medium', collapsible: true }
	});
</script>

<script lang="ts">
	import { Thread, ThreadItem, Message, Button } from '$lib/index.js';

	const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000);

	// Sample images from `static/`. Some avatars use initials, to show the fallback too.
	const photos = {
		bharath: '/bharath-kumar-csws9NlWGls-unsplash.jpg',
		faded: '/faded_gallery-SiAJGyR15Aw-unsplash.jpg',
		philip: '/philip-oroni-KbusKKAZ968-unsplash.jpg',
		puscas: '/puscas-adryan-48sADbm-Zvg-unsplash.jpg'
	};
</script>

{#snippet reactions()}
	<Button label="Reply" size="small" variant="ghost" />
	<Button label="Like" size="small" variant="ghost" />
{/snippet}

<Story name="Single message">
	{#snippet template(args)}
		<Thread size={args.size} collapsible={args.collapsible}>
			<ThreadItem avatar={{ src: photos.bharath, initials: 'MB', alt: 'Mabel Bramblewick' }}>
				<Message name="Mabel Bramblewick" username="@mabel" date={hoursAgo(2)} controls={reactions}>
					The council has approved the new toadstool bus shelter. Tea is on me.
				</Message>
			</ThreadItem>
		</Thread>
	{/snippet}
</Story>

<Story name="Long names truncate">
	{#snippet template(args)}
		<div style="max-width: 22rem">
			<Thread size={args.size} collapsible={args.collapsible}>
				<ThreadItem avatar={{ initials: 'AB' }}>
					<Message
						name="Archibald Fennelworth-Thistledown the Third"
						username="@archibald_of_the_hollow_oak_lane"
						date={hoursAgo(30)}
					>
						Names and handles shrink with an ellipsis before the date does.
					</Message>
				</ThreadItem>
			</Thread>
		</div>
	{/snippet}
</Story>

<Story name="Directly below (dots)">
	{#snippet template(args)}
		<Thread size={args.size} collapsible={args.collapsible}>
			<ThreadItem avatar={{ src: photos.faded, initials: 'PW', alt: 'Petunia Wick' }}>
				<Message name="Petunia Wick" username="@petunia" date={hoursAgo(5)}>
					Has anyone seen the village broomstick rota? It was on the noticeboard.
				</Message>
				{#snippet replies()}
					<ThreadItem>
						<Message name="Gus Pebblewhistle" username="@gus" date={hoursAgo(4)}>
							Pinned under the jam sale poster.
						</Message>
					</ThreadItem>
					<ThreadItem>
						<Message name="Petunia Wick" username="@petunia" date={hoursAgo(4)}>
							Found it, thank you!
						</Message>
					</ThreadItem>
					<ThreadItem>
						<Message name="Gus Pebblewhistle" username="@gus" date={hoursAgo(3)}>
							Anytime. Scones at four?
						</Message>
					</ThreadItem>
				{/snippet}
			</ThreadItem>
		</Thread>
	{/snippet}
</Story>

<Story name="Same-author follow-ups (header options)">
	{#snippet template(args)}
		<Thread size={args.size} collapsible={args.collapsible}>
			<ThreadItem avatar={{ src: photos.puscas, initials: 'TF', alt: 'Tansy Fiddlewick' }}>
				<Message name="Tansy Fiddlewick" username="@tansy" date={hoursAgo(3)} header="full">
					Notes from tonight's hedge-trimming committee, in three parts.
				</Message>
				{#snippet replies()}
					<ThreadItem>
						<!-- Posted minutes after the last one: no header row, text level with the dot. -->
						<Message name="Tansy Fiddlewick" username="@tansy" date={hoursAgo(2.95)} header="none">
							One: the hedge has agreed to be trimmed, provided nobody mentions the topiary swan.
						</Message>
					</ThreadItem>
					<ThreadItem>
						<!-- Posted much later: the dot stays and only the date shows. -->
						<Message name="Tansy Fiddlewick" username="@tansy" date={hoursAgo(1)} header="date">
							Two: the swan has been told, and is taking it well.
						</Message>
					</ThreadItem>
				{/snippet}
			</ThreadItem>
		</Thread>
	{/snippet}
</Story>

<Story name="Indented replies branch">
	{#snippet template(args)}
		<Thread size={args.size} collapsible={args.collapsible}>
			<ThreadItem avatar={{ src: photos.philip, initials: 'OH', alt: 'Odette Hearthstone' }} replyCount={3}>
				<Message name="Odette Hearthstone" username="@odette" date={hoursAgo(9)} controls={reactions}>
					Proposal: the allotment gnomes get a union representative.
				</Message>
				{#snippet replies()}
					<ThreadItem indent avatar={{ src: photos.puscas, initials: 'RT', alt: 'Rufus Tumblebrook' }}>
						<Message name="Rufus Tumblebrook" username="@rufus" date={hoursAgo(8)}>
							Seconded. They have been asking politely for years.
						</Message>
					</ThreadItem>
					<ThreadItem indent avatar={{ initials: 'LM' }}>
						<Message name="Lavinia Moss" username="@lavinia" date={hoursAgo(7)}>
							Only if the minutes are taken in rhyme.
						</Message>
					</ThreadItem>
					<ThreadItem indent avatar={{ src: photos.bharath, initials: 'WP', alt: 'Wilf Pottle' }}>
						<Message name="Wilf Pottle" username="@wilf" date={hoursAgo(6)}>
							I will bring biscuits to the vote.
						</Message>
					</ThreadItem>
				{/snippet}
			</ThreadItem>
		</Thread>
	{/snippet}
</Story>

<Story name="Mixed and deeply nested">
	{#snippet template(args)}
		<Thread size={args.size} collapsible={args.collapsible}>
			<ThreadItem avatar={{ src: photos.faded, initials: 'IE', alt: 'Ivy Eldergrove' }}>
				<Message name="Ivy Eldergrove" username="@ivy" date={hoursAgo(20)} controls={reactions}>
					Who is hosting the midsummer lantern walk this year?
				</Message>
				{#snippet replies()}
					<ThreadItem indent avatar={{ src: photos.philip, initials: 'TH', alt: 'Thaddeus Hobb' }}>
						<Message name="Thaddeus Hobb" username="@thad" date={hoursAgo(19)}>
							The library can host. We have lanterns left from last time.
						</Message>
						{#snippet replies()}
							<ThreadItem>
								<Message name="Ivy Eldergrove" username="@ivy" date={hoursAgo(18)}>
									Wonderful. Do they still glow?
								</Message>
							</ThreadItem>
							<ThreadItem indent avatar={{ src: photos.philip, initials: 'TH', alt: 'Thaddeus Hobb' }}>
								<Message name="Thaddeus Hobb" username="@thad" date={hoursAgo(17)}>
									Mostly. One sulks when it rains.
								</Message>
								{#snippet replies()}
									<ThreadItem indent>
										<Message name="Nell Quickwater" username="@nell" date={hoursAgo(16)}>
											I will bring a tiny umbrella for it.
										</Message>
										{#snippet replies()}
											<ThreadItem indent avatar={{ initials: 'GP' }}>
												<Message name="Gus Pebblewhistle" username="@gus" date={hoursAgo(15)}>
													Fourth level down, and still polite.
												</Message>
											</ThreadItem>
										{/snippet}
									</ThreadItem>
								{/snippet}
							</ThreadItem>
						{/snippet}
					</ThreadItem>
					<ThreadItem indent avatar={{ initials: 'BF' }}>
						<Message name="Beatrix Fenwick" username="@bea" date={hoursAgo(14)}>
							I can do the route map and the snacks.
						</Message>
					</ThreadItem>
				{/snippet}
			</ThreadItem>
		</Thread>
	{/snippet}
</Story>

<Story name="Starts collapsed">
	{#snippet template(args)}
		<Thread size={args.size} collapsible={args.collapsible}>
			<ThreadItem avatar={{ src: photos.puscas, initials: 'CD', alt: 'Clementine Dapple' }} collapsed replyCount={2}>
				<Message name="Clementine Dapple" username="@clem" date={hoursAgo(3)}>
					Click the + circle to expand. Once expanded, click the line leading up to a reply to
					collapse that reply.
				</Message>
				{#snippet replies()}
					<ThreadItem indent avatar={{ src: photos.bharath, initials: 'FJ', alt: 'Finn Juniper' }}>
						<Message name="Finn Juniper" username="@finn" date={hoursAgo(2)}>First hidden reply.</Message>
					</ThreadItem>
					<ThreadItem indent avatar={{ initials: 'SR' }}>
						<Message name="Sorrel Reed" username="@sorrel" date={hoursAgo(1)}>Second hidden reply.</Message>
					</ThreadItem>
				{/snippet}
			</ThreadItem>
		</Thread>
	{/snippet}
</Story>
