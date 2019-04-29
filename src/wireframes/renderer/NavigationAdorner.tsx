import * as React from 'react';
// import ReactDOM = require('react-dom');

import { InteractionMode, maxZoom, minZoom } from '@app/constants';

import {
    Diagram,
    DiagramItem
} from '@app/wireframes/model';

import {
    InteractionHandler,
    InteractionService,
    SvgEvent
} from './interaction-service';

import { getCanvasOffset } from '@app/core';

const SPACE = 32;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;

export interface NavigationAdornerProps {
    // editorContent: React.RefObject<any>;

    interactionMode: InteractionMode;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    zoom: number;

    // A function to select a set of items.
    selectItems: (diagram: Diagram, itemIds: string[]) => any;
    setZoom: (zoom: number, worldX: number, worldY: number, clientX: number, clientY: number) => any;
    moveTo: (x: number, y: number) => any;

    setInteractionMode: (interactionMode: InteractionMode) => void;
}

export class NavigationAdorner extends React.Component<NavigationAdornerProps> implements InteractionHandler {
    private dragStartX: number;
    private dragStartY: number;

    private isSpaceDown: boolean;
    private editorStartX: number;
    private editorStartY: number;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);
    }

    public componentDidUpdate() {
        // 
    }

    public onKeyDown(event: SvgEvent, next: () => void) {
        const { moveTo } = this.props;
        const target: any = event.event.target;
        if (target.type === 'textarea' || target.type === 'input') {
            next();
            return;
        }
        const keyCode = (event.event as KeyboardEvent).keyCode;
        let offset: { x: number, y: number };
        switch (keyCode) {
            case SPACE:
                this.isSpaceDown = true;
                this.props.setInteractionMode(InteractionMode.Drag);
                break;
            case LEFT:
                offset = getCanvasOffset();
                moveTo(offset.x + 10, offset.y);
                break;
            case UP:
                offset = getCanvasOffset();
                moveTo(offset.x, offset.y + 10);
                break;
            case RIGHT:
                offset = getCanvasOffset();
                moveTo(offset.x - 10, offset.y);
                break;
            case DOWN:
                offset = getCanvasOffset();
                moveTo(offset.x, offset.y - 10);
                break;
            default:
                next();
                return;
        }
        event.event.preventDefault();
        event.event.stopPropagation();
    }
    public onKeyUp(event: SvgEvent, next: () => void) {
        if (!this.isSpaceDown || (event.event as KeyboardEvent).keyCode !== SPACE || event.event.target !== document.body) {
            next();
            return;
        }

        this.props.setInteractionMode(InteractionMode.Selection);
        this.isSpaceDown = false;
        event.event.preventDefault();
        event.event.stopPropagation();
    }


    public onMouseDown(event: SvgEvent, next: () => void) {
        if (this.props.interactionMode !== InteractionMode.Drag && !this.isSpaceDown) {
            next();
            return;
        }

        this.dragStartX = (event.event as MouseEvent).pageX;
        this.dragStartY = (event.event as MouseEvent).pageY;

        const offset = getCanvasOffset();
        this.editorStartX = offset.x;
        this.editorStartY = offset.y;
    }

    public onMouseWheel(event: SvgEvent, next: () => void) {
        const e: any = event.event;
        const deltaY = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
        const deltaX = e.deltaX > 0 ? 1 : e.deltaX < 0 ? -1 : 0;

        const { moveTo, setZoom, zoom } = this.props;

        // zoom
        if (e.ctrlKey) {
            if (deltaY === 0) {
                next();
                return;
            }
            const newZoom = deltaY > 0 ? zoom / 1.05 : zoom * 1.05;
            const roundedNewZoom = Math.floor(Math.round(Math.min(maxZoom, Math.max(minZoom, newZoom)) * 100)) / 100;

            const canvasOffset = getCanvasOffset();
            const worldX = (e.clientX - canvasOffset.x) / zoom;
            const worldY = (e.clientY - canvasOffset.y) / zoom;

            setZoom(roundedNewZoom, worldX, worldY, e.clientX, e.clientY);
            return;
        }

        // pan
        const STEP = 50;
        const offset = getCanvasOffset();
        moveTo(offset.x - STEP * deltaX, offset.y - STEP * deltaY);
    }

    public onMouseDrag(event: SvgEvent, next: () => void) {
        if ((this.props.interactionMode !== InteractionMode.Drag && !this.isSpaceDown) || !this.dragStartX) {
            return next();
        }
        const x = this.editorStartX + (event.event as MouseEvent).pageX - this.dragStartX;
        const y = this.editorStartY + (event.event as MouseEvent).pageY - this.dragStartY;
        this.props.moveTo(x, y);
    }


    public onMouseUp(event: SvgEvent, next: () => void) {
        if ((this.props.interactionMode !== InteractionMode.Drag && !this.isSpaceDown) || !this.dragStartX) {
            return next();
        }

        // TODO: save scrollLeft and scrollTop to state (this.props.moveBoard)
        this.dragStartX = null;
        this.dragStartY = null;
    }



    public render(): any {
        return null;
    }
}