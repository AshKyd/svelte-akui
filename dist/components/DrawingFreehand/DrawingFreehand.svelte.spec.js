import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DrawingFreehand from './DrawingFreehand.svelte';
import excalidrawSvg from './svgImport/__fixtures__/excalidraw-shapes.svg?raw';
/** Dispatches a synthetic pointer event at a point inside the viewport. */
function firePointer(viewport, type, { id = 1, x, y, pointerType = 'mouse', altKey = false, width = 1 }) {
    const rect = viewport.getBoundingClientRect();
    const event = new PointerEvent(type, {
        pointerId: id,
        pointerType,
        clientX: rect.left + x,
        clientY: rect.top + y,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        pressure: 0.5,
        width,
        height: width,
        altKey,
        bubbles: true,
        cancelable: true
    });
    viewport.dispatchEvent(event);
    return event;
}
/** Draws a diagonal line of several samples so perfect-freehand has enough points. */
function drawLine(viewport, id = 1, pointerType = 'mouse') {
    firePointer(viewport, 'pointerdown', { id, x: 100, y: 100, pointerType });
    Array.from({ length: 12 }, (_, i) => i + 1).forEach((i) => firePointer(viewport, 'pointermove', { id, x: 100 + i * 10, y: 100 + i * 6, pointerType }));
    firePointer(viewport, 'pointerup', { id, x: 220, y: 172, pointerType });
}
const mount = (props = {}) => {
    const screen = render(DrawingFreehand, props);
    const viewport = screen.container.querySelector('.drawing-freehand');
    return { screen, viewport };
};
describe('DrawingFreehand', () => {
    it('draws a stroke into the SVG layer and reports the change', async () => {
        const onchange = vi.fn();
        const { viewport } = mount({ onchange });
        drawLine(viewport);
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
        expect(onchange).toHaveBeenCalledTimes(1);
    });
    it('erases a stroke the eraser crosses, and undo brings it back', async () => {
        const { screen, viewport } = mount();
        drawLine(viewport);
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
        await screen.getByRole('button', { name: 'Eraser' }).click();
        firePointer(viewport, 'pointerdown', { id: 2, x: 160, y: 60 });
        firePointer(viewport, 'pointermove', { id: 2, x: 160, y: 200 });
        firePointer(viewport, 'pointerup', { id: 2, x: 160, y: 200 });
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(0));
        await screen.getByRole('button', { name: 'Undo' }).click();
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
    });
    it('moves a selected stroke, undoes the move, and erases it where it now sits', async () => {
        const { screen, viewport } = mount();
        drawLine(viewport);
        const strokePath = () => viewport.querySelector('svg.layer path')?.getAttribute('d');
        await vi.waitFor(() => expect(strokePath()).toBeTruthy());
        const originalPath = strokePath();
        // Press on the line (160, 136), drag it 200px down.
        await screen.getByRole('button', { name: 'Select' }).click();
        firePointer(viewport, 'pointerdown', { id: 2, x: 160, y: 136 });
        firePointer(viewport, 'pointermove', { id: 2, x: 160, y: 336 });
        firePointer(viewport, 'pointerup', { id: 2, x: 160, y: 336 });
        await vi.waitFor(() => expect(strokePath()).not.toBe(originalPath));
        expect(viewport.querySelectorAll('svg.selection rect.handle').length).toBe(8);
        await screen.getByRole('button', { name: 'Undo' }).click();
        await vi.waitFor(() => expect(strokePath()).toBe(originalPath));
        await screen.getByRole('button', { name: 'Redo' }).click();
        await vi.waitFor(() => expect(strokePath()).not.toBe(originalPath));
        // The old spot is empty now; the new one erases.
        await screen.getByRole('button', { name: 'Eraser' }).click();
        firePointer(viewport, 'pointerdown', { id: 3, x: 160, y: 100 });
        firePointer(viewport, 'pointermove', { id: 3, x: 160, y: 170 });
        firePointer(viewport, 'pointerup', { id: 3, x: 160, y: 170 });
        expect(viewport.querySelectorAll('svg.layer path').length).toBe(1);
        firePointer(viewport, 'pointerdown', { id: 4, x: 160, y: 300 });
        firePointer(viewport, 'pointermove', { id: 4, x: 160, y: 370 });
        firePointer(viewport, 'pointerup', { id: 4, x: 160, y: 370 });
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(0));
    });
    it('moves and resizes the selection from the keyboard, one undo step each', async () => {
        const { screen, viewport } = mount();
        drawLine(viewport);
        const strokePath = () => viewport.querySelector('svg.layer path')?.getAttribute('d');
        await vi.waitFor(() => expect(strokePath()).toBeTruthy());
        const originalPath = strokePath();
        await screen.getByRole('button', { name: 'Select' }).click();
        firePointer(viewport, 'pointerdown', { id: 2, x: 160, y: 136 });
        firePointer(viewport, 'pointerup', { id: 2, x: 160, y: 136 });
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.selection rect.handle').length).toBe(8));
        // Handles are tabbable and labelled.
        const edge = viewport.querySelector('[aria-label="Stretch right edge"]');
        expect(edge.getAttribute('tabindex')).toBe('0');
        edge.focus();
        edge.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await vi.waitFor(() => expect(strokePath()).not.toBe(originalPath));
        const stretchedPath = strokePath();
        const box = viewport.querySelector('svg.selection rect.box');
        box.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await vi.waitFor(() => expect(strokePath()).not.toBe(stretchedPath));
        await screen.getByRole('button', { name: 'Undo' }).click();
        await vi.waitFor(() => expect(strokePath()).toBe(stretchedPath));
        box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await vi.waitFor(() => expect(viewport.querySelector('svg.selection')).toBeNull());
    });
    it('opens a brush size menu when the pen is selected and picks a size', async () => {
        const { screen, viewport } = mount();
        expect(viewport.querySelector('[aria-label="Brush size"]')).toBeNull();
        await screen.getByRole('button', { name: 'Pen', exact: true }).click();
        await expect.element(screen.getByRole('group', { name: 'Brush size' })).toBeVisible();
        await screen.getByRole('button', { name: 'Brush size 6' }).click();
        await expect
            .element(screen.getByRole('button', { name: 'Brush size 6' }))
            .toHaveAttribute('aria-pressed', 'true');
        // Choosing a size must not leave a dot on the canvas.
        expect(viewport.querySelectorAll('svg.layer path').length).toBe(0);
        await screen.getByRole('button', { name: 'Eraser' }).click();
        expect(viewport.querySelector('[aria-label="Brush size"]')).toBeNull();
    });
    it('draws in the chosen swatch colour and saves it', async () => {
        const { screen, viewport } = mount();
        await screen.getByRole('button', { name: 'Pen', exact: true }).click();
        await screen.getByRole('button', { name: 'Blue' }).click();
        await expect
            .element(screen.getByRole('button', { name: 'Blue' }))
            .toHaveAttribute('aria-pressed', 'true');
        drawLine(viewport);
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
        expect(viewport.querySelector('svg.layer path').getAttribute('fill')).toBe('#1c7ed6');
        expect(screen.component.getSvg()).toContain('fill="#1c7ed6"');
    });
    it('offers a custom colour picker that sets the pen colour', async () => {
        const { screen, viewport } = mount();
        await screen.getByRole('button', { name: 'Pen', exact: true }).click();
        const picker = viewport.querySelector('input[type="color"]');
        picker.value = '#123456';
        picker.dispatchEvent(new Event('input', { bubbles: true }));
        drawLine(viewport);
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
        expect(viewport.querySelector('svg.layer path').getAttribute('fill')).toBe('#123456');
    });
    it('erases while Alt is held, without changing the selected tool', async () => {
        const { screen, viewport } = mount();
        drawLine(viewport);
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
        // The pen is selected. Alt on the press turns this drag into an erase across the stroke.
        firePointer(viewport, 'pointerdown', { id: 2, x: 160, y: 60, altKey: true });
        firePointer(viewport, 'pointermove', { id: 2, x: 160, y: 200, altKey: true });
        firePointer(viewport, 'pointerup', { id: 2, x: 160, y: 200, altKey: true });
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(0));
        await expect
            .element(screen.getByRole('button', { name: 'Pen', exact: true }))
            .toHaveAttribute('aria-pressed', 'true');
    });
    it('shows the eraser as active while Alt is down', async () => {
        const { screen } = mount();
        const eraser = screen.getByRole('button', { name: 'Eraser' });
        const accent = () => eraser.element().classList.contains('accent');
        expect(accent()).toBe(false);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
        await vi.waitFor(() => expect(accent()).toBe(true));
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }));
        await vi.waitFor(() => expect(accent()).toBe(false));
    });
    it('keeps the tool a stroke started with when Alt changes mid-drag', async () => {
        const { viewport } = mount();
        firePointer(viewport, 'pointerdown', { id: 1, x: 100, y: 100 });
        Array.from({ length: 12 }, (_, i) => i + 1).forEach((i) => firePointer(viewport, 'pointermove', { id: 1, x: 100 + i * 10, y: 100 + i * 6, altKey: true }));
        firePointer(viewport, 'pointerup', { id: 1, x: 220, y: 172, altKey: true });
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
    });
    it('selects the pointer with 1, the pen with 2 and the eraser with 3', async () => {
        const { screen } = mount();
        const pressed = (name) => screen.getByRole('button', { name, exact: true }).element().getAttribute('aria-pressed');
        const press = (key, init = {}) => window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));
        press('3');
        await vi.waitFor(() => expect(pressed('Eraser')).toBe('true'));
        expect(pressed('Pen')).toBe('false');
        press('1');
        await vi.waitFor(() => expect(pressed('Select')).toBe('true'));
        expect(pressed('Eraser')).toBe('false');
        press('2');
        await vi.waitFor(() => expect(pressed('Pen')).toBe('true'));
        expect(pressed('Select')).toBe('false');
    });
    it('ignores tool keys with a modifier, while repeating, or when typing in a field', async () => {
        const { screen } = mount();
        const pressed = (name) => screen.getByRole('button', { name, exact: true }).element().getAttribute('aria-pressed');
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', metaKey: true }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', altKey: true }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', repeat: true }));
        const field = document.createElement('input');
        document.body.append(field);
        field.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
        field.remove();
        await new Promise((resolve) => setTimeout(resolve, 30));
        expect(pressed('Pen')).toBe('true');
        expect(pressed('Eraser')).toBe('false');
    });
    it('reports whether anything is drawn', async () => {
        const { screen, viewport } = mount();
        const drawing = screen.component;
        expect(drawing.isEmpty()).toBe(true);
        drawLine(viewport);
        await vi.waitFor(() => expect(drawing.isEmpty()).toBe(false));
        drawing.clear();
        expect(drawing.isEmpty()).toBe(true);
    });
    it('opens an SVG from another app, fits it, and keeps it when saved again', async () => {
        const { screen, viewport } = mount({ svg: excalidrawSvg });
        await vi.waitFor(() => expect(viewport.querySelectorAll('.element').length).toBe(3));
        const saved = screen.component.getSvg();
        expect(saved.match(/<path /g)).toHaveLength(3);
        // The transform on the group (not the original markup) is what places it in the editor.
        expect(viewport.querySelector('svg.layer g').getAttribute('transform')).not.toBe('translate(0 0) scale(1)');
    });
    it('draws thicker strokes with a larger brush size', async () => {
        const strokeHeight = async (size) => {
            const { screen, viewport } = mount({ penSize: size });
            drawLine(viewport);
            await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
            const box = screen.container.querySelector('svg.layer path').getBBox();
            return box.height;
        };
        expect(await strokeHeight(12)).toBeGreaterThan(await strokeHeight(3));
    });
    it('zooms with two fingers moving apart', async () => {
        const { viewport } = mount();
        const scaleOf = () => viewport.querySelector('svg.layer g').getAttribute('transform');
        const before = scaleOf();
        firePointer(viewport, 'pointerdown', { id: 10, x: 100, y: 100, pointerType: 'touch' });
        firePointer(viewport, 'pointerdown', { id: 11, x: 140, y: 100, pointerType: 'touch' });
        firePointer(viewport, 'pointermove', { id: 11, x: 240, y: 100, pointerType: 'touch' });
        await vi.waitFor(() => expect(scaleOf()).not.toBe(before));
        expect(Number(scaleOf().match(/scale\(([\d.]+)\)/)[1])).toBeGreaterThan(1);
    });
    it('discards a stroke when a second finger lands', async () => {
        const { viewport } = mount();
        firePointer(viewport, 'pointerdown', { id: 20, x: 100, y: 100, pointerType: 'touch' });
        firePointer(viewport, 'pointermove', { id: 20, x: 130, y: 120, pointerType: 'touch' });
        firePointer(viewport, 'pointerdown', { id: 21, x: 200, y: 100, pointerType: 'touch' });
        firePointer(viewport, 'pointerup', { id: 20, x: 130, y: 120, pointerType: 'touch' });
        firePointer(viewport, 'pointerup', { id: 21, x: 200, y: 100, pointerType: 'touch' });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(viewport.querySelectorAll('svg.layer path').length).toBe(0);
    });
    it('prevents the default on pen and touch presses so Safari starts no selection drag', () => {
        const { viewport } = mount();
        expect(firePointer(viewport, 'pointerdown', { id: 30, x: 50, y: 50, pointerType: 'pen' })
            .defaultPrevented).toBe(true);
        firePointer(viewport, 'pointerup', { id: 30, x: 50, y: 50, pointerType: 'pen' });
    });
    it('ignores a palm-sized touch contact', async () => {
        const { viewport } = mount();
        firePointer(viewport, 'pointerdown', { id: 40, x: 100, y: 100, pointerType: 'touch', width: 90 });
        firePointer(viewport, 'pointermove', { id: 40, x: 160, y: 140, pointerType: 'touch', width: 90 });
        firePointer(viewport, 'pointerup', { id: 40, x: 160, y: 140, pointerType: 'touch', width: 90 });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(viewport.querySelectorAll('svg.layer path').length).toBe(0);
    });
    it('keeps a pen stroke going while two palm touches land', async () => {
        const { viewport } = mount();
        firePointer(viewport, 'pointerdown', { id: 50, x: 100, y: 100, pointerType: 'pen' });
        firePointer(viewport, 'pointerdown', { id: 51, x: 300, y: 200, pointerType: 'touch' });
        firePointer(viewport, 'pointerdown', { id: 52, x: 320, y: 210, pointerType: 'touch' });
        Array.from({ length: 12 }, (_, i) => i + 1).forEach((i) => firePointer(viewport, 'pointermove', {
            id: 50,
            x: 100 + i * 10,
            y: 100 + i * 6,
            pointerType: 'pen'
        }));
        firePointer(viewport, 'pointerup', { id: 50, x: 220, y: 172, pointerType: 'pen' });
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
    });
    it('lets the pen take over from a stroke a finger had started', async () => {
        const { viewport } = mount();
        firePointer(viewport, 'pointerdown', { id: 60, x: 300, y: 200, pointerType: 'touch' });
        drawLine(viewport, 61, 'pen');
        await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
    });
    it('loads a saved SVG and writes one back', async () => {
        const first = mount();
        drawLine(first.viewport);
        await vi.waitFor(() => expect(first.viewport.querySelectorAll('svg.layer path').length).toBe(1));
        const saved = first.screen.component.getSvg();
        const second = mount({ svg: saved });
        await vi.waitFor(() => expect(second.viewport.querySelectorAll('svg.layer path').length).toBe(1));
    });
});
