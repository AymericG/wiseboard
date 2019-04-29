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

    // Adds a visual.
    addVisual: (diagram: string, renderer: string, x: number, y: number, properties?: object) => any;

    x: number;
    y: number;
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

    public onDoubleClick(event: SvgEvent, next: () => void) {
        const { addVisual, selectedDiagram, x, y, zoom } = this.props;

        if (event.shape) {
            return next();
        }
        const e: any = event.event;
        const worldX = (e.clientX - x) / zoom;
        const worldY = (e.clientY - y) / zoom;

        // create new postit here.
        addVisual(selectedDiagram.id, 'Comment', worldX, worldY); // item['shape'], x, y);
    }


    public onKeyDown(event: SvgEvent, next: () => void) {
        const { interactionMode, moveTo, x, y } = this.props;
        const target: any = event.event.target;
        if (target.type === 'textarea' || target.type === 'input') {
            next();
            return;
        }
        const keyCode = (event.event as KeyboardEvent).keyCode;
        switch (keyCode) {
            case SPACE:
                if (interactionMode !== InteractionMode.Drag) {
                    this.isSpaceDown = true;
                    this.props.setInteractionMode(InteractionMode.Drag);
                }
                break;
            case LEFT:
                moveTo(x + 10, y);
                break;
            case UP:
                moveTo(x, y + 10);
                break;
            case RIGHT:
                moveTo(x - 10, y);
                break;
            case DOWN:
                moveTo(x, y - 10);
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

        const { x, y } = this.props;

        this.dragStartX = (event.event as MouseEvent).pageX;
        this.dragStartY = (event.event as MouseEvent).pageY;

        this.editorStartX = x;
        this.editorStartY = y;
    }

    public onMouseWheel(event: SvgEvent, next: () => void) {
        const e: any = event.event;
        const deltaY = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
        const deltaX = e.deltaX > 0 ? 1 : e.deltaX < 0 ? -1 : 0;

        const { moveTo, setZoom, x, y, zoom } = this.props;

        // zoom
        if (e.ctrlKey) {
            if (deltaY === 0) {
                next();
                return;
            }
            const newZoom = deltaY > 0 ? zoom / 1.05 : zoom * 1.05;
            const roundedNewZoom = Math.floor(Math.round(Math.min(maxZoom, Math.max(minZoom, newZoom)) * 100)) / 100;

            const worldX = (e.clientX - x) / zoom;
            const worldY = (e.clientY - y) / zoom;

            setZoom(roundedNewZoom, worldX, worldY, e.clientX, e.clientY);
            return;
        }

        // pan
        const STEP = 50;
        moveTo(x - STEP * deltaX, y - STEP * deltaY);
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