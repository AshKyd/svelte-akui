import type { Snippet } from 'svelte';

export interface SettingsSection {
	/** Unique id, used as `selectedId` and for router paths. */
	id: string;
	/** Name shown in the tab, the mobile overview row and (by default) the detail header. */
	label: string;
	/** Optional icon name (Bootstrap Icon). */
	icon?: string;
	/** Optional one-line summary shown under the label in the mobile overview. */
	description?: string;
	/** Overrides `label` in the detail header. */
	title?: string;
	/** The section's settings content. */
	children: Snippet;
}
