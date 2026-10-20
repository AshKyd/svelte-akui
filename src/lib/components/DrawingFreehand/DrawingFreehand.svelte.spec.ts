import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DrawingFreehand from './DrawingFreehand.svelte';
import excalidrawSvg from './svgImport/__fixtures__/excalidraw-shapes.svg?raw';

/** Dispatches a synthetic pointer event at a point inside the viewport. */
function firePointer(
	viewport: Element,
	type: 'pointerdown' | 'pointermove' | 'pointerup',
	{
		id = 1,
		x,
		y,
		pointerType = 'mouse',
		altKey = false
	}: { id?: number; x: number; y: number; pointerType?: string; altKey?: boolean }
) {
	const rect = viewport.getBoundingClientRect();
	viewport.dispatchEvent(
		new PointerEvent(type, {
			pointerId: id,
			pointerType,
			clientX: rect.left + x,
			clientY: rect.top + y,
			button: 0,
			buttons: type === 'pointerup' ? 0 : 1,
			pressure: 0.5,
			altKey,
			bubbles: true
		})
	);
}

/** Draws a diagonal line of several samples so perfect-freehand has enough points. */
function drawLine(viewport: Element, id = 1, pointerType = 'mouse') {
	firePointer(viewport, 'pointerdown', { id, x: 100, y: 100, pointerType });
	Array.from({ length: 12 }, (_, i) => i + 1).forEach((i) =>
		firePointer(viewport, 'pointermove', { id, x: 100 + i * 10, y: 100 + i * 6, pointerType })
	);
	firePointer(viewport, 'pointerup', { id, x: 220, y: 172, pointerType });
}

const mount = (props: Record<string, unknown> = {}) => {
	const screen = render(DrawingFreehand, props);
	const viewport = screen.container.querySelector('.drawing-freehand')!;
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
		expect(viewport.querySelector('svg.layer path')!.getAttribute('fill')).toBe('#1c7ed6');
		expect((screen.component as unknown as { getSvg(): string }).getSvg()).toContain(
			'fill="#1c7ed6"'
		);
	});

	it('offers a custom colour picker that sets the pen colour', async () => {
		const { screen, viewport } = mount();
		await screen.getByRole('button', { name: 'Pen', exact: true }).click();

		const picker = viewport.querySelector('input[type="color"]') as HTMLInputElement;
		picker.value = '#123456';
		picker.dispatchEvent(new Event('input', { bubbles: true }));

		drawLine(viewport);
		await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
		expect(viewport.querySelector('svg.layer path')!.getAttribute('fill')).toBe('#123456');
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
		Array.from({ length: 12 }, (_, i) => i + 1).forEach((i) =>
			firePointer(viewport, 'pointermove', { id: 1, x: 100 + i * 10, y: 100 + i * 6, altKey: true })
		);
		firePointer(viewport, 'pointerup', { id: 1, x: 220, y: 172, altKey: true });

		await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
	});

	it('selects the pen with 1 and the eraser with 2', async () => {
		const { screen } = mount();
		const pressed = (name: string) =>
			screen.getByRole('button', { name, exact: true }).element().getAttribute('aria-pressed');
		const press = (key: string, init: KeyboardEventInit = {}) =>
			window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));

		press('2');
		await vi.waitFor(() => expect(pressed('Eraser')).toBe('true'));
		expect(pressed('Pen')).toBe('false');

		press('1');
		await vi.waitFor(() => expect(pressed('Pen')).toBe('true'));
		expect(pressed('Eraser')).toBe('false');
	});

	it('ignores 1 and 2 with a modifier, while repeating, or when typing in a field', async () => {
		const { screen } = mount();
		const pressed = (name: string) =>
			screen.getByRole('button', { name, exact: true }).element().getAttribute('aria-pressed');

		window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', metaKey: true }));
		window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', altKey: true }));
		window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', repeat: true }));

		const field = document.createElement('input');
		document.body.append(field);
		field.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
		field.remove();

		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(pressed('Pen')).toBe('true');
		expect(pressed('Eraser')).toBe('false');
	});

	it('reports whether anything is drawn', async () => {
		const { screen, viewport } = mount();
		const drawing = screen.component as unknown as { isEmpty(): boolean; clear(): void };
		expect(drawing.isEmpty()).toBe(true);

		drawLine(viewport);
		await vi.waitFor(() => expect(drawing.isEmpty()).toBe(false));

		drawing.clear();
		expect(drawing.isEmpty()).toBe(true);
	});

	it('opens an SVG from another app, fits it, and keeps it when saved again', async () => {
		const { screen, viewport } = mount({ svg: excalidrawSvg });
		await vi.waitFor(() => expect(viewport.querySelectorAll('.element').length).toBe(3));

		const saved = (screen.component as unknown as { getSvg(): string }).getSvg();
		expect(saved.match(/<path /g)).toHaveLength(3);
		// The transform on the group (not the original markup) is what places it in the editor.
		expect(viewport.querySelector('svg.layer g')!.getAttribute('transform')).not.toBe(
			'translate(0 0) scale(1)'
		);
	});

	it('draws thicker strokes with a larger brush size', async () => {
		const strokeHeight = async (size: number) => {
			const { screen, viewport } = mount({ penSize: size });
			drawLine(viewport);
			await vi.waitFor(() => expect(viewport.querySelectorAll('svg.layer path').length).toBe(1));
			const box = (
				screen.container.querySelector('svg.layer path') as SVGGraphicsElement
			).getBBox();
			return box.height;
		};
		expect(await strokeHeight(12)).toBeGreaterThan(await strokeHeight(3));
	});

	it('zooms with two fingers moving apart', async () => {
		const { viewport } = mount();
		const scaleOf = () => viewport.querySelector('svg.layer g')!.getAttribute('transform')!;
		const before = scaleOf();

		firePointer(viewport, 'pointerdown', { id: 10, x: 100, y: 100, pointerType: 'touch' });
		firePointer(viewport, 'pointerdown', { id: 11, x: 140, y: 100, pointerType: 'touch' });
		firePointer(viewport, 'pointermove', { id: 11, x: 240, y: 100, pointerType: 'touch' });

		await vi.waitFor(() => expect(scaleOf()).not.toBe(before));
		expect(Number(scaleOf().match(/scale\(([\d.]+)\)/)![1])).toBeGreaterThan(1);
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

	it('loads a saved SVG and writes one back', async () => {
		const first = mount();
		drawLine(first.viewport);
		await vi.waitFor(() =>
			expect(first.viewport.querySelectorAll('svg.layer path').length).toBe(1)
		);
		const saved = (first.screen.component as unknown as { getSvg(): string }).getSvg();

		const second = mount({ svg: saved });
		await vi.waitFor(() =>
			expect(second.viewport.querySelectorAll('svg.layer path').length).toBe(1)
		);
	});
});
