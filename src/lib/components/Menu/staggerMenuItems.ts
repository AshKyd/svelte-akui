/**
 * @file
 * Numbers a menu's items so CSS can stagger their opening animation.
 */

import type { Attachment } from 'svelte/attachments';

/**
 * Sets item index, reverse index, and count variables so CSS can stagger animations from the trigger.
 */
export const staggerMenuItems: Attachment<HTMLElement> = (surface) => {
	const items = [...surface.querySelectorAll<HTMLElement>(':scope [role="menu"] > *')];
	surface.style.setProperty('--akui-menu-item-count', String(items.length));
	items.forEach((item, index) => {
		item.style.setProperty('--akui-menu-item-index', String(index));
		item.style.setProperty('--akui-menu-item-index-reverse', String(items.length - 1 - index));
	});
};
