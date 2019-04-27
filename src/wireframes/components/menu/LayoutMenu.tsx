import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    ALIGN_H_CENTER,
    ALIGN_H_LEFT,
    ALIGN_H_RIGHT,
    ALIGN_V_BOTTOM,
    ALIGN_V_CENTER,
    ALIGN_V_TOP,
    alignItems,
    BRING_TO_FRONT,
    DiagramItem,
    DISTRIBUTE_H,
    DISTRIBUTE_V,
    EditorStateInStore,
    getDiagramId,
    getSelectedItems,
    orderItems,
    SEND_TO_BACK
} from '@app/wireframes/model';

interface LayoutMenuProps {
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

const LayoutMenu = (props: LayoutMenuProps) => {
    const doOrder = (mode: string) => {
        if (props.selectedDiagramId) {
            props.orderItems(mode, props.selectedDiagramId, props.selectedItems);
        }
    };

    const doAlign = (mode: string) => {
        if (props.selectedDiagramId) {
            props.alignItems(mode, props.selectedDiagramId, props.selectedItems);
        }
    };

    const doAlignHLeft = () => doAlign(ALIGN_H_LEFT);
    const doAlignHCenter = () => doAlign(ALIGN_H_CENTER);
    const doAlignHRight = () => doAlign(ALIGN_H_RIGHT);

    const doAlignVTop = () => doAlign(ALIGN_V_TOP);
    const doAlignVCenter = () => doAlign(ALIGN_V_CENTER);
    const doAlignVBottom = () => doAlign(ALIGN_V_BOTTOM);

    const doDistributeH = () => doAlign(DISTRIBUTE_H);
    const doDistributeV = () => doAlign(DISTRIBUTE_V);

    const doBringToFront  = () => doOrder(BRING_TO_FRONT);
    // const doBringForwards = () => doOrder(BRING_FORWARDS);
    // const doSendBackwards = () => doOrder(SEND_BACKWARDS);
    const doSendToBack    = () => doOrder(SEND_TO_BACK);

    const { canAlign, canDistribute, canOrder, selectedDiagramId } = props;

    return selectedDiagramId ? (
        <>
            {canAlign && <div className='editor-toolbox-group'>
                <Tooltip title='Align left'>
                    <Button disabled={!canAlign} className='menu-item' onClick={doAlignHLeft}>
                        <i className='icon-align-h-left' />
                    </Button>
                </Tooltip>
                <Tooltip title='Align center'>
                    <Button disabled={!canAlign} className='menu-item' onClick={doAlignHCenter}>
                        <i className='icon-align-h-center' />
                    </Button>
                </Tooltip>
                <Tooltip title='Align right'>
                    <Button disabled={!canAlign} className='menu-item' onClick={doAlignHRight}>
                        <i className='icon-align-h-right' />
                    </Button>
                </Tooltip>
            </div>}
            {canAlign && <div className='editor-toolbox-group'>
                <Tooltip title='Align top'>
                    <Button disabled={!canAlign} className='menu-item' onClick={doAlignVTop}>
                        <i className='icon-align-v-top' />
                    </Button>
                </Tooltip>
                <Tooltip title='Align middle'>
                    <Button disabled={!canAlign} className='menu-item' onClick={doAlignVCenter}>
                        <i className='icon-align-v-center' />
                    </Button>
                </Tooltip>
                <Tooltip title='Align bottom'>
                    <Button disabled={!canAlign} className='menu-item' onClick={doAlignVBottom}>
                        <i className='icon-align-v-bottom' />
                    </Button>
                </Tooltip>
            </div>}
            {canDistribute && <div className='editor-toolbox-group'>
                <Tooltip title='Distribute horizontally'>
                    <Button disabled={!canDistribute} className='menu-item' onClick={doDistributeH}>
                        <i className='icon-distribute-h2' />
                    </Button>
                </Tooltip>
                <Tooltip title='Distribute vertically'>
                    <Button disabled={!canDistribute} className='menu-item' onClick={doDistributeV}>
                        <i className='icon-distribute-v2' />
                    </Button>
                </Tooltip>
            </div>}
            {<div className='editor-toolbox-group'>
                <Tooltip title='Bring to front'>
                    <Button disabled={!canOrder} className='menu-item' onClick={doBringToFront}>
                        <i className='icon-bring-to-front' />
                    </Button>
                </Tooltip>
                <Tooltip title='Send to back'>
                    <Button disabled={!canOrder} className='menu-item' onClick={doSendToBack}>
                        <i className='icon-send-to-back'></i>
                    </Button>
                </Tooltip>
            </div>}

            {/* <div className='properties-subsection layout-properties'>
                <Tooltip title='Bring forwards'>
                    <Button disabled={!canOrder} className='menu-item' onClick={doBringForwards}>
                        <i className='icon-bring-forwards' />
                    </Button>
                </Tooltip>
                <Tooltip title='Send backwards'>
                    <Button disabled={!canOrder} className='menu-item' onClick={doSendBackwards}>
                        <i className='icon-send-backwards'></i>
                    </Button>
                </Tooltip>
            </div> */}
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

export const LayoutMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayoutMenu);