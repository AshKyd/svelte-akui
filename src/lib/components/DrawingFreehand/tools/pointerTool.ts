import { getElementKind } from '../elements/registry';
import { IDENTITY_MATRIX, isIdentityMatrix, translateMatrix, type Matrix } from '../elements/matrix';
import type { DrawingElement, Point } from '../elements/types';
import { findHandle, handlePosition, resizeMatrix, type HandleId } from './selectionHandles';
import type { Tool, ToolContext } from './types';

/** Reach of a click when picking an element, in screen pixels so it feels the same at any zoom. */
const PICK_RADIUS_PX = 6;
/** Reach of a resize handle, a little larger than the handle is drawn. */
export const HANDLE_RADIUS_PX = 10;
/** Smallest a resized side can get, in screen pixels. */
export const MIN_SIZE_PX = 8;

type Drag =
	| { kind: 'move'; origin: Point }
	/** `offset` is where the handle sat relative to the press, so grabbing off-centre doesn't jump. */
	| { kind: 'resize'; handle: HandleId; offset: Point };

/**
 * Selects one element and moves or resizes it. While dragging only a preview matrix changes
 * (the component applies it as an SVG transform). On release the matrix is baked into the
 * element's own geometry as one undo step, so erasing and saving always see real positions.
 */
export function createPointerTool(context: ToolContext): Tool {
	let drag: Drag | null = null;
	let element: DrawingElement | undefined;
	let matrix: Matrix = IDENTITY_MATRIX;

	const reset = () => {
		drag = null;
		element = undefined;
		matrix = IDENTITY_MATRIX;
		context.setPreview(null);
	};

	return {
		id: 'pointer',

		start({ world }) {
			const scale = context.getScale();
			const selectedId = context.getSelectedId();
			const selected = selectedId ? context.store.get(selectedId) : undefined;

			// Handles are only live on the current selection, and win over picking beneath them.
			const handle = selected && findHandle(selected.bounds, world, HANDLE_RADIUS_PX / scale);
			if (selected && handle) {
				const [handleX, handleY] = handlePosition(handle, selected.bounds);
				element = selected;
				drag = { kind: 'resize', handle, offset: [handleX - world[0], handleY - world[1]] };
				return;
			}

			// Overlapping shapes: keep the selection if it is under the pointer, else take the topmost.
			const hits = context.store.findHits({ from: world, to: world }, PICK_RADIUS_PX / scale);
			const pickedId = selectedId && hits.includes(selectedId) ? selectedId : hits.at(-1);
			context.setSelectedId(pickedId);
			element = pickedId ? context.store.get(pickedId) : undefined;
			if (element) drag = { kind: 'move', origin: world };
		},

		move({ world }) {
			if (!drag || !element) return;
			matrix =
				drag.kind === 'move'
					? translateMatrix(world[0] - drag.origin[0], world[1] - drag.origin[1])
					: resizeMatrix(
							drag.handle,
							element.bounds,
							[world[0] + drag.offset[0], world[1] + drag.offset[1]],
							MIN_SIZE_PX / context.getScale()
						);
			context.setPreview({
				id: element.id,
				matrix,
				handle: drag.kind === 'resize' ? drag.handle : undefined
			});
		},

		end() {
			// A plain click only selects.
			if (element && !isIdentityMatrix(matrix)) {
				context.store.replace(getElementKind(element.type).transform(element, matrix));
				context.notifyChange();
			}
			reset();
		},

		cancel: reset,

		// The selection box and handles are SVG in the component, so the live canvas has nothing to paint.
		draw() {}
	};
}
