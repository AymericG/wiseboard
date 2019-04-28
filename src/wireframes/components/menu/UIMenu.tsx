import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import { setZoom, UIStateInStore } from '@app/wireframes/model';

import { withShortcut } from '@app/core/utils/tooltip-helper';

import { maxZoom, minZoom } from '@app/constants';

interface UIMenuProps {
    // Indicates if you can zoom in.
    canZoomIn: boolean;

    // Indicates if you can zoom out.
    canZoomOut: boolean;

    // The zoom level.
    zoom: number;

    // Sets the zoom.
    setZoom: (value: number) => any;
}

class UIMenu extends React.PureComponent<UIMenuProps> {
    private doZoomOut = () => {
        this.props.setZoom(this.props.zoom - .25);
    }

    private doZoomIn = () => {
        this.props.setZoom(this.props.zoom + .25);
    }

    public render() {
        const { canZoomIn, canZoomOut, zoom } = this.props;

        return (
            <>
                <Tooltip title={withShortcut('Zoom Out', ['-'])}>
                    <Button className='menu-item right-border'
                        disabled={!canZoomOut}
                        onClick={this.doZoomOut}>
                        <Icon type='minus' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!canZoomOut} onPressed={this.doZoomOut} keys='-' />

                <span className='menu-item menu-item-label'>{zoom * 100}%</span>

                <Tooltip title={withShortcut('Zoom In', ['+'])}>
                    <Button className='menu-item left-border'
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

const mapStateToProps = (state: UIStateInStore) => {
    return {
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