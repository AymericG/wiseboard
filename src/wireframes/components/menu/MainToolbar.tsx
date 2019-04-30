import { Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    addVisual,
    alignItems,
    AssetsStateInStore,
    DiagramItem,
    EditorStateInStore,
    getDiagramId,
    getFilteredShapes,
    getSelectedItems,
    orderItems,
    ShapeInfo,
    UIStateInStore
} from '@app/wireframes/model';

import { commentHeight, commentWidth, ShapeType } from '@app/constants';
import { ShapeIcon } from '@app/wireframes/components/assets/ShapeIcon';

interface MainToolbarProps {
    // The filtered shapes.
    shapesFiltered: ShapeInfo[];
    
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedItems: DiagramItem[];

    x: number;
    y: number;
    zoom: number;

    // Adds an visual.
    addVisualToPosition: (diagram: string, renderer: string, x: number, y: number, zoom: number) => any;

}

const addVisualToPosition = (diagram: string, renderer: string, offsetX: number, offsetY: number, zoom: number) => {

    const editorView = document.getElementById('editor-view').getBoundingClientRect();

    const worldX = ((editorView.width / 2 - commentWidth / 2) - offsetX) / zoom;
    const worldY = ((editorView.height / 2 - commentHeight / 2) - offsetY) / zoom;

    return addVisual(diagram, renderer, worldX, worldY);
};


class MainToolbar extends React.PureComponent<MainToolbarProps> {
    private doAdd = (shape: ShapeInfo) => {
        const { selectedDiagramId, x, y, zoom } = this.props;
        if (selectedDiagramId) {
            console.log('doADd');
            this.props.addVisualToPosition(selectedDiagramId, shape.name, x, y, zoom);
        }
    }

    public render() {
        const { shapesFiltered } = this.props;

        const card = shapesFiltered.filter(x => x.name === ShapeType.Comment)[0];
        const heading = shapesFiltered.filter(x => x.name === ShapeType.Heading)[0];

        return <>
                <Tooltip title='Card' placement='right'>
                    <div className='menu-item' onDoubleClick={() => this.doAdd(card)}><ShapeIcon shape={card} /></div>
                </Tooltip>
                <Tooltip title='Heading' placement='right'>
                    <div className='menu-item' onDoubleClick={() => this.doAdd(heading)}><ShapeIcon shape={heading} /></div>
                </Tooltip>
            </>;
    }
}

const mapStateToProps = (state: EditorStateInStore & AssetsStateInStore & UIStateInStore) => {
    const items = getSelectedItems(state);

    return {
        x: state.ui.x,
        y: state.ui.y,
        zoom: state.ui.zoom,
        selectedDiagramId: getDiagramId(state),
        selectedItems: items,
        shapesFiltered: getFilteredShapes(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    orderItems, alignItems, addVisualToPosition
}, dispatch);

export const MainToolbarContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(MainToolbar);