import { getStroke } from 'perfect-freehand';
import { buildStrokeElement, getSvgPathFromStroke } from '../elements/stroke/strokePath';
export function createPenTool(context) {
    let inputPoints = [];
    let strokeOptions = {};
    /** Fixed when the stroke starts, so changing colour mid-stroke can't split it. */
    let strokeColour;
    const reset = () => {
        inputPoints = [];
        context.requestRedraw();
    };
    return {
        id: 'pen',
        start({ world, pressure, pointerType }) {
            // Mouse and touch report a flat pressure, so only a real pen drives thickness.
            const isPen = pointerType === 'pen';
            strokeOptions = {
                size: context.getPenSize(),
                thinning: 0.5,
                smoothing: 0.5,
                streamline: 0.5,
                simulatePressure: !isPen
            };
            strokeColour = context.getPenColour();
            inputPoints = [[world[0], world[1], pressure]];
            context.requestRedraw();
        },
        move({ world, pressure }) {
            if (inputPoints.length === 0)
                return;
            inputPoints.push([world[0], world[1], pressure]);
            context.requestRedraw();
        },
        end() {
            if (inputPoints.length === 0)
                return;
            const element = buildStrokeElement(inputPoints, strokeOptions, crypto.randomUUID(), strokeColour);
            if (element) {
                context.store.add(element);
                context.notifyChange();
            }
            // The element is in the SVG layer now, so the canvas can empty in the same frame.
            reset();
        },
        cancel: reset,
        draw(canvas) {
            if (inputPoints.length === 0)
                return;
            const outline = getStroke(inputPoints, { ...strokeOptions, last: false });
            const d = getSvgPathFromStroke(outline);
            // The component sets the default ink as the fill; a chosen colour overrides it.
            if (strokeColour)
                canvas.fillStyle = strokeColour;
            if (d)
                canvas.fill(new Path2D(d));
        }
    };
}
