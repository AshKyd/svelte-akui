<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Draggable from './Draggable.svelte';
	import DropTarget from '../DropTarget/DropTarget.svelte';
	import Masonry from '../Masonry/Masonry.svelte';
	import LayoutContentWidth from '../LayoutContentWidth/LayoutContentWidth.svelte';
	import type { DragPayload } from '../../hooks/dropManager.svelte.js';

	const { Story } = defineMeta({
		title: 'Components/Draggable',
		tags: ['autodocs']
	});

	interface Bake {
		id: string;
		name: string;
		note: string;
	}

	const rack: Bake[] = [
		{ id: 'bake-1', name: 'Acorn-flour cob', note: 'still warm' },
		{ id: 'bake-2', name: 'Bramble-jam plait', note: 'sticky' },
		{ id: 'bake-3', name: 'Thistledown milk bun', note: 'very soft' },
		{ id: 'bake-4', name: 'Hearthstone rye', note: 'dense crumb' }
	];
</script>

<script lang="ts">
	let doorstep = $state<string[]>([]);
	let almswindow = $state<string[]>([]);
	let pending = $state<Bake[]>(rack.map((b) => ({ ...b })));

	function deliver(list: 'doorstep' | 'almswindow', payload: DragPayload) {
		const bake = payload.data as Bake;
		pending = pending.filter((b) => b.id !== bake.id);
		if (list === 'doorstep') doorstep = [...doorstep, bake.name];
		else almswindow = [...almswindow, bake.name];
	}

	function resetRound() {
		pending = rack.map((b) => ({ ...b }));
		doorstep = [];
		almswindow = [];
	}

	// "Reorder the tray" — a self-contained sortable list built from Draggable + per-item DropTarget.
	let tray = $state<Bake[]>(rack.map((b) => ({ ...b })));

	function swap(draggedId: string, targetId: string) {
		const from = tray.findIndex((b) => b.id === draggedId);
		const to = tray.findIndex((b) => b.id === targetId);
		if (from < 0 || to < 0 || from === to) return;
		const next = [...tray];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		tray = next;
	}
</script>

