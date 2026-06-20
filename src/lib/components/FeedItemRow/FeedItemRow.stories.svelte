<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeedItemRow from './FeedItemRow.svelte';

	const { Story } = defineMeta({
		title: 'Components/FeedItemRow',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let storyBookmarked = $state(false);
</script>

<Story name="Default">
	<FeedItemRow
		title="Witch and feline familiar rescue stranded gnome from overgrown bramble-patch"
		excerpt="After a three-hour negotiation involving premium catnip and a very small ladder, the local rescue duo safely returned the gnome to the mossy glade."
		tag="Forest News"
		time="12m ago"
		href="#"
	/>
</Story>

<Story name="With Icon">
	<FeedItemRow
		title="New protective wards increase local toadstool density by 40%"
		excerpt="Wizards report that the latest batch of silver-ink wards has had an unexpected side-effect on the local fungal population, much to the delight of foragers."
		tag="Ecology"
		time="2h ago"
		icon="stars"
		href="#"
	/>
</Story>

<Story name="With Favicon">
	<FeedItemRow
		title="Local dragon sighted nap-curling atop the crystal peaks"
		excerpt="Observers recommend keeping a safe distance and bringing extra large blankets if planning a picnic near the summit this weekend."
		tag="Sightings"
		time="Just now"
		icon="/favicon.png"
		href="#"
	/>
</Story>

<Story name="With Image">
	<FeedItemRow
		fit="cover"
		title="The art of brewing perfectly shimmering moon-dew tea"
		excerpt="Learn the secrets of timing your kettle with the lunar cycle to achieve that elusive pearlescent glow in your morning brew."
		tag="Home & Hearth"
		time="Yesterday"
		image="/philip-oroni-KbusKKAZ968-unsplash.jpg"
		href="#"
	/>
</Story>

<Story name="Full Featured">
	<FeedItemRow
		fit="cover"
		title="Gnome-led initiative to restore ancient moss-pathways successful"
		excerpt="The community-driven project has successfully cleared the path to the Whispering Well, making it accessible to those with smaller strides."
		tag="Community"
		time="5m ago"
		icon="flower1"
		image="/bharath-kumar-csws9NlWGls-unsplash.jpg"
		href="#"
	/>
</Story>

<Story name="Active State">
	<FeedItemRow
		title="Local dragon sighted nap-curling atop the crystal peaks"
		excerpt="Observers recommend keeping a safe distance and bringing extra large blankets if planning a picnic near the summit this weekend."
		tag="Sightings"
		time="Just now"
		active={true}
		href="#"
	/>
</Story>

<Story name="Alternative Layout">
	<FeedItemRow
		fit="cover"
		title="Local divination group finds new meeting hall following unexpected fire"
		excerpt="Despite not seeing the disaster coming, the group has secured a lease on the old bell-tower, citing 'excellent acoustic vibrations' and 'favourable star-sight' as the primary reasons for the move."
		tag="Community News"
		time="3h ago"
		image="/faded_gallery-SiAJGyR15Aw-unsplash.jpg"
		href="#"
	/>
</Story>

<Story name="Hero Layout">
	<div style="max-width: 450px;">
		<FeedItemRow
			layout="hero"
			fit="cover"
			title="Ancient Forest Sanctuary discovered behind local bakery"
			excerpt="Staff at 'The Yeasty Wizard' were surprised to find that their flour storage closet actually opened into a 5,000-year-old enchanted woodland filled with glowing ferns."
			tag="Discovery"
			time="10m ago"
			image="/philip-oroni-KbusKKAZ968-unsplash.jpg"
			href="#"
		/>
	</div>
</Story>

<Story name="Hero Layout (Square Image)">
	<div style="max-width: 450px;">
		<FeedItemRow
			layout="hero"
			ratio="1 / 1"
			fit="cover"
			title="The Great Moss Migration begins in the Whispering Glade"
			excerpt="Thousands of clumps of sentient moss have begun their annual slow-motion trek towards the northern riverbanks. Local gnomes have set up 'soft-stepping' zones to ensure safe passage."
			tag="Nature"
			time="1h ago"
			image="/puscas-adryan-48sADbm-Zvg-unsplash.jpg"
			href="#"
		/>
	</div>
</Story>

<Story name="Hero Layout (Ultrawide)">
	<div style="max-width: 600px;">
		<FeedItemRow
			layout="hero"
			fit="cover"
			ratio="21 / 9"
			title="Starlight Cinema opens in the abandoned Quarry"
			excerpt="Using massive polished crystals as projectors, the new open-air theatre will show classic memories and shared dreams under the harvest moon."
			tag="Entertainment"
			time="45m ago"
			image="/puscas-adryan-48sADbm-Zvg-unsplash.jpg"
			href="#"
		/>
	</div>
</Story>

<Story name="No Group">
	<FeedItemRow
		title="The secret language of river-pebbles revealed in new research"
		excerpt="Leading geologists and nature-listeners have published a comprehensive guide to the subtle harmonics and rhythmic patterns found in ancient waterway stones."
		time="10m ago"
		href="#"
	/>
</Story>
<Story name="Read">
	<FeedItemRow
		title="The secret language of river-pebbles revealed in new research"
		excerpt="Leading geologists and nature-listeners have published a comprehensive guide to the subtle harmonics and rhythmic patterns found in ancient waterway stones."
		time="10m ago"
		unread={false}
		href="#"
	/>
</Story>

<Story name="Interactive Bookmark">
	<FeedItemRow
		title="Renovating the old drop tower: local cooperative begins clearing brambles"
		excerpt="Volunteers gathered with pruners and tea flasks to begin restoring the abandoned drop tower. Rumours of a friendly ghost residing on the third floor have not been confirmed."
		time="4h ago"
		bookmarked={storyBookmarked}
		onbookmark={() => {
			storyBookmarked = !storyBookmarked;
		}}
		href="#"
	/>
</Story>

<Story name="Bookmarked State">
	<FeedItemRow
		title="Town council allocates 300 gold pieces to pixie-light maintenance"
		excerpt="Following a heated debate on municipal spending, the council approved a budget prioritizing public pathway illumination over the proposed wizarding statue."
		time="15m ago"
		bookmarked={true}
		href="#"
	/>
</Story>

<Story name="Favicon and Bookmark Hover">
	<FeedItemRow
		title="Archmage Jarethan Kilgrave funds new library wing, denies influence-peddling rumours"
		excerpt="Kilgrave stated his donation was purely out of community goodwill and nothing to do with his pending zoning permit for the dark summoning circle."
		time="Yesterday"
		icon="stars"
		bookmarked={false}
		onbookmark={() => {}}
		href="#"
	/>
</Story>

<Story name="Content Only">
	<FeedItemRow
		excerpt="A cozy dragon was spotted taking a late afternoon nap on the roof of the town hall. The mayor has declared a temporary quiet hour to avoid waking the beast."
		time="30m ago"
		icon="wind"
		href="#"
	/>
</Story>

<Story name="Custom Line Clamp">
	<FeedItemRow
		title="Weekly Gnome Council Meeting: Discussion on proper mushroom-cap cleaning procedures, safety nets for runaway acorns, and a reminder that pixie dust is not a substitute for sugar in municipal tea pots."
		excerpt="The gnome council elder opened the meeting by emphasizing that municipal tea pots are sacred. Following a brief scuffle regarding the color of the new toadstool warning signs, the committee resolved to implement a mandatory acorn-polishing seminar. Residents are encouraged to bring their own polishing rags and elderberry cordial. Additionally, any pixie dust found in the kitchen will be confiscated immediately and returned to the nearest flowerbed."
		titleClamp={1}
		excerptClamp={4}
		time="10m ago"
		tag="Council"
		href="#"
	/>
</Story>

<Story name="No Line Clamp">
	<FeedItemRow
		title="The Grand Mushroom-Cap Championship of the Whispering Glades: A Detailed Retrospective of the Historical Rivalry Between the Moss-Hill Gnomes and the Clover-Valley Witches"
		excerpt="This year's contest saw unprecedented heights in spore-throwing accuracy and mushroom-stacking heights. The final round concluded under a beautiful triple moonbow, with both sides sharing a giant pot of herbal dandelion tea. While the Moss-Hill Gnomes claimed the silver tea-cozy, the Clover-Valley Witches were awarded the prize for best sportsmanship and most creative use of spell-assisted yeast. Everyone agreed the stakes were low, the tea was warm, and the gossip was exceptionally delightful."
		titleClamp="none"
		excerptClamp="none"
		time="2h ago"
		tag="Sports & Gossip"
		href="#"
	/>
</Story>

