import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { InteractionMode } from '@app/constants';

import { withShortcut } from '@app/core/utils/tooltip-helper';

import {
    setInteractionMode,
    UIStateInStore
} from '@app/wireframes/model';


interface InteractionModeMenuProps {
    interactionMode: InteractionMode;
    setInteractionMode: (mode: InteractionMode) => any;
}

class InteractionModeMenu extends React.PureComponent<InteractionModeMenuProps> {
    private setSelectionMode = (e: any) => {
        this.props.setInteractionMode(InteractionMode.Selection);
    }

    private setDragMode = (e: any) => {
        this.props.setInteractionMode(InteractionMode.Drag);
    }

    public render() {
        const { interactionMode } = this.props;

        let leftButtonClassName = 'menu-item right-border';
        let rightButtonClassName = 'menu-item';

        if (interactionMode === InteractionMode.Selection) {
            leftButtonClassName += ' selected';
        } else {
            rightButtonClassName += ' selected';
        }
        return (
            <>
                <Tooltip title='Select objects'>
                    <Button className={leftButtonClassName}
                        onClick={this.setSelectionMode}>
                        <Icon type='gateway' />
                    </Button>
                </Tooltip>

                <Tooltip title={withShortcut('Move the board', ['Space'])}>
                    <Button className={rightButtonClassName}
                        onClick={this.setDragMode}>
                        <Icon type='fullscreen' />
                    </Button>
                </Tooltip>
            </>
        );
    }
}

const mapStateToProps = (state: UIStateInStore) => {
    return {
        interactionMode: state.ui.interactionMode
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    setInteractionMode
}, dispatch);

export const InteractionModeMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(InteractionModeMenu);