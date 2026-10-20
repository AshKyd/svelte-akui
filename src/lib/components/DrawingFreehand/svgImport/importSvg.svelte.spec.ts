import { describe, it, expect } from 'vitest';
import { importedKind } from './importedElement';
import { importSvg } from './importSvg';
import excalidrawSvg from './__fixtures__/excalidraw-shapes.svg?raw';
import nestedSvg from './__fixtures__/nested-attributes.svg?raw';
import hostileSvg from './__fixtures__/hostile.svg?raw';
import inkscapeSvg from './__fixtures__/inkscape-styled.svg?raw';

const countHosts = () => document.querySelectorAll('body > svg[aria-hidden="true"]').length;

describe('importSvg: Excalidraw-shaped file', () => {
	const elements = importSvg(excalidrawSvg);
	const [freedraw, rectangle, line] = elements;

	it('imports one element per shape, in document order', () => {
		expect(elements).toHaveLength(3);
		const left = elements.map(({ bounds }) => bounds.minX);
		expect(left).toEqual([...left].sort((a, b) => a - b));
	});

	it('applies group transforms to the bounds', () => {
		// The freedraw path runs (0,0) to (60,30) under translate(10 10).
		expect(freedraw.bounds.minX).toBeCloseTo(10, 0);
		expect(freedraw.bounds.maxX).toBeCloseTo(70, 0);
		expect(freedraw.bounds.maxY).toBeCloseTo(40, 0);
		// The rough rectangle is about 100 by 60 under translate(40 60), plus half its stroke.
		expect(rectangle.bounds.minX).toBeCloseTo(39, 0);
		expect(rectangle.bounds.maxX).toBeCloseTo(141, 0);
		expect(rectangle.bounds.maxY).toBeCloseTo(121, 0);
	});

	it('turns near-black paint into theme ink and keeps other colours', () => {
		// Ink is left unset so it inherits the root's fill, or written as currentColor for strokes.
		expect(freedraw.markup).not.toContain('fill=');
		expect(rectangle.markup).toContain('stroke="currentColor"');
		expect(rectangle.markup).toContain('fill="none"');
		expect(rectangle.markup).toContain('stroke-linecap="round"');
		expect(line.markup).toContain('stroke="#e03131"');
		expect(line.markup).toContain('stroke-dasharray="8, 10"');
	});

	it('writes one flat node with a matrix and no groups, ids from the source or classes', () => {
		expect(rectangle.markup).toMatch(/^<path /);
		expect(rectangle.markup).toContain('transform="matrix(');
		expect(rectangle.markup).not.toMatch(/<g|class=|style=/);
	});

	it('erases a stroked shape by its outline, not its empty middle', () => {
		expect(importedKind.hitTest(rectangle, { from: [90, 50], to: [90, 70] }, 2)).toBe(true);
		expect(importedKind.hitTest(rectangle, { from: [90, 80], to: [91, 100] }, 2)).toBe(false);
	});

	it('erases a filled stroke where it crosses it', () => {
		expect(importedKind.hitTest(freedraw, { from: [40, 10], to: [40, 40] }, 2)).toBe(true);
		expect(importedKind.hitTest(freedraw, { from: [200, 200], to: [220, 220] }, 2)).toBe(false);
	});
});

describe('importSvg: nested attributes and a rescaled root', () => {
	const elements = importSvg(nestedSvg);
	const [rect, line, circle, ellipse, polygon, polyline] = elements;

	it('imports every shape tag and skips display:none groups', () => {
		expect(elements).toHaveLength(6);
		expect(elements.map(({ markup }) => markup).join('')).not.toContain('#ff0000');
	});

	it('scales by width over viewBox and composes nested transforms', () => {
		// Root is 200 wide for a 100 wide viewBox, so everything doubles. Stroke 2 becomes 4 wide.
		expect(rect.bounds.minX).toBeCloseTo(18, 0);
		expect(rect.bounds.maxX).toBeCloseTo(62, 0);
		expect(rect.bounds.minY).toBeCloseTo(8, 0);
		expect(rect.bounds.maxY).toBeCloseTo(32, 0);
		// The line is rotated 90 degrees inside the translated group: (10,5) down to (10,25), doubled.
		expect(line.bounds.minX).toBeCloseTo(18, 0);
		expect(line.bounds.maxX).toBeCloseTo(22, 0);
		expect(line.bounds.minY).toBeCloseTo(8, 0);
		expect(line.bounds.maxY).toBeCloseTo(52, 0);
		expect(circle.bounds.minX).toBeCloseTo(110, 0);
		expect(circle.bounds.maxX).toBeCloseTo(130, 0);
	});

	it('resolves inherited paint and group opacity', () => {
		expect(rect.markup).toContain('stroke="#e03131"');
		expect(rect.markup).toContain('fill="none"');
		expect(circle.markup).toContain('fill="#2f9e44"');
		expect(ellipse.markup).toContain('opacity="0.5"');
		expect(polygon.markup).toContain('fill="#f2b705"');
		expect(polyline.markup).toContain('stroke="currentColor"');
	});
});

describe('importSvg: hostile and unsupported input', () => {
	it('imports only the plain shape, and runs and loads nothing', () => {
		const styleTags = document.querySelectorAll('style').length;
		const hostsBefore = countHosts();

		const elements = importSvg(hostileSvg);

		expect(elements).toHaveLength(1);
		expect(elements[0].markup).not.toMatch(/onmouseover|style|class|href|javascript|url\(/i);
		expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
		expect(document.querySelectorAll('style').length).toBe(styleTags);
		expect(countHosts()).toBe(hostsBefore);
	});

	it('returns nothing for text that is not an SVG', () => {
		expect(importSvg('not xml')).toEqual([]);
		expect(importSvg('<html xmlns="http://www.w3.org/1999/xhtml"/>')).toEqual([]);
	});

	it('imports the geometry of a CSS-styled file and ignores the styles', () => {
		const elements = importSvg(inkscapeSvg);
		expect(elements.length).toBeGreaterThan(0);
		expect(elements.every(({ markup }) => !markup.includes('style='))).toBe(true);
		expect(countHosts()).toBe(0);
	});
});
