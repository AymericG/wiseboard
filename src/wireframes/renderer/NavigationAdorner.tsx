import * as React from 'react';
// import ReactDOM = require('react-dom');

import { InteractionMode, gridSize, Keys, maxZoom, minZoom, ShapeType } from '@app/constants';

import {
    Diagram,
    DiagramItem
} from '@app/wireframes/model';

import {
    InteractionHandler,
    InteractionService,
    SvgEvent
} from './interaction-service';

import { isTextEditor } from '@app/core/utils/text-editing';
import { getClientCenter } from '../../core/utils/canvas-helper';


export interface NavigationAdornerProps {
    // editorContent: React.RefObject<any>;

    interactionMode: InteractionMode;

    // The selected diagram.
    selectedDiagram: Diagram;

    isEditingText: boolean;

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
    setZoom: (zoom: number, worldX?: number, worldY?: number, clientX?: number, clientY?: number) => any;
    
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
        addVisual(selectedDiagram.id, ShapeType.Comment, worldX, worldY);
    }

    private moveCanvasBy = (deltaX: number, deltaY: number) => {
        const { x, y, zoom } = this.props;
        const clientCenter = getClientCenter();
        const worldX = (clientCenter.x - x) / zoom;
        const worldY = (clientCenter.y - y) / zoom;        
        this.props.setZoom(zoom, worldX + deltaX / zoom, worldY + deltaY / zoom);
    }

    public onKeyDown(event: SvgEvent, next: () => void) {
        const { interactionMode, selectedItems } = this.props;
        const target: any = event.event.target;
        if (isTextEditor(target)) {
            next();
            return;
        }
        const keyCode = (event.event as KeyboardEvent).keyCode;
        if (keyCode === Keys.SPACE && interactionMode !== InteractionMode.Drag) {
            this.isSpaceDown = true;
            this.props.setInteractionMode(InteractionMode.Drag);
            return;
        }

        if (!!selectedItems.length) { return next(); }

        switch (keyCode) {
            case Keys.LEFT:
                this.moveCanvasBy(gridSize, 0);
                break;
            case Keys.UP:
                this.moveCanvasBy(0, gridSize);
                break;
            case Keys.RIGHT:
                this.moveCanvasBy(-gridSize, 0);
                break;
            case Keys.DOWN:
                this.moveCanvasBy(0, -gridSize);
                break;
            default:
                next();
                return;
        }
        event.event.preventDefault();
        event.event.stopPropagation();
    }
    public onKeyUp(event: SvgEvent, next: () => void) {
        if (!this.isSpaceDown || (event.event as KeyboardEvent).keyCode !== Keys.SPACE || event.event.target !== document.body) {
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

        const { isEditingText, setZoom, x, y, zoom } = this.props;
        if (isEditingText) {
            return next();
        }
        // zoom
        if (e.ctrlKey) {
            if (deltaY === 0) {
                next();
                return;
            }
            const newZoom = deltaY > 0 ? zoom / 1.1 : zoom * 1.1;
            const roundedNewZoom = Math.floor(Math.round(Math.min(maxZoom, Math.max(minZoom, newZoom)) * 100)) / 100;

            const worldX = (e.clientX - x) / zoom;
            const worldY = (e.clientY - y) / zoom;
            
            setZoom(roundedNewZoom, worldX, worldY, e.clientX, e.clientY);
            return;
        }

        // pan
        const STEP = 50;
        this.moveCanvasBy(STEP * deltaX, STEP * deltaY);
    }

    public onMouseDrag(event: SvgEvent, next: () => void) {
        if ((this.props.interactionMode !== InteractionMode.Drag && !this.isSpaceDown) || !this.dragStartX) {
            return next();
        }
        const x = this.editorStartX + (event.event as MouseEvent).pageX - this.dragStartX;
        const y = this.editorStartY + (event.event as MouseEvent).pageY - this.dragStartY;
        const canvas = document.getElementById('canvas');
        canvas.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; 
    }


    public onMouseUp(event: SvgEvent, next: () => void) {
        if ((this.props.interactionMode !== InteractionMode.Drag && !this.isSpaceDown) || !this.dragStartX) {
            return next();
        }

        this.moveCanvasBy(this.dragStartX - (event.event as MouseEvent).pageX, this.dragStartY - (event.event as MouseEvent).pageY);
        
        this.dragStartX = null;
        this.dragStartY = null;
    }



    public render(): any {
        return null;
    }
}