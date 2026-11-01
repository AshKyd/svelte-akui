/**
 * Width in px a cell needs to show its content without clipping, including the horizontal padding
 * of `paddedElement`.
 *
 * A `Range` over the contents is used instead of `scrollWidth` because it reports the content's own
 * width however wide the grid track currently is, so a column can shrink as well as grow.
 */
export function measureContentWidth(
	contentElement: HTMLElement,
	paddedElement: HTMLElement = contentElement
): number {
	const range = document.createRange();
	range.selectNodeContents(contentElement);
	const { paddingLeft, paddingRight } = getComputedStyle(paddedElement);
	const padding = Number.parseFloat(paddingLeft) + Number.parseFloat(paddingRight);
	// Ceil: a fractional width would clip the last pixel of text.
	return Math.ceil(range.getBoundingClientRect().width + padding);
}
