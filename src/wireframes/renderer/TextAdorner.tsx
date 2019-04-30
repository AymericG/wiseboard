import * as React from 'react';

import { sizeInPx } from '@app/core';

import {
    Diagram,
    DiagramItem,
    DiagramShape,
    DiagramVisual
} from '@app/wireframes/model';

import {
    InteractionHandler,
    InteractionService,
    SvgEvent
} from './interaction-service';

const MIN_WIDTH = 150;
const MIN_HEIGHT = 30;

const KEY_ENTER = 13;
const KEY_ESCAPE = 27;

export interface TextAdornerProps {
    // The current zoom value.
    zoom: number;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    isEditingText: boolean;
    startEditing: () => any;
    stopEditing: () => any;

    // A function to change the appearance of a visual.
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => any;
    selectItems: (diagram: Diagram, itemIds: string[]) => any;

}

interface TextAdornerState {
    text: string;
}

export class TextAdorner extends React.Component<TextAdornerProps, TextAdornerState> implements InteractionHandler {
    private editingStyle: object;
    private textArea: React.RefObject<any>;

    constructor(props: TextAdornerProps, context: any) {
        super(props, context);

        this.textArea = React.createRef();
        this.state = { text: '' };
    }

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        window.addEventListener('mousedown', this.handleMouseDown);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        window.removeEventListener('mousedown', this.handleMouseDown);
    }

    public componentWillReceiveProps(nextProps: TextAdornerProps) {
        const { selectedItems, isEditingText, zoom } = this.props;
        if (isEditingText !== nextProps.isEditingText && nextProps.isEditingText && selectedItems.length) {
            
            // limitation. Only edit first item in selection?
            const editingShape = nextProps.selectedItems[0] as DiagramShape;

            const transform = editingShape.transform;

            const x = sizeInPx(zoom * (transform.position.x - 0.5 * transform.size.x) - 2);
            const y = sizeInPx(zoom * (transform.position.y - 0.5 * transform.size.y) - 2);

            const w = sizeInPx((Math.max(transform.size.x, MIN_WIDTH)) + 4);
            const h = sizeInPx((Math.max(transform.size.y, MIN_HEIGHT)) + 4);

            
            this.editingStyle = {
                top: y,
                left: x,
                width: w,
                height: h,
                transform: 'scale(' + (nextProps.zoom) + ')',
                transformOrigin: 'top left',
                resize: 'none',
                display: 'block',
                position: 'absolute'
            };

            this.props.interactionService.hideAdorners();
        }

        if (selectedItems !== nextProps.selectedItems && isEditingText) {
            this.updateText();
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        if (e.target !== this.textArea.current) {
            this.hide();
        }
    }

    public onDoubleClick(event: SvgEvent, next: () => void) {
        if (!event.shape || event.shape.isLocked) {
            next();
            return;
        }

        if (event.shape.appearance.get(DiagramShape.APPEARANCE_TEXT_DISABLED) === true) {
            next();
            return;
        }
        this.setState({ text: event.shape.appearance.get(DiagramShape.APPEARANCE_TEXT) || '' });
        this.props.selectItems(this.props.selectedDiagram, [event.shape.id]);
        this.props.startEditing();
        event.event.stopPropagation();
    }

    private doHide = () => {
        this.hide();
    }

    private doSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.keyCode === KEY_ENTER && !event.shiftKey) ||
            (event.keyCode === KEY_ESCAPE)) {

            if (event.keyCode === KEY_ENTER) {
                this.updateText();
            } else {
                this.hide();
            }

            this.hide();

            event.preventDefault();
            event.stopPropagation();
        }
    }

    private updateText() {
        const { isEditingText, selectedItems } = this.props;
        if (!isEditingText || !selectedItems.length) {
            return;
        }

        const editingShape = selectedItems[0] as DiagramShape;

        const newText = this.state.text;
        const oldText = editingShape.appearance.get(DiagramShape.APPEARANCE_TEXT);

        if (newText !== oldText) {
            this.props.changeItemsAppearance(this.props.selectedDiagram, [editingShape], DiagramShape.APPEARANCE_TEXT, newText);
        }

        this.hide();
    }

    private hide() {
        if (this.props.isEditingText) {
            this.props.stopEditing();
        }
        this.props.interactionService.showAdorners();
    }

    private onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ text: e.target.value });
    }

    public render() {
        const { isEditingText } = this.props;
        if (!isEditingText) { return null; }

        return (
            <textarea 
                onChange={this.onChange}
                value={this.state.text}
                autoFocus={true}
                className='ant-input no-border-radius' 
                style={this.editingStyle}
                ref={this.textArea}
                onBlur={this.doHide}
                onKeyDown={this.doSubmit} 
            />
        );
    }
}