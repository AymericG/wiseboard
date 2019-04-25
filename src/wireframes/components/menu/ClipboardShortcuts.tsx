import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

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

    // The offset for new items.
    offset: number;
}

const OFFSET = 50;

class ClipboardShortcuts extends React.PureComponent<ClipboardShortcutsProps, ClipboardShortcutsState> {
    constructor(props: ClipboardShortcutsProps) {
        super(props);

        this.state = { offset: 0 };
    }

    private doCopy = (serializer: Serializer) => {
        const { selectedDiagram, selectedItems } = this.props;

        if (selectedDiagram) {
            const set =
                DiagramItemSet.createFromDiagram(
                    selectedItems,
                    selectedDiagram);

            this.setState({ offset: 0, clipboard: serializer.serializeSet(set) });
        }
    }

    private doCut = (serializer: Serializer) => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.doCopy(serializer);

            this.props.removeItems(selectedDiagram, this.props.selectedItems);
        }
    }

    private doPaste = () => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.setState(s => ({ offset: s.offset + OFFSET, clipboard: s.clipboard }));

            this.props.pasteItems(selectedDiagram, this.state.clipboard!, this.state.offset);
        }
    }

    public render() {
        const canCopy = this.props.selectedItems.length > 0;

        return (
            <SerializerContext.Consumer>
                {serializer =>
                    <>
                        <Shortcut disabled={!canCopy} onPressed={() => this.doCopy(serializer)} keys='ctrl+c' />
                        <Shortcut disabled={!canCopy} onPressed={() => this.doCut(serializer)} keys='ctrl+x' />
                        <Shortcut disabled={!this.state.clipboard} onPressed={this.doPaste} keys='ctrl+v' />
                    </>
                }
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