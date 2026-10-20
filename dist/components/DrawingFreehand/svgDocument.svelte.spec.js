import { describe, it, expect } from 'vitest';
import { elementsToSvg, svgToElements } from './svgDocument';
import { buildStrokeElement } from './elements/stroke/strokePath';
import excalidrawSvg from './svgImport/__fixtures__/excalidraw-shapes.svg?raw';
const makeStroke = (id, offset) => buildStrokeElement(Array.from({ length: 12 }, (_, i) => [i * 6 + offset, i * 2, 0.5]), { size: 4 }, id);
describe('svg document', () => {
    it('round-trips strokes through plain SVG', () => {
        const strokes = [makeStroke('a', 0), makeStroke('b', 50)];
        const loaded = svgToElements(elementsToSvg(strokes));
        expect(loaded.map((element) => element.id)).toEqual(['a', 'b']);
        expect(loaded[0].d).toBe(strokes[0].d);
        expect(loaded[1].bounds).toEqual(strokes[1].bounds);
    });
    it('keeps a stroke colour as a standard fill attribute', () => {
        const coloured = buildStrokeElement(Array.from({ length: 12 }, (_, i) => [i * 6, i * 2, 0.5]), { size: 4 }, 'red-line', '#e03131');
        const svg = elementsToSvg([coloured, makeStroke('plain', 50)]);
        expect(svg).toContain('fill="#e03131"');
        const [loadedRed, loadedPlain] = svgToElements(svg);
        expect(loadedRed.colour).toBe('#e03131');
        expect(loadedPlain.colour).toBeUndefined();
    });
    it('ignores unsafe colours and path data from untrusted SVGs', () => {
        const loaded = svgToElements('<svg xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M0,0 Q5,0 10,0 T20,0 30,0 Z" fill="red&quot; onload=&quot;x"/>' +
            '<path d="M0,0 Q5,0 10,0 T20,0 &quot;&gt;&lt;script Z"/>' +
            '</svg>');
        expect(loaded).toHaveLength(1);
        expect(loaded[0].colour).toBeUndefined();
    });
    it('writes standard attributes only', () => {
        const svg = elementsToSvg([makeStroke('a', 0)]);
        expect(svg).not.toContain('data-');
        expect(svg).toContain('viewBox=');
        expect(svg).toContain('supports-dark-mode');
    });
    it('skips unsupported nodes and non-SVG input', () => {
        expect(svgToElements('<svg xmlns="http://www.w3.org/2000/svg"><text>hi</text><path/></svg>')).toEqual([]);
        expect(svgToElements('not xml')).toEqual([]);
    });
    it('loads our own strokes and imported shapes together, in document order', () => {
        const own = makeStroke('own', 0);
        const loaded = svgToElements('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">' +
            `<path id="first" d="${own.d}"/>` +
            '<rect x="10" y="10" width="20" height="20" fill="#2f9e44"/>' +
            `<path id="last" d="${own.d}" fill="#e03131"/>` +
            '</svg>');
        expect(loaded.map((element) => element.type)).toEqual(['stroke', 'imported', 'stroke']);
        expect(loaded.map((element) => element.id)[0]).toBe('first');
        expect(loaded[2].colour).toBe('#e03131');
    });
    it('sends a path with a transform or stroke to the importer, so nothing is dropped', () => {
        const own = makeStroke('own', 0);
        const [element] = svgToElements(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${own.d}" transform="translate(50 0)"/></svg>`);
        expect(element.type).toBe('imported');
        expect(element.bounds.minX).toBeGreaterThan(own.bounds.minX + 40);
    });
    it('imports every node when the root rescales its viewBox', () => {
        const own = makeStroke('own', 0);
        const [element] = svgToElements(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200"><path d="${own.d}"/></svg>`);
        expect(element.type).toBe('imported');
        expect(element.bounds.maxX).toBeCloseTo(own.bounds.maxX * 2, 0);
    });
    it('round-trips imported shapes through our own saved SVG without moving them', () => {
        const first = svgToElements(excalidrawSvg);
        const saved = elementsToSvg(first);
        const second = svgToElements(saved);
        expect(saved).toContain('color="#1e1e1e"');
        expect(saved).not.toMatch(/<g|<style|<script/);
        expect(second).toHaveLength(first.length);
        second.forEach((element, index) => {
            expect(element.type).toBe('imported');
            expect(element.bounds.minX).toBeCloseTo(first[index].bounds.minX, 0);
            expect(element.bounds.maxY).toBeCloseTo(first[index].bounds.maxY, 0);
        });
        expect(second[1].markup).toContain('stroke="currentColor"');
    });
});