{#snippet doorstepBox(title: string, contents: string[], accepts: boolean)}
	<DropTarget
		canDrop={() => true}
		ondrop={(payload) => deliver(accepts ? 'doorstep' : 'almswindow', payload)}
	>
		{#snippet children({ isOver, canDrop })}
			<div
				style="
					border: 2px dashed {isOver && canDrop ? 'var(--akui-fg-accent, #2563eb)' : 'var(--akui-border)'};
					background: {isOver && canDrop ? 'var(--akui-bg-secondary)' : 'var(--akui-bg)'};
					border-radius: 12px;
					padding: 16px;
					min-height: 160px;
					transition: all 0.15s ease;
				"
			>
				<div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 8px;">{title}</div>
				{#if contents.length === 0}
					<div style="font-size: 0.8rem; color: var(--akui-fg-secondary);">
						Nothing delivered yet
					</div>
				{:else}
					<ul style="margin: 0; padding-left: 18px; font-size: 0.85rem;">
						{#each contents as name (name)}
							<li>{name}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/snippet}
	</DropTarget>
{/snippet}

{#snippet bakeCard(bake: Bake, wobble: boolean, delta: { x: number; y: number })}
	<div
		style="
			background: var(--akui-bg);
			border: 1px solid var(--akui-border);
			border-radius: 8px;
			padding: 12px 14px;
			cursor: grab;
			transform: rotate({wobble ? Math.max(-6, Math.min(6, delta.x / 12)) : 0}deg);
		"
	>
		<div style="font-weight: 600; font-size: 0.9rem;">{bake.name}</div>
		<div style="font-size: 0.8rem; color: var(--akui-fg-secondary);">{bake.note}</div>
	</div>
{/snippet}

<Story name="Deliver the bakes">
	<LayoutContentWidth
		size="large"
		style="display: flex; flex-direction: column; gap: 16px; padding: 20px;"
	>
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<p style="margin: 0; color: var(--akui-fg-secondary); font-size: 0.9rem;">
				Drag a bake from the cooling rack onto a doorstep. The card follows the cursor and wobbles
				with <code>delta</code>; releasing over nothing snaps it back.
			</p>
			<button
				style="padding: 6px 14px; border-radius: 6px; border: 1px solid var(--akui-border); background: var(--akui-bg); cursor: pointer;"
				onclick={resetRound}
			>
				New round
			</button>
		</div>
		<div
			style="display: grid; grid-template-columns: 1fr 220px 220px; gap: 20px; align-items: start;"
		>
			<div style="display: flex; flex-direction: column; gap: 10px;">
				<div
					style="font-weight: 600; font-size: 0.85rem; text-transform: uppercase; color: var(--akui-fg-secondary);"
				>
					Cooling rack ({pending.length})
				</div>
				{#each pending as bake (bake.id)}
					<Draggable getPayload={() => ({ type: 'bake', data: bake })}>
						{#snippet children({ isDragging, delta })}
							{@render bakeCard(bake, isDragging, delta)}
						{/snippet}
					</Draggable>
				{/each}
			</div>
			{@render doorstepBox('Gnome-burrow doorstep', doorstep, true)}
			{@render doorstepBox('Riverbank almswindow', almswindow, false)}
		</div>
	</LayoutContentWidth>
</Story>

<Story name="Handle only">
	<LayoutContentWidth
		size="large"
		style="display: flex; flex-direction: column; gap: 16px; padding: 20px; max-width: 420px;"
	>
		<p style="margin: 0; color: var(--akui-fg-secondary); font-size: 0.9rem;">
			With <code>handleSelector=".loaf-tie"</code> only the little string tie starts a drag; the rest
			of the card stays clickable.
		</p>
		{#each rack as bake (bake.id)}
			<Draggable handleSelector=".loaf-tie" getPayload={() => ({ type: 'bake', data: bake })}>
				<div
					style="display: flex; align-items: center; gap: 12px; background: var(--akui-bg); border: 1px solid var(--akui-border); border-radius: 8px; padding: 12px 14px;"
				>
					<span
						class="loaf-tie"
						style="cursor: grab; font-size: 1.1rem; user-select: none;"
						title="Drag handle">⁚⁚</span
					>
					<div>
						<div style="font-weight: 600; font-size: 0.9rem;">{bake.name}</div>
						<button
							style="margin-top: 4px; font-size: 0.8rem; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--akui-border); background: var(--akui-bg); cursor: pointer;"
							onclick={() => alert(`Tasting note: ${bake.note}`)}
						>
							Taste
						</button>
					</div>
				</div>
			</Draggable>
		{/each}
	</LayoutContentWidth>
</Story>

<Story name="Ovens still cooling">
	<LayoutContentWidth
		size="large"
		style="display: flex; flex-direction: column; gap: 16px; padding: 20px; max-width: 420px;"
	>
		<p style="margin: 0; color: var(--akui-fg-secondary); font-size: 0.9rem;">
			The first two bakes are <code>disabled</code> — too hot to move — so a press just scrolls the page.
			The last two drag normally.
		</p>
		{#each rack as bake, i (bake.id)}
			<Draggable disabled={i < 2} getPayload={() => ({ type: 'bake', data: bake })}>
				<div
					style="
						background: var(--akui-bg);
						border: 1px solid var(--akui-border);
						border-radius: 8px;
						padding: 12px 14px;
						opacity: {i < 2 ? 0.55 : 1};
						cursor: {i < 2 ? 'not-allowed' : 'grab'};
					"
				>
					<div style="font-weight: 600; font-size: 0.9rem;">{bake.name}</div>
					<div style="font-size: 0.8rem; color: var(--akui-fg-secondary);">
						{i < 2 ? 'still cooling' : bake.note}
					</div>
				</div>
			</Draggable>
		{/each}
	</LayoutContentWidth>
</Story>

<Story name="Reorder the tray">
	<LayoutContentWidth
		size="large"
		style="display: flex; flex-direction: column; gap: 16px; padding: 20px;"
	>
		<p style="margin: 0; color: var(--akui-fg-secondary); font-size: 0.9rem;">
			The pattern <code>aknotes</code> uses for its note grid: each item is a
			<code>&lt;Draggable&gt;</code>
			wrapping a <code>&lt;DropTarget&gt;</code>; dropping one onto another reorders the list and
			Masonry animates the move.
		</p>
		<Masonry animate={true} items={tray} colWidth="minmax(200px, 1fr)" gridGap="12px">
			{#snippet itemSnippet(bake)}
				<Draggable dragScale={0.6} getPayload={() => ({ type: 'tray-bake', data: bake })}>
					<DropTarget
						canDrop={(payload) => payload.type === 'tray-bake' && payload.data.id !== bake.id}
						ondrop={(payload) => swap(payload.data.id, bake.id)}
					>
						{#snippet children({ isOver, canDrop })}
							<div
								style="
									background: var(--akui-bg);
									border: 1px solid var(--akui-border);
									border-radius: 8px;
									padding: 16px;
									cursor: grab;
									outline: {isOver && canDrop
									? '2px dashed var(--akui-fg-accent, #2563eb)'
									: '2px dashed transparent'};
									outline-offset: -2px;
								"
							>
								<div style="font-weight: 600; font-size: 0.9rem;">{bake.name}</div>
								<div style="font-size: 0.8rem; color: var(--akui-fg-secondary);">{bake.note}</div>
							</div>
						{/snippet}
					</DropTarget>
				</Draggable>
			{/snippet}
		</Masonry>
	</LayoutContentWidth>
</Story>
