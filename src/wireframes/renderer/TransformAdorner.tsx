import * as React from 'react';
import * as svg from 'svg.js';

import { Rotation, Vec2 } from '@app/core';

import {
    Diagram,
    DiagramItem,
    DiagramShape,
    SnapManager,
    Transform
} from '@app/wireframes/model';

import {
    ArrangeMenuContainer,
    LayoutMenuContainer
} from '@app/wireframes/components';

import { InteractionOverlays } from './interaction-overlays';

import {
    InteractionHandler,
    InteractionService,
    SvgEvent
} from './interaction-service';

import { SVGRenderer } from '@app/wireframes/shapes/utils/svg-renderer';

const MODE_RESIZE = 2;
const MODE_MOVE = 3;
const MODE_ROTATE = 1;

const TRANSFORMER_STROKE_COLOR = '#ccc';
const TRANSFORMER_FILL_COLOR = '#fff';

export interface TransformAdornerProps {
    // The current zoom value.
    zoom: number;

    // The view size of the editor.
    viewSize: Vec2;

    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // A function to transform a set of items.
    transformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => void;
}

export class TransformAdorner extends React.Component<TransformAdornerProps> implements InteractionHandler {
    private renderer: SVGRenderer;
    private transform: Transform;
    private startTransform: Transform;
    private allElements: svg.Element[];
    private overlays: InteractionOverlays;
    private canResizeX: boolean;
    private canResizeY: boolean;
    private manipulated = false;
    private manipulationMode = 0;
    private moveShape: any;
    private dragStart: Vec2;
    private rotation: Rotation;
    private rotateShape: any;
    private resizeDragOffset: Vec2;
    private resizeShapes: any[] = [];
    private snapManager = new SnapManager();

