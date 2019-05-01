import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    addImage,
    addVisuals,
    Diagram,
    DiagramItem,
    DiagramItemSet,
    EditorStateInStore,
    getDiagram,
    getSelectedItems,
    IVisual,
    pasteItems,
    removeItems,
    Serializer,
    UIStateInStore
} from '@app/wireframes/model';

import { SerializerContext } from '@app/context';
import { ClipboardHooks } from '@app/core/react/ClipboardHooks';

import { commentHeight, commentWidth, gridSize } from '@app/constants';
import { MathHelper } from '@app/core';
import { pasteImage } from '@app/core/utils/clipboard-helper';
import { DiagramRef } from '@app/wireframes/model/actions/utils';


interface ClipboardShortcutsProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

    x: number;
    y: number;
    zoom: number;

    // The selected items.
    selectedItems: DiagramItem[];

    addImage: (diagram: DiagramRef, source: string, x: number, y: number, w: number, h: number, shapeId?: string) => any;
    addVisuals: (diagram: string, visuals: IVisual[]) => any;

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => any;

    pasteItems: (diagram: Diagram, json: string, worldX: number, worldY: number) => any;
}

interface ClipboardShortcutsState {
    lastClipboard?: string;
}

const WISE_OBJECTS = 'application/wiseobjects';
const PLAIN_TEXT = 'text/plain';

class ClipboardShortcuts extends React.PureComponent<ClipboardShortcutsProps, ClipboardShortcutsState> {
    private lastClientX = 0;
    private lastClientY = 0;

    constructor(props: ClipboardShortcutsProps, context: any) {
        super(props, context);
        this.state = { lastClipboard: null };
    }
    
    private onMouseMove = (e: MouseEvent) => {
        this.lastClientX = e.clientX;
        this.lastClientY = e.clientY;
    }

    public componentDidMount() {
        document.addEventListener('mousemove', this.onMouseMove);
    }

    public componentWillUnmount() {
        document.removeEventListener('mousemove', this.onMouseMove);
    }

    private doCopy = (e: ClipboardEvent, serializer: Serializer, changeIds = false) => {
        const { selectedDiagram, selectedItems } = this.props;

        const target: any = e.target;
        if (target.type === 'textarea' || target.type === 'input') {
            return;
        }

        if (selectedDiagram && !!selectedItems.length) {
            const set =
                DiagramItemSet.createFromDiagram(
                    selectedItems,
                    selectedDiagram);

            
            e.preventDefault();
            // set text
            let text = '';
            for (const visual of set.allVisuals) {
                const t = visual.appearance.get('TEXT');
                if (t) { 
                    text += t + '\n';
                }
            }
            e.clipboardData.setData(PLAIN_TEXT, text);
            // set internal
            e.clipboardData.setData(WISE_OBJECTS, serializer.serializeSet(set, changeIds));
        }
    }

    private doCut = (e: ClipboardEvent, serializer: Serializer) => {
        const { selectedDiagram, selectedItems } = this.props;

        const target: any = e.target;
        if (target.type === 'textarea' || target.type === 'input') {
            return;
        }

        if (selectedDiagram) {
            this.doCopy(e, serializer);

            this.props.removeItems(selectedDiagram, selectedItems);
        }
    }

    private doPaste = (e: ClipboardEvent, serializer: Serializer) => {
        const { selectedDiagram, x, y, zoom } = this.props;
        
        const target: any = e.target;
        if (target.type === 'textarea' || target.type === 'input') {
            return;
        }

        if (!selectedDiagram) {
            return;
        }

        const worldX = (this.lastClientX - x) / zoom;
        const worldY = (this.lastClientY - y) / zoom;

        if (e.clipboardData && e.clipboardData.types.length) {
            if (e.clipboardData.types.indexOf(WISE_OBJECTS) !== -1) {
                let clipboard = e.clipboardData.getData(WISE_OBJECTS);
                const lastClipboard = this.state.lastClipboard;
                if (clipboard === lastClipboard) {

                    // generate new ids
                    const set = serializer.deserializeSet(clipboard);
                    clipboard = serializer.serializeSet(set, true);
                } else {
                    this.setState(s => ({ lastClipboard: clipboard }));
                }
        
                this.props.pasteItems(selectedDiagram, clipboard!, worldX, worldY);
            } else {
                if (e.clipboardData.types.indexOf(PLAIN_TEXT) !== -1) {
                    const clipboardText = e.clipboardData.getData(PLAIN_TEXT);
                    // split lines
                    const lines = clipboardText.replace('\r\n', '\n').split('\n');

                    let offX = 0;
                    let offY = 0;
                    let counter = 0;
                    const visuals: IVisual[] = [];
                    for (const line of lines) {
                        if (!line) { continue; }
                        if (!!counter) {
                            if (counter % 4 === 0) {
                                offX = 0;
                                offY += commentHeight + gridSize;
                            } else {
                                offX += commentWidth + gridSize;
                            }
                        }
                        visuals.push({ shapeId: MathHelper.guid(), renderer: 'Comment', x: worldX + offX, y: worldY + offY, properties: { 'TEXT': line }});
                        counter++;
                    }
                    if (visuals.length !== 0) {
                        this.props.addVisuals(selectedDiagram.id, visuals);
                    }
                    
                } else {
                    const clipboardItems = e.clipboardData.items;
                    
                    // tslint:disable-next-line: prefer-for-of
                    for (let i = 0; i < clipboardItems.length; i++) {
                        const item = clipboardItems[i];
                        if (/image/.test(item.type)) {
                            const file = item.getAsFile();
                            pasteImage(file, this.props.addImage, this.props.selectedDiagram.id, worldX, worldY);
                        }
                    }

                }                
            }
        }
        e.preventDefault();
    }

    public render() {
        return (
            <SerializerContext.Consumer>
                {serializer => <ClipboardHooks 
                    onCopy={(e: ClipboardEvent) => this.doCopy(e, serializer, true)} 
                    onCut={(e: ClipboardEvent) => this.doCut(e, serializer)} 
                    onPaste={(e: ClipboardEvent) => this.doPaste(e, serializer)} 
                />}
            </SerializerContext.Consumer>
        );
    }
}

const mapStateToProps = (state: EditorStateInStore & UIStateInStore) => {
    return {
        x: state.ui.x,
        y: state.ui.y,
        zoom: state.ui.zoom,
        selectedDiagram: getDiagram(state),
        selectedItems: getSelectedItems(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    addImage, addVisuals, removeItems, pasteItems
}, dispatch);

export const ClipboardShortcutsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ClipboardShortcuts);