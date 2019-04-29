import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    alignItems,
    BRING_TO_FRONT,
    DiagramItem,
    EditorStateInStore,
    getDiagramId,
    getSelectedItems,
    orderItems,
    SEND_TO_BACK
} from '@app/wireframes/model';

interface MainToolbarProps {
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // Indicates wherther the items can be aligned.
    canAlign: boolean;

    // Indicates whether the items can be ordered.
    canOrder: boolean;

    // Indicates whether the items can be distributed.
    canDistribute: boolean;

    // Orders the items.
    orderItems: (mode: string, diagram: string, items: DiagramItem[]) => any;

    // Align the items.
    alignItems: (mode: string, diagram: string, items: DiagramItem[]) => any;
}

const MainToolbar = (props: MainToolbarProps) => {
    const doOrder = (mode: string) => {
        if (props.selectedDiagramId) {
            props.orderItems(mode, props.selectedDiagramId, props.selectedItems);
        }
    };

    const doBringToFront  = () => doOrder(BRING_TO_FRONT);
    // const doBringForwards = () => doOrder(BRING_FORWARDS);
    // const doSendBackwards = () => doOrder(SEND_BACKWARDS);
    const doSendToBack    = () => doOrder(SEND_TO_BACK);

    const { canOrder, selectedDiagramId } = props;

    return selectedDiagramId ? (
        <>
            <Tooltip title='Bring to front' placement='right'>
                <Button disabled={!canOrder} className='menu-item' onClick={doBringToFront}>
                    <i className='icon-bring-to-front' />
                </Button>
            </Tooltip>
            <Tooltip title='Send to back' placement='right'>
                <Button disabled={!canOrder} className='menu-item' onClick={doSendToBack}>
                    <i className='icon-send-to-back'></i>
                </Button>
            </Tooltip>
        </>
    ) : null;
};

const mapStateToProps = (state: EditorStateInStore) => {
    const items = getSelectedItems(state);

    return {
        selectedDiagramId: getDiagramId(state),
        selectedItems: items,
        canAlign: items.length > 1,
        canOrder: items.length > 0,
        canDistribute: items.length > 1
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    orderItems, alignItems
}, dispatch);

export const MainToolbarContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(MainToolbar);