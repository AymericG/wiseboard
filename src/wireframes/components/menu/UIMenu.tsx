import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import { Diagram, EditorStateInStore, setZoom, UIStateInStore } from '@app/wireframes/model';

import { withShortcut } from '@app/core/utils/tooltip-helper';

import { maxZoom, minZoom } from '@app/constants';
import { getDiagram } from '../../model/projections';

interface UIMenuProps {
    selectedDiagram: Diagram;
    
    // Indicates if you can zoom in.
    canZoomIn: boolean;

    // Indicates if you can zoom out.
    canZoomOut: boolean;

    // The zoom level.
    zoom: number;

    // Sets the zoom.
    setZoom: (value: number, worldX?: number, worldY?: number, clientX?: number, clientY?: number) => any;
}

const calculateUniverseBoundaries = (diagram: Diagram) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const items = diagram.items.toArray();
    for (const item of items) {
        const rect2 = item.bounds(diagram);
        const left = rect2.position.x - 85;
        const top = rect2.position.y - 75;
        
        const rect = {
            left: left,
            top: top,
            right: left + rect2.size.x,
            bottom: top + rect2.size.y
        };
        if (rect.left < minX) { minX = rect.left; }
        if (rect.right > maxX) { maxX = rect.right; }
        if (rect.top < minY) { minY = rect.top; }
        if (rect.bottom > maxY) { maxY = rect.bottom; }
    }
    return { minX, maxX, minY, maxY };
};

class UIMenu extends React.PureComponent<UIMenuProps> {
    private doZoomOut = () => {
        this.props.setZoom(Math.max(minZoom, this.props.zoom - .25));
    }

    private doZoomToFit = () => {
        // calculate universe bound
        const rect = calculateUniverseBoundaries(this.props.selectedDiagram);
        const editorView = document.getElementById('editor-view').getBoundingClientRect();
        const zoom = 1 / (1.2 * Math.max((rect.maxX - rect.minX) / editorView.width, (rect.maxY - rect.minY) / editorView.height));        
        this.props.setZoom(zoom, (rect.minX + rect.maxX) / 2, (rect.minY + rect.maxY) / 2);
    }

    private doZoomIn = () => {
        this.props.setZoom(Math.min(maxZoom, this.props.zoom + .25));
    }

    public render() {
        const { canZoomIn, canZoomOut, zoom } = this.props;

        return (
            <>
                <Tooltip title={withShortcut('Zoom Out', ['-'])}>
                    <Button className='menu-item'
                        disabled={!canZoomOut}
                        onClick={this.doZoomOut}>
                        <Icon type='minus' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!canZoomOut} onPressed={this.doZoomOut} keys='-' />

                <Tooltip title='Zoom to fit'>
                    <Button className='menu-item left-border right-border'
                        onClick={this.doZoomToFit}>
                        {(zoom * 100).toFixed()}%
                    </Button>
                </Tooltip>

                <Tooltip title={withShortcut('Zoom In', ['+'])}>
                    <Button className='menu-item'
                        disabled={!canZoomIn}
                        onClick={this.doZoomIn}>
                        <Icon type='plus' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!canZoomIn} onPressed={this.doZoomIn} keys='=' />
                <Shortcut disabled={!canZoomIn} onPressed={this.doZoomIn} keys='+' />
            </>
        );
    }
}

const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    return {
        selectedDiagram: getDiagram(state),
        canZoomIn: state.ui.zoom < maxZoom,
        canZoomOut: state.ui.zoom > minZoom,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    setZoom
}, dispatch);

export const UIMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIMenu);