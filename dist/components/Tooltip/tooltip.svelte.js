/**
 * A Svelte 5 construct to manage tooltip state and positioning.
 * Returns reactive state and event handlers to be applied to a trigger element.
 */
export function createTooltip(options = {}) {
    const { position: preferredPosition = 'auto', offset = 8, touchOffset = 24 } = options;
    let visible = $state(false);
    let x = $state(0);
    let y = $state(0);
    let currentPosition = $state('top');
    function updatePosition(node, isTouch = false) {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const currentOffset = isTouch ? touchOffset : offset;
        let pos = preferredPosition;
        if (pos === 'auto') {
            // Simple auto-positioning logic
            if (rect.top > viewHeight / 2) {
                pos = 'top';
            }
            else {
                pos = 'bottom';
            }
            // Further refinement for horizontal edges if needed
            if (rect.left < 50)
                pos = 'right';
            else if (rect.right > viewWidth - 50)
                pos = 'left';
        }
        currentPosition = pos;
        switch (pos) {
            case 'top':
                x = centerX;
                y = rect.top - currentOffset;
                break;
            case 'bottom':
                x = centerX;
                y = rect.bottom + currentOffset;
                break;
            case 'left':
                x = rect.left - currentOffset;
                y = centerY;
                break;
            case 'right':
                x = rect.right + currentOffset;
                y = centerY;
                break;
        }
    }
    function show(event) {
        const node = event.currentTarget;
        const isTouch = 'touches' in event;
        updatePosition(node, isTouch);
        visible = true;
    }
    function hide() {
        visible = false;
    }
    return {
        get visible() { return visible; },
        get x() { return x; },
        get y() { return y; },
        get position() { return currentPosition; },
        handlers: {
            onmouseenter: show,
            onmouseleave: hide,
            onfocus: show,
            onblur: hide,
            ontouchstart: (e) => {
                // Prevent default to avoid virtual mouse events on some devices
                // but be careful not to break scrolling if it's not handled.
                show(e);
            },
            ontouchend: hide
        }
    };
}