    public componentWillMount() {
        this.renderer = new SVGRenderer();
        this.renderer.captureContext(this.props.adorners);

        this.createRotateShape();
        this.createMoveShape();
        this.createResizeShapes();

        this.allElements = [...this.resizeShapes, this.moveShape, this.rotateShape];

        this.props.interactionService.addHandler(this);

        this.overlays = new InteractionOverlays(this.props.adorners);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);
    }

    public componentWillReceiveProps(nextProps: TransformAdornerProps) {
        if (this.props.selectedDiagram.selectedItemIds !== nextProps.selectedDiagram.selectedItemIds) {
            this.rotation = Rotation.ZERO;
        }

        this.manipulationMode = 0;
        this.manipulated = false;

        if (this.hasSelection(nextProps.selectedItems)) {
            this.calculateInitializeTransform(nextProps.selectedItems, nextProps.selectedDiagram);
            this.calculateResizeRestrictions(nextProps.selectedItems);
            this.layoutShapes();
        } else {
            this.hideShapes();
        }
    }

    private hasSelection(selectedItems: DiagramItem[]): boolean {
        return selectedItems.length > 0;
    }

    private calculateInitializeTransform(selectedItems: DiagramItem[], selectedDiagram: Diagram) {
        let transform: Transform;

        if (selectedItems.length === 1) {
            transform = selectedItems[0].bounds(selectedDiagram);
        } else {
            transform = Transform.createFromTransformationsAndRotations(selectedItems.map(x => x.bounds(selectedDiagram)), this.rotation);
        }

        this.transform = transform;
    }

    private calculateResizeRestrictions(selectedItems: DiagramItem[]) {
        this.canResizeX = false;
        this.canResizeY = false;

        for (let item of selectedItems) {
            if (item instanceof DiagramShape) {
                if (item.constraint) {
                    if (!item.constraint.calculateSizeX()) {
                        this.canResizeX = true;
                    }

                    if (!item.constraint.calculateSizeY()) {
                        this.canResizeY = true;
                    }
                    continue;
                }
            }
            this.canResizeX = true;
            this.canResizeY = true;
        }
    }

    public onMouseDown(event: SvgEvent, next: () => void) {
        if (event.event.ctrlKey) {
            return next();
        }

        let hitItem = this.hitTest(event.position);

        if (!hitItem) {
            next();
        }

        hitItem = this.hitTest(event.position);

        if (!hitItem) {
            this.manipulationMode = 0;
            return;
        }

        this.manipulated = false;

        if (hitItem === this.moveShape) {
            this.manipulationMode = MODE_MOVE;
        } else if (hitItem === this.rotateShape) {
            this.manipulationMode = MODE_ROTATE;
        } else {
            this.manipulationMode = MODE_RESIZE;

            this.resizeDragOffset = hitItem['offset'];
        }

        this.dragStart = event.position;

        this.startTransform = this.transform;
    }

    private hitTest(point: Vec2) {
        if (!this.transform) {
            return null;
        }

        const unrotated = Vec2.rotated(point, this.transform.position, this.transform.rotation.negate());

        for (let element of this.allElements) {
            const box = this.renderer.getBounds(element, true);

            if (box.contains(unrotated)) {
                return element;
            }
        }

        return null;
    }

    public onMouseDrag(event: SvgEvent, next: () => void) {
        if (this.manipulationMode === 0 || !this.dragStart) {
            return next();
        }

        this.overlays.reset();

        const delta = event.position.sub(this.dragStart);

        if (delta.lengtSquared === 0) {
            return;
        }

        if (this.manipulationMode !== 0) {
            this.manipulated = true;

            if (this.manipulationMode === MODE_MOVE) {
                this.move(delta, event.event.shiftKey);
            } else if (this.manipulationMode === MODE_ROTATE) {
                this.rotate(event, event.event.shiftKey);
            } else {
                this.resize(delta, event.event.shiftKey);
            }

            this.layoutShapes();
        }
    }

    private move(delta: Vec2, shiftKey: boolean) {
        const snapResult =
            this.snapManager.snapMoving(this.props.selectedDiagram, this.props.viewSize, this.startTransform, delta, shiftKey);

        this.transform = this.startTransform.moveBy(snapResult.delta);

        this.overlays.showSnapAdorners(snapResult);

        const x = Math.round(this.transform.aabb.x);
        const y = Math.round(this.transform.aabb.y);

        this.overlays.showInfo(this.transform, `X: ${x}, Y: ${y}`);
    }

    private rotate(event: SvgEvent, shiftKey: boolean) {
        const delta = this.getCummulativeRotation(event);

        const deltaRotation =
            this.snapManager.snapRotating(this.startTransform, delta, shiftKey);

        this.transform = this.startTransform.rotateBy(Rotation.fromDegree(deltaRotation));

        this.overlays.showInfo(this.transform, `Y: ${this.transform.rotation.degree}°`);
    }

    private getCummulativeRotation(event: SvgEvent): number {
        const center = this.startTransform.position;

        const eventPoint = event.position;
        const eventStart = this.dragStart;

        const cummulativeRotation = Vec2.angleBetween(eventStart.sub(center), eventPoint.sub(center));

        return cummulativeRotation;
    }

    private resize(delta: Vec2, shiftKey: boolean) {
        const startRotation = this.startTransform.rotation;

        const deltaSize = this.getResizeDeltaSize(startRotation, delta, shiftKey);
        const deltaPos = this.getResizeDeltaPos(startRotation, deltaSize);

        this.transform = this.startTransform.resizeAndMoveBy(deltaSize, deltaPos);

        const w = Math.round(this.transform.size.x);
        const h = Math.round(this.transform.size.y);

        this.overlays.showInfo(this.transform, `Width: ${w}, Height: ${h}`);
    }

    private getResizeDeltaSize(angle: Rotation, cummulativeTranslation: Vec2, shiftKey: boolean) {
        const delta = Vec2.rotated(cummulativeTranslation.mul(2), Vec2.ZERO, angle.negate()).mul(this.resizeDragOffset);

        const snapResult =
            this.snapManager.snapResizing(this.props.selectedDiagram, this.props.viewSize, this.startTransform, delta, shiftKey,
                this.resizeDragOffset.x,
                this.resizeDragOffset.y);

        this.overlays.showSnapAdorners(snapResult);

        return snapResult.delta;
    }

    private getResizeDeltaPos(angle: Rotation, dSize: Vec2) {
        let x = 0, y = 0;

        if (this.resizeDragOffset.y !== 0) {
            y += this.resizeDragOffset.y * dSize.y * angle.cos;
            x -= this.resizeDragOffset.y * dSize.y * angle.sin;
        }

        if (this.resizeDragOffset.x !== 0) {
            y += this.resizeDragOffset.x * dSize.x * angle.sin;
            x += this.resizeDragOffset.x * dSize.x * angle.cos;
        }

        return new Vec2(x, y);
    }

    public onMouseUp(event: SvgEvent, next: () => void) {
        if (this.manipulationMode === 0) {
            return next();
        }

        try {
            this.overlays.reset();

            if (this.manipulationMode !== 0 && this.manipulated) {
                this.rotation = this.transform.rotation;

                this.props.transformItems(
                    this.props.selectedDiagram,
                    this.props.selectedItems,
                    this.startTransform,
                    this.transform);
            }
        } finally {
            this.manipulationMode = 0;
            this.manipulated = false;
        }
    }

    private layoutShapes() {
        if (this.resizeShapes === null) {
            return;
        }

        const size = this.transform.size;

        const rotation = this.transform.rotation.degree;
        const position = this.transform.position;

        for (let resizeShape of this.resizeShapes) {
            const offset = resizeShape['offset'];

            this.renderer.setTransform(resizeShape, {
                x: position.x - 6 + offset.x * (size.x + 0),
                y: position.y - 6 + offset.y * (size.y + 0),
                rx: position.x,
                ry: position.y,
                rotation
            });

            this.renderer.setVisibility(resizeShape,
                (offset.x === 0 || this.canResizeX) &&
                (offset.y === 0 || this.canResizeY));
        }

        this.renderer.setVisibility(this.rotateShape, true);
        this.renderer.setTransform(this.rotateShape, {
            x: position.x - 8,
            y: position.y - 8 - size.y * 0.5 - 20,
            rx: position.x,
            ry: position.y,
            rotation
        });

        this.renderer.setVisibility(this.moveShape, true);
        this.renderer.setTransform(this.moveShape, {
            x: position.x - 0.5 * size.x - 1,
            y: position.y - 0.5 * size.y - 1,
            w: size.x + 2,
            h: size.y + 2,
            rx: position.x,
            ry: position.y,
            rotation
        });
    }

    private hideShapes() {
        this.allElements.forEach(s => s.hide());
    }

    private createMoveShape() {
        const moveShape = this.renderer.createRectangle(1, 1);

        this.renderer.setStrokeColor(moveShape, TRANSFORMER_STROKE_COLOR);
        this.renderer.setBackgroundColor(moveShape, 'none');
        this.renderer.setVisibility(moveShape, false);

        this.props.interactionService.setCursor(moveShape, 'move');

        this.moveShape = moveShape;
    }

    private createRotateShape() {
        const rotateShape = this.renderer.createEllipse(1);

        this.renderer.setTransform(rotateShape, { w: 16, h: 16 });
        this.renderer.setStrokeColor(rotateShape, TRANSFORMER_STROKE_COLOR);
        this.renderer.setBackgroundColor(rotateShape, TRANSFORMER_FILL_COLOR);
        this.renderer.setVisibility(rotateShape, false);

        this.props.interactionService.setCursor(rotateShape, 'pointer');

        this.rotateShape = rotateShape;
    }

    private createResizeShapes() {
        const ys = [-0.5, -0.5, -0.5, 0.0, 0.0, 0.5, 0.5, 0.5];
        const xs = [-0.5, 0.0, 0.5, -0.5, 0.5, -0.5, 0.0, 0.5];
        const as = [315, 0, 45, 270, 90, 215, 180, 135];

        const size = { w: 12, h: 12 };

        for (let i = 0; i < xs.length; i++) {
            const resizeShape = this.renderer.createRectangle(1, 1);

            this.renderer.setTransform(resizeShape, size);
            this.renderer.setStrokeColor(resizeShape, TRANSFORMER_STROKE_COLOR);
            this.renderer.setBackgroundColor(resizeShape, TRANSFORMER_FILL_COLOR);
            this.renderer.setVisibility(resizeShape, false);

            resizeShape['offset'] = new Vec2(xs[i], ys[i]);

            this.props.interactionService.setCursorAngle(resizeShape, as[i]);

            this.resizeShapes.push(resizeShape);
        }
    }

    public render(): any {
        if (!this.transform || this.props.selectedItems.length === 0) {
            return null;
        }

        const style = {
            left: this.transform.position.x,
            top: this.transform.position.y - this.transform.size.y / 2 - 70
        };
        return <div
            className='editor-floating-toolbox'
            style={style}>

            <LayoutMenuContainer />
            <ArrangeMenuContainer />
        </div>;
    }
}