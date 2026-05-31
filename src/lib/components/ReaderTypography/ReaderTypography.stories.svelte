<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReaderTypography from './ReaderTypography.svelte';

	const { Story } = defineMeta({
		title: 'Components/ReaderTypography',
		component: ReaderTypography,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<ReaderTypography>
		<h1>The Rewilding Century</h1>
		<p>
			Across the northern hemisphere, a quiet revolution is taking root. Former farmland is being
			returned to nature, rivers are being allowed to meander again, and wolves are padding back
			into forests that have not heard their howl for generations.
		</p>
		<p>
			This is rewilding — and it is reshaping our understanding of what land is for. Not a
			nostalgic return to some imagined past, but a forward-looking recalibration of our
			relationship with the living world.
		</p>
		<h2>What does rewilding mean?</h2>
		<p>
			At its core, rewilding means stepping back. It means removing the controls we impose on
			ecosystems and allowing natural processes to reassert themselves. Sometimes it means
			reintroducing keystone species — beavers, lynx, bison — whose presence ripples through an
			entire food web.
		</p>
		<blockquote>
			<p>
				Nature is not a museum piece to be preserved behind glass. It is a living, breathing system
				that, given half a chance, will heal itself.
			</p>
			<p>— George Monbiot, <em>Feral</em></p>
		</blockquote>
		<h3>The role of large herbivores</h3>
		<p>
			Few forces shape a landscape as dramatically as a large grazing animal. Bison rolling in dust
			create hollows that fill with rain and become ponds. Deer browsing selectively allow certain
			trees to outcompete others. The movement of these animals is itself a form of land management
			— one that costs nothing and requires no tractor.
		</p>
		<ul>
			<li>European bison reintroduced in Kent, England (2022)</li>
			<li>Beaver populations recovering across Scotland and Wales</li>
			<li>Lynx feasibility studies underway in the Scottish Highlands</li>
		</ul>
		<figure>
			<img
				src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
				alt="A misty highland landscape with ancient pines"
			/>
		</figure>
		<h2>Rewilding and farming</h2>
		<p>
			The tension between rewilding and food production is real, but it is often overstated. Many
			rewilding projects occupy land that is marginal for agriculture — steep hillsides, flood
			plains, thin upland soils — where the economic case for farming was never strong.
		</p>
		<p>
			Where the two do collide, the conversation is getting more nuanced. Farmers are finding that
			healthy hedgerows reduce the need for pesticides. Wetlands buffer fields from flood. The
			ecosystem and the enterprise, it turns out, can be neighbours.
		</p>
		<pre><code>// Example: habitat connectivity score
const score = patches
  .filter(p =&gt; p.area &gt; MIN_VIABLE_AREA)
  .reduce((sum, p) =&gt; sum + p.connectivity, 0);</code></pre>
		<hr />
		<p>
			The work is slow, uncertain, and deeply hopeful. That may be exactly what this moment
			requires.
		</p>
	</ReaderTypography>
</Story>

<Story name="Koenig Cards (Ghost)">
	<ReaderTypography>
		<p>
			Ghost's Koenig editor produces structured card markup for rich embeds. Below are examples
			styled to fit the akui design system.
		</p>

		<h2>Bookmark card</h2>
		<p>A link preview with title, description, favicon, author metadata, and a thumbnail.</p>

		<figure class="kg-card kg-bookmark-card">
			<a
				class="kg-bookmark-container"
				href="https://www.rewildingmag.com/tir-natur-rewilding-farming-in-wales/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<div class="kg-bookmark-content">
					<div class="kg-bookmark-title">
						Can Farmers and Rewilders Get Along? This Welsh Group Thinks They Must
					</div>
					<div class="kg-bookmark-description">
						Tir Natur wants to help combat the biodiversity crisis by creating spaces where nature,
						farmers' livelihoods and Welsh culture can thrive – together.
					</div>
					<div class="kg-bookmark-metadata">
						<img
							class="kg-bookmark-icon"
							src="https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/icon/rewilding-icon-16f3fdb3ae433edd00d46a61292992f353b9014e36226bef8f3f8fe472362a0a.png"
							alt="Rewilding Magazine"
							loading="lazy"
						/>
						<span class="kg-bookmark-author">Rewilding Magazine</span>
						<span class="kg-bookmark-publisher">Sophie Knaus</span>
					</div>
				</div>
				<div class="kg-bookmark-thumbnail">
					<img
						src="https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/thumbnail/tir-natur-1-9447679e58d8494d4dfe8593c26cd9d7503568c8b908c1f724b4be702b91574b.jpg"
						alt="Tir Natur – rewilding and farming in Wales"
						loading="lazy"
					/>
				</div>
			</a>
		</figure>

		<h2>Gallery card</h2>
		<p>Multiple images in a row with an optional caption beneath.</p>

		<figure class="kg-card kg-gallery-card kg-width-wide kg-card-hascaption">
			<div class="kg-gallery-container">
				<div class="kg-gallery-row">
					<div class="kg-gallery-image">
						<img
							src="https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/2026/05/cattle.jpg"
							width="2000"
							height="1334"
							loading="lazy"
							alt="Native-breed Sussex cattle at Hinton Ampner"
							srcset="https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/size/w600/2026/05/cattle.jpg 600w, https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/size/w1000/2026/05/cattle.jpg 1000w, https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/size/w1600/2026/05/cattle.jpg 1600w"
							sizes="(min-width: 720px) 720px"
						/>
					</div>
					<div class="kg-gallery-image">
						<img
							src="https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/2026/05/hinton-ampner.jpg"
							width="2000"
							height="1334"
							loading="lazy"
							alt="Autumn in the garden at Hinton Ampner"
							srcset="https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/size/w600/2026/05/hinton-ampner.jpg 600w, https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/size/w1000/2026/05/hinton-ampner.jpg 1000w, https://storage.ghost.io/c/43/1e/431e5bbc-3d3b-46b3-95a6-27b14ca3b6fa/content/images/size/w1600/2026/05/hinton-ampner.jpg 1600w"
							sizes="(min-width: 720px) 720px"
						/>
					</div>
				</div>
			</div>
			<figcaption>
				<p>
					<em>Left: A native-breed Sussex cattle herd at Hinton Ampner. Photo: John Miller /
					<a href="https://www.nationaltrust.org.uk/" rel="noopener noreferrer" target="_blank">National Trust</a>.
					Right: Autumn in the garden at Hinton Ampner. Photo: Sophie Bolesworth /
					<a href="https://www.nationaltrust.org.uk/" rel="noopener noreferrer" target="_blank">National Trust</a>.</em>
				</p>
			</figcaption>
		</figure>

		<h2>Table (in figure wrapper)</h2>
		<p>Wide tables scroll horizontally; the label column stays pinned and doesn't wrap.</p>

		<figure class="wp-block-table has-small-font-size">
			<table>
				<thead>
					<tr>
						<th>Development Parameter</th>
						<th>Proposed Development</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Address</td><td>55 Wyandra Street, Teneriffe QLD 4005</td></tr>
					<tr><td>Application Number</td><td><a href="https://developmenti.brisbane.qld.gov.au/" target="_blank" rel="noopener noreferrer">A007026114</a></td></tr>
					<tr><td>Development Type</td><td>Residential Apartments</td></tr>
					<tr><td>Site Area</td><td>3,401 m²</td></tr>
					<tr><td>Height</td><td>15 storeys rising to 18 visible levels; stepping down to 8 storeys at Helen Street. 112 m high.</td></tr>
					<tr><td>Apartments</td><td>93 (2 × 2-bed, 18 × 3-bed, 73 × 4-bed)</td></tr>
					<tr><td>Car Parking</td><td>258 spaces (concealed waterproof basement)</td></tr>
					<tr><td>Bicycle Parking</td><td>117 spaces</td></tr>
					<tr><td>Developer</td><td>Cavcorp QLD Pty Ltd</td></tr>
					<tr><td>Architect</td><td>Plazibat Architects</td></tr>
					<tr><td>Town Planner</td><td>Town Planning Alliance</td></tr>
					<tr><td>Date Submitted</td><td>20 May 2026</td></tr>
					<tr><td>Assessment Level</td><td>Code Assessable</td></tr>
				</tbody>
			</table>
		</figure>

		<h2>Plain figure (image card)</h2>
		<p>A standalone figure gets the akui glow treatment.</p>

		<figure class="kg-card kg-image-card">
			<img
				src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"
				alt="Sunlight through an ancient forest"
				loading="lazy"
			/>
		</figure>

		<p>
			All card types integrate cleanly with the surrounding prose, maintaining consistent spacing
			and the akui visual language.
		</p>
	</ReaderTypography>
</Story>
