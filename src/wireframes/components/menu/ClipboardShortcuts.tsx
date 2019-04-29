import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    Diagram,
    DiagramItem,
    DiagramItemSet,
    EditorStateInStore,
    getDiagram,
    getSelectedItems,
    pasteItems,
    removeItems,
    Serializer
} from '@app/wireframes/model';

import { SerializerContext } from '@app/context';
import { ClipboardHooks } from '@app/core/react/ClipboardHooks';

interface ClipboardShortcutsProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => any;

    // Ungroup items.
    pasteItems: (diagram: Diagram, json: string, offset?: number) => any;
}

interface ClipboardShortcutsState {
    // The current clipboard value.
    clipboard?: string;
    lastClipboard?: string;

    // The offset for new items.
    offset: number;
}

const OFFSET = 50;

class ClipboardShortcuts extends React.PureComponent<ClipboardShortcutsProps, ClipboardShortcutsState> {
    constructor(props: ClipboardShortcutsProps) {
        super(props);

        this.state = { offset: 0 };
    }

    private doCopy = (e: ClipboardEvent, serializer: Serializer, changeIds = false) => {
        const { selectedDiagram, selectedItems } = this.props;

        if (selectedDiagram && !!selectedItems.length) {
            const set =
                DiagramItemSet.createFromDiagram(
                    selectedItems,
                    selectedDiagram);

            
            this.setState({ offset: OFFSET });
            e.preventDefault();
            // set text
            let text = '';
            for (const visual of set.allVisuals) {
                const t = visual.appearance.get('TEXT');
                if (t) { 
                    text += t + '\n';
                }
            }
            e.clipboardData.setData('text/plain', text);
            // set internal
            e.clipboardData.setData('application/wiseObjects', serializer.serializeSet(set, changeIds));
        }
    }

    private doCut = (e: ClipboardEvent, serializer: Serializer) => {
        const { selectedDiagram, selectedItems } = this.props;

        if (selectedDiagram) {
            this.doCopy(e, serializer);

            this.props.removeItems(selectedDiagram, selectedItems);
        }
    }

    private doPaste = (e: ClipboardEvent, serializer: Serializer) => {
        const selectedDiagram = this.props.selectedDiagram;

        if (!selectedDiagram) {
            return;
        }

        let clipboard = e.clipboardData.getData('application/wiseObjects');
        const lastClipboard = this.state.lastClipboard;
        let offset = this.state.offset;

        if (clipboard === lastClipboard) {
            offset += OFFSET;

            // generate new ids
            const set = serializer.deserializeSet(clipboard);
            clipboard = serializer.serializeSet(set, true);
            this.setState(s => ({ offset }));
        } else {
            offset = OFFSET;
            this.setState(s => ({ offset, lastClipboard: clipboard }));
        }

        this.props.pasteItems(selectedDiagram, clipboard!, this.state.offset);
        e.preventDefault();
    }

    public render() {
        return (
            <SerializerContext.Consumer>
                {serializer => <ClipboardHooks onCopy={(e: ClipboardEvent) => this.doCopy(e, serializer, true)} onCut={(e: ClipboardEvent) => this.doCut(e, serializer)} onPaste={(e: ClipboardEvent) => this.doPaste(e, serializer)} />}
            </SerializerContext.Consumer>
        );
    }
}

const mapStateToProps = (state: EditorStateInStore) => {
    return {
        selectedDiagram: getDiagram(state),
        selectedItems: getSelectedItems(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    removeItems, pasteItems
}, dispatch);

export const ClipboardShortcutsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ClipboardShortcuts);