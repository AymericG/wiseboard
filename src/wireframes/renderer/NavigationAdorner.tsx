import * as React from 'react';
import ReactDOM = require('react-dom');

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

export interface NavigationAdornerProps {
    editorContent: React.RefObject<any>;

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
    setZoom: (zoom: number) => any;

    setInteractionMode: (interactionMode: InteractionMode) => void;
}

export class NavigationAdorner extends React.Component<NavigationAdornerProps> implements InteractionHandler {
    private dragStartX: number;
    private dragStartY: number;
    
    private isSpaceDown: boolean;
    private scrollLeftStart: number;
    private scrollTopStart: number;
    
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
     if ((event.event as KeyboardEvent).keyCode !== SPACE || event.event.target !== document.body) {
            next();
            return;
        }
        this.isSpaceDown = true;
        this.props.setInteractionMode(InteractionMode.Drag);
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
        
        const element: any = ReactDOM.findDOMNode(this.props.editorContent.current);    
        this.scrollLeftStart = element.scrollLeft;
        this.scrollTopStart = element.scrollTop;
    }

    public onMouseWheel(event: SvgEvent, next: () => void) {
        const e: any = event.event;
        if (!e.ctrlKey) {
            return next();
        }
        const { setZoom, zoom } = this.props;
        const delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
        const newZoom = delta > 0 ? zoom / 1.05 : zoom * 1.05;
        const roundedNewZoom = Math.floor(Math.round(Math.min(maxZoom, Math.max(minZoom, newZoom)) * 100)) / 100;
        setZoom(roundedNewZoom);

        // set scroll
        const element: any = ReactDOM.findDOMNode(this.props.editorContent.current);    
        
        const canvasXBeforeZoom = (e.clientX + element.scrollLeft) / zoom;
        const canvasYBeforeZoom = (e.clientY + element.scrollTop) / zoom;

        const offsetLeft = canvasXBeforeZoom * roundedNewZoom - e.clientX;
        const offsetTop = canvasYBeforeZoom * roundedNewZoom - e.clientY;

        element.scrollLeft = offsetLeft;
        element.scrollTop = offsetTop;
    }

    public onMouseDrag(event: SvgEvent, next: () => void) {
        if ((this.props.interactionMode !== InteractionMode.Drag && !this.isSpaceDown) || !this.dragStartX) {
            return next();
        }
        const element: any = ReactDOM.findDOMNode(this.props.editorContent.current);    
        element.scrollLeft = this.scrollLeftStart + this.dragStartX - (event.event as MouseEvent).pageX;
        element.scrollTop = this.scrollTopStart + this.dragStartY - (event.event as MouseEvent).pageY;
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