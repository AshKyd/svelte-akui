import { describe, it, expect } from 'vitest';
import { getRootScale, MAX_NODES, sanitiseChildren } from './sanitiseSvg';
import hostileSvg from './__fixtures__/hostile.svg?raw';
const parseRoot = (svg) => new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
const sanitise = (inner, skip) => sanitiseChildren(parseRoot(`<svg xmlns="http://www.w3.org/2000/svg">${inner}</svg>`), skip).map(({ node }) => node);
describe('sanitiseChildren', () => {
    it('keeps allowed shapes, groups and attributes', () => {
        const [group] = sanitise('<g transform="translate(1 2) rotate(45 3 4)" stroke="#e03131" stroke-width="2"><rect x="1" y="2" width="3" height="4" fill="none"/></g>');
        expect(group.getAttribute('transform')).toBe('translate(1 2) rotate(45 3 4)');
        expect(group.getAttribute('stroke')).toBe('#e03131');
        expect(group.querySelector('rect')?.getAttribute('width')).toBe('3');
    });
    it('drops tags outside the allow-list, with their subtree', () => {
        const nodes = sanitise('<script>x</script><style>a{}</style><use href="#a"/><text>t</text><image href="x.png"/><foreignObject/><defs><path d="M0 0 L1 1"/></defs><a><rect width="1" height="1"/></a><rect width="1" height="1"/>');
        expect(nodes.map((node) => node.localName)).toEqual(['rect']);
    });
    it('never keeps class, style, id, href or event handlers', () => {
        const [rect] = sanitise('<rect id="a" class="b" style="fill:red" onclick="x()" href="http://x" width="1" height="1"/>');
        expect([...rect.attributes].map(({ name }) => name)).toEqual(['width', 'height']);
    });
    it('drops attribute values that fail their check', () => {
        const [path] = sanitise('<path d="M0 0 L1 1 &quot;&gt;&lt;script" fill="url(#g)" stroke="red" transform="javascript:alert(1)" stroke-width="2px; evil"/>');
        expect([...path.attributes].map(({ name }) => name)).toEqual(['stroke']);
    });
    it('skips children the caller has already handled', () => {
        const nodes = sanitise('<rect width="1" height="1"/><circle r="1"/>', (child) => child.localName === 'rect');
        expect(nodes.map((node) => node.localName)).toEqual(['circle']);
    });
    it('caps the number of nodes', () => {
        const shapes = '<rect width="1" height="1"/>'.repeat(MAX_NODES + 50);
        expect(sanitise(shapes)).toHaveLength(MAX_NODES);
    });
    it('strips the hostile fixture down to one clean rect and an empty path', () => {
        const nodes = sanitiseChildren(parseRoot(hostileSvg)).map(({ node }) => node);
        const markup = nodes.map((node) => node.outerHTML).join('');
        expect(nodes.map((node) => node.localName)).toEqual(['rect', 'path']);
        expect(markup).not.toMatch(/script|style|onload|onclick|onmouseover|href|javascript|url\(|evil/i);
    });
});
describe('getRootScale', () => {
    it('is the width over the viewBox width', () => {
        expect(getRootScale(parseRoot('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 50"/>'))).toBe(2);
    });
    it('is 1 when either is missing or unusable', () => {
        const scale = (attributes) => getRootScale(parseRoot(`<svg xmlns="http://www.w3.org/2000/svg" ${attributes}/>`));
        expect(scale('width="200"')).toBe(1);
        expect(scale('viewBox="0 0 100 50"')).toBe(1);
        expect(scale('width="50%" viewBox="0 0 100 50" height="x"')).toBe(1);
        expect(scale('width="10" viewBox="0 0 0 0"')).toBe(1);
    });
});
