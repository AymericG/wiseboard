import * as svg from 'svg.js';

import { MathHelper, Vec2 } from '@app/core';

import { DiagramShape } from '@app/wireframes/model';

export class SvgEvent {
    constructor(
        public readonly event: MouseEvent | KeyboardEvent | MouseWheelEvent,
        public readonly position: Vec2,
        public readonly element?: Element | null,
        public readonly shape?: DiagramShape | null
    ) {
    }
}

export interface InteractionHandler {
    onDoubleClick?(event: SvgEvent, next: () => void): void;

    onClick?(event: SvgEvent, next: () => void): boolean;

    onMouseDown?(event: SvgEvent, next: () => void): void;

    onMouseDrag?(event: SvgEvent, next: () => void): void;

    onMouseUp?(event: SvgEvent, next: () => void): void;
    onMouseWheel?(event: SvgEvent, next: () => void): void;

    onKeyDown?(event: SvgEvent, next: () => void): void;
    onKeyUp?(event: SvgEvent, next: () => void): void;
}

const ROTATION_CONFIG = [
    { angle: 45,  cursor: 'ne-resize' },
    { angle: 90,  cursor: 'e-resize' },
    { angle: 135, cursor: 'se-resize' },
    { angle: 180, cursor: 's-resize' },
    { angle: 215, cursor: 'sw-resize' },
    { angle: 270, cursor: 'w-resize' },
    { angle: 315, cursor: 'nw-resize' }
];

const NOOP = () => { /* NOOP */ };

export class InteractionService {
    private readonly interactionHandlers: InteractionHandler[] = [];
    private isDragging = false;

    private supportsWheelEvent = false;

    constructor(
        private readonly adornerLayers: svg.Element[], renderings: svg.Element, private readonly diagram: svg.Doc
    ) {
        renderings.click((event: MouseEvent) => {
            this.invokeEvent(event, h => h.onClick ? h.onClick.bind(h) : null);
        });

        renderings.dblclick((event: MouseEvent) => {
            this.invokeEvent(event, h => h.onDoubleClick ? h.onDoubleClick.bind(h) : null);
        });

        diagram.mousemove((event: MouseEvent) => {
            this.onMouseMove(event);
        });

        document.getElementById('editor-view').addEventListener('mousedown', (event: MouseEvent) => {
            this.isDragging = true;
            this.invokeEvent(event, h => h.onMouseDown ? h.onMouseDown.bind(h) : null);
        });

        window.document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.invokeEvent(event, h => h.onKeyDown ? h.onKeyDown.bind(h) : null);
        });

        window.document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.invokeEvent(event, h => h.onKeyUp ? h.onKeyUp.bind(h) : null);
        });

        window.document.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.isDragging) {
                this.invokeEvent(event, h => h.onMouseDrag ? h.onMouseDrag.bind(h) : null);
            }
        });

        const onMouseWheel = (event: MouseWheelEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
            }
            if (event.type === 'wheel') {
                this.supportsWheelEvent = true;
            } else if (this.supportsWheelEvent) {
                return; // only execute once when both wheel and DOMMouseScroll are supported 
            }
            this.invokeEvent(event, h => h.onMouseWheel ? h.onMouseWheel.bind(h) : null);
        };
        // window.document.addEventListener('mousewheel', onMouseWheel);
        window.document.addEventListener('wheel', onMouseWheel, { passive: false });
        window.document.addEventListener('DOMMouseScroll', onMouseWheel, { passive: false });
        

        window.document.addEventListener('mouseup', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = false;

                this.invokeEvent(event, h => h.onMouseUp ? h.onMouseUp.bind(h) : null);
            }
        });
    }

    public addHandler(handler: InteractionHandler) {
        this.interactionHandlers.push(handler);
    }

    public removeHandler(handler: InteractionHandler) {
        this.interactionHandlers.splice(this.interactionHandlers.indexOf(handler), 1);
    }

    public setCursor(item: svg.Element, cursor: string) {
        item.node['cursor'] = cursor;
    }

    public setCursorAngle(item: svg.Element, angle: number) {
        item.node['cursorAngle'] = angle;
    }

    public showAdorners() {
        this.adornerLayers.forEach(l => l.show());
    }

    public hideAdorners() {
        this.adornerLayers.forEach(l => l.hide());
    }

    private invokeEvent(event: MouseEvent | KeyboardEvent, actionProvider: (handler: InteractionHandler) => Function) {
        if (this.interactionHandlers.length === 0) {
            return;
        }
        const handlers: Function[] = [];

        for (let i = this.interactionHandlers.length - 1; i >= 0; i--) {
            const handler = actionProvider(this.interactionHandlers[i]);

            if (handler) {
                handlers.push(handler);
            }
        }

        if (handlers.length === 0) {
            return;
        }
        let current: any = event.target;
        let element: any = null;

        while (current && current.parentElement) {
            current = current.parentElement;

            if (current.shape) {
                element = current;
                break;
            }
        }

        const isMouseEvent = event instanceof MouseEvent;
        let position: Vec2 = null;
        if (isMouseEvent) {
            const { x, y } = this.diagram.point((event as MouseEvent).pageX, (event as MouseEvent).pageY);
            position = new Vec2(x, y);
        }

        const svgEvent = new SvgEvent(event, position, element, element ? element.shape : null);

        let next = NOOP;

        for (let handler of handlers) {
            const currentNext = next;

            next = () => handler(svgEvent, currentNext);
        }

        next();
    }

    private onMouseMove = (event: MouseEvent) => {
        let element: any = event.target;

        if (element && element['cursor']) {
            document.body.style.cursor = element['cursor'];
        } else if (element && Number.isFinite(element['cursorAngle'])) {
            const rotation = element['cursorAngle'];

            const baseRotation = svg.adopt(element).transform().rotation;

            const totalRotation = MathHelper.toPositiveDegree((baseRotation || 0) + rotation);

            for (let config of ROTATION_CONFIG) {
                if (totalRotation > config.angle - 22.5 &&
                    totalRotation < config.angle + 22.5) {

                    document.body.style.cursor = config.cursor;
                    return;
                }
            }

            document.body.style.cursor = 'n-resize';
        } else {
            document.body.style.cursor = 'default';
        }
    }
}