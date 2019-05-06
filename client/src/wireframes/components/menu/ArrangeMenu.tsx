import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { MathHelper, Shortcut } from '@app/core';

import { withShortcut } from '@app/core/utils/tooltip-helper';

import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    DiagramItemSet,
    EditorStateInStore,
    getDiagram,
    getSelectedGroups,
    getSelectedItems,
    groupItems,
    pasteItems,
    removeItems,
    selectItems,
    Serializer,
    ungroupItems    
} from '@app/wireframes/model';

import { CLONE_OFFSET } from '@app/constants';
import { SerializerContext } from '@app/context';

interface ArrangeMenuProps {
    // Indicates if items can be grouped.
    canGroup: boolean;

    // Indicates if items can be ungrouped.
    canUngroup: boolean;

    // Indicates if items can be removed.
    canRemove: boolean;

    canUnselect: boolean;

    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected groups.
    selectedGroups: DiagramGroup[];

    // Group items.
    groupItems: (diagram: Diagram, items: DiagramItem[], id: string) => any;

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => any;

    // Ungroup items.
    ungroupItems: (diagram: Diagram, groups: DiagramGroup[]) => any;

    // Selcts items.
    selectItems: (diagram: Diagram, itemsIds: string[]) => any;

    pasteItems: (diagram: Diagram, json: string, offset?: number) => any;

}

class ArrangeMenu extends React.PureComponent<ArrangeMenuProps> {
    private doGroup = () => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.props.groupItems(selectedDiagram, this.props.selectedItems, MathHelper.guid());
        }
    }

    private doUngroup = () => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.props.ungroupItems(selectedDiagram, this.props.selectedGroups);
        }
    }

    private doRemove = () => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.props.removeItems(selectedDiagram, this.props.selectedItems);
        }
    }


    private doUnselectAll = () => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.props.selectItems(selectedDiagram, []);
        }
    }

    private doClone = (serializer: Serializer) => {
        const { selectedDiagram, selectedItems } = this.props;
        const set = DiagramItemSet.createFromDiagram(selectedItems, selectedDiagram);
        const clipboard = serializer.serializeSet(set, true);
        this.props.pasteItems(selectedDiagram, clipboard!, CLONE_OFFSET);
    }

    public render() {
        const { canGroup, canRemove, canUngroup, canUnselect } = this.props;

        return (
            <>
                {canGroup && <Tooltip title={withShortcut('Group items', ['Ctrl', 'G'])}>
                    <Button className='menu-item'
                        disabled={!canGroup}
                        onClick={this.doGroup}>
                        <i className='icon-group' />
                    </Button>
                </Tooltip>}

                {canGroup && <Shortcut disabled={!canGroup} onPressed={this.doGroup} keys='ctrl+g' />}

                {canUngroup && <Tooltip title={withShortcut('Ungroup items', ['Ctrl', 'Shift', 'G'])}>
                    <Button className='menu-item'
                        disabled={!canUngroup}
                        onClick={this.doUngroup}>
                        <i className='icon-ungroup' />
                    </Button>
                </Tooltip>}

                {canUngroup && <Shortcut disabled={!canUngroup} onPressed={this.doUngroup} keys='ctrl+shift+g' />}

                <SerializerContext.Consumer>
                    {serializer => <Tooltip title='Clone'>
                        <Button className='menu-item'
                            onClick={() => this.doClone(serializer)}>
                            <i className='fa fa-clone' />
                        </Button>
                    </Tooltip>}
                </SerializerContext.Consumer>

                {canRemove && <Tooltip title={withShortcut('Delete selected items', ['Del'])}>
                    <Button className='menu-item'
                        disabled={!canRemove}
                        onClick={this.doRemove}>
                        <i className='icon-delete' />
                    </Button>
                </Tooltip>}

                {canRemove && <Shortcut disabled={!canRemove} onPressed={this.doRemove} keys='del' />}
                {canRemove && <Shortcut disabled={!canRemove} onPressed={this.doRemove} keys='backspace' />}

                {<Shortcut disabled={!canUnselect} onPressed={this.doUnselectAll} keys='esc' />}

            </>
        );
    }
}

const mapStateToProps = (state: EditorStateInStore) => {
    const items = getSelectedItems(state);

    const groups = getSelectedGroups(state);

    return {
        selectedDiagram: getDiagram(state),
        selectedGroups: groups,
        selectedItems: items,
        canGroup: items.length > 1,
        canRemove: items.length > 0,
        canUngroup: groups.length > 0,
        canUnselect: items.length > 0
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    groupItems, pasteItems, removeItems, ungroupItems, selectItems
}, dispatch);

export const ArrangeMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ArrangeMenu);