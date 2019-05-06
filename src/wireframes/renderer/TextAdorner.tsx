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

import { Keys, TextBehaviour, TEXT_PADDING } from '@app/constants';

import { ContentEditable } from '@app/core/react/ContentEditable';
import { isTextEditor } from '@app/core/utils/text-editing';

// import ContentEditable from 'react-contenteditable';

const MIN_WIDTH = 150;
const MIN_HEIGHT = 30;

export interface TextAdornerProps {
    // The current zoom value.
    zoom: number;

    x: number;
    y: number;

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
    private editingStyle: any;
    private textArea: React.RefObject<any>;
    private editingClassName: string;
    private shouldFitText: boolean;

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
        if (nextProps.isEditingText && nextProps.selectedItems.length) {
            
            // limitation. Only edit first item in selection?
            const editingShape = nextProps.selectedItems[0] as DiagramShape;

            const transform = editingShape.transform;

            const worldX = zoom * (transform.position.x - 0.5 * transform.size.x) - 2;
            const worldY = zoom * (transform.position.y - 0.5 * transform.size.y) - 2;

            const w = sizeInPx((Math.max(transform.size.x, MIN_WIDTH)) + 4);
            const h = sizeInPx((Math.max(transform.size.y, MIN_HEIGHT)) + 4);

            const textBehaviour = editingShape.appearance.get(DiagramShape.APPEARANCE_TEXT_BEHAVIOUR);
            this.shouldFitText = textBehaviour === TextBehaviour.Fit;    
            this.editingClassName = editingShape.appearance.get(DiagramShape.APPEARANCE_FONT_FAMILY_CLASS_NAME);

            const clientX = worldX + nextProps.x;
            const clientY = worldY + nextProps.y;

            this.editingStyle = {
                top: sizeInPx(clientY),
                left: sizeInPx(clientX),
                fontSize: sizeInPx(editingShape.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE)),
                fontWeight: editingShape.appearance.get(DiagramShape.APPEARANCE_FONT_WEIGHT),
                padding: TEXT_PADDING,
                backgroundColor: '#efefef',
                transform: 'scale(' + (nextProps.zoom) + ')',
                transformOrigin: 'top left',
                resize: 'none',
                position: 'absolute'
            };

            if (textBehaviour !== TextBehaviour.Grow) {
                this.editingStyle.width = w;
                this.editingStyle.height = h;
            } else {
                this.editingStyle.minWidth = w;
            }

            this.setState({ text: editingShape.appearance.get(DiagramShape.APPEARANCE_TEXT) || '' });
            this.props.interactionService.hideAdorners();    
        }

        if (selectedItems !== nextProps.selectedItems && isEditingText) {
            this.updateText();
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        if (!isTextEditor(e.target)) {
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
        this.props.selectItems(this.props.selectedDiagram, [event.shape.id]);
        this.props.startEditing();
        event.event.stopPropagation();
    }

    public onKeyDown(event: SvgEvent, next: () => void) {
        if (this.props.isEditingText) {
            next();
            return;
        }

        // if key is ENTER
        const e: KeyboardEvent = event.event as KeyboardEvent;
        const target: any = event.event.target;
        if (isTextEditor(target)) {
            // we ignore this enter because it is handled somewhere else
            return next();
        }

        if (!!this.props.selectedItems.length) {
            switch (e.keyCode) {
                case Keys.ENTER:
                this.props.startEditing();
                event.event.stopPropagation();
                event.event.preventDefault();
                return;
            }
        }
        
        return next();
    }

    private doSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.keyCode === Keys.ENTER && !event.shiftKey) ||
            (event.keyCode === Keys.ESC)) {
            event.preventDefault();
            event.stopPropagation();
    
            if (event.keyCode === Keys.ENTER) {
                this.updateText();
            } else {
                this.hide();
            }
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
            <ContentEditable
                shouldFitText={this.shouldFitText}
                className={'hide-on-move no-select ' + this.editingClassName}
                onChange={this.onChange}
                autoFocus={true}
                html={this.state.text}
                style={this.editingStyle}
                ref={this.textArea}
                onBlur={this.doSubmit}
                onKeyDown={this.doSubmit}
            />
        );
    }
}