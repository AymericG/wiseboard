import { Icon, Input } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './Shapes.scss';

import { Grid } from '@app/core';

import {
    addVisual,
    AssetsStateInStore,
    EditorStateInStore,
    filterShapes,
    getDiagramId,
    getFilteredShapes,
    getShapesFilter,
    ShapeInfo,
    UIStateInStore} from '@app/wireframes/model';

import { ShapeImage } from './ShapeImage';

import { commentHeight, commentWidth } from '@app/constants';

interface ShapesProps {
    x: number;
    y: number;
    zoom: number;

    // The filtered shapes.
    shapesFiltered: ShapeInfo[];

    // The shapes filter.
    shapesFilter: string;

    // The selected diagram.
    selectedDiagramId: string | null;

    // Filter the shapes.
    filterShapes: (value: string) => any;

    // Adds an visual.
    addVisualToPosition: (diagram: string, renderer: string, x: number, y: number, zoom: number) => any;
}

const addVisualToPosition = (diagram: string, renderer: string, offsetX: number, offsetY: number, zoom: number) => {

    const editorView = document.getElementById('editor-view').getBoundingClientRect();

    const worldX = ((editorView.width / 2 - commentWidth / 2) - offsetX) / zoom;
    const worldY = ((editorView.height / 2 - commentHeight / 2) - offsetY) / zoom;

    return addVisual(diagram, renderer, worldX, worldY);
};

const mapStateToProps = (state: AssetsStateInStore & EditorStateInStore & UIStateInStore) => {
    return {
        x: state.ui.x,
        y: state.ui.y,
        zoom: state.ui.zoom,
        selectedDiagramId: getDiagramId(state),
        shapesFiltered: getFilteredShapes(state),
        shapesFilter: getShapesFilter(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    filterShapes, addVisualToPosition
}, dispatch);

class Shapes extends React.PureComponent<ShapesProps> {
    private cellRenderer = (shape: ShapeInfo) => {
        const doAdd = () => {
            const diagramId = this.props.selectedDiagramId;

            if (diagramId) {
                const { x, y, zoom } = this.props;
                this.props.addVisualToPosition(diagramId, shape.name, x, y, zoom);
            }
        };

        return (
            <div className='asset-shape'>
                <div className='asset-shape-image-row' onDoubleClick={doAdd}>
                    <ShapeImage shape={shape} />
                </div>

                <div className='asset-shape-title'>{shape.displayName}</div>
            </div>
        );
    }

    private doFilterShapes = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.filterShapes(event.target.value);
    }

    private keyBuilder = (shape: ShapeInfo) => {
        return shape.name;
    }

    public render() {
        return (
            <>
                <div className='asset-shapes-search'>
                    <Input value={this.props.shapesFilter} onChange={this.doFilterShapes}
                        placeholder='Find shape'
                        prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />} />
                </div>

                <Grid className='asset-shapes-list' renderer={this.cellRenderer} columns={2} items={this.props.shapesFiltered} keyBuilder={this.keyBuilder} />
            </>
        );
    }
}

export const ShapesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Shapes);