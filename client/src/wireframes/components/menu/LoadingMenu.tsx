import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut, Title } from '@app/core';

import { withShortcut } from '@app/core/utils/tooltip-helper';

import {
    LoadingStateInStore,
    newDiagram,
    saveDiagramAsync,
    toggleInfoDialog,
    UIStateInStore
} from '@app/wireframes/model';

interface LoadingMenuProps {
    // The current read token.
    readToken: string;

    // Indicates if the info dialog, should be shown.
    showInfoDialog: boolean;

    // The window title.
    title: string;

    // Creates a new diagram.
    newDiagram: () => any;

    // Creates a new diagram.
    saveDiagramAsync: () => any;

    // Toggle the info dialog.
    toggleInfoDialog: (isOpen: boolean) => any;
}

class LoadingMenu extends React.PureComponent<LoadingMenuProps> {
    private doNewDiagram = () => {
        this.props.newDiagram();
    }

    private doSaveDiagram = () => {
        this.props.saveDiagramAsync();
    }

    // private doOpenInfoDialog = () => {
    //     this.props.toggleInfoDialog(true);
    // }

    // private doCloseInfoDialog = () => {
    //     this.props.toggleInfoDialog(false);
    // }

    public render() {
        const { /*showInfoDialog,*/ title } = this.props;

        return (
            <>
                <Title text={title} />

                <Tooltip
                    title={withShortcut('New Board', ['Ctrl', 'N'])}
                    placement='bottom'>
                    <Button className='menu-item right-border'
                        onClick={this.doNewDiagram}>
                        <i className='icon-new' />&nbsp;New
                    </Button>
                </Tooltip>

                <Shortcut onPressed={this.doNewDiagram} keys='ctrl+n' />

                <Tooltip title={withShortcut('Save Board', ['Ctrl', 'S'])} placement='bottom'>
                    <Button
                        className='menu-item'
                        onClick={this.doSaveDiagram}>
                        <i className='icon-save' />&nbsp;Save
                    </Button>
                </Tooltip>

                <Shortcut onPressed={this.doSaveDiagram} keys='ctrl+s' />

                {/* <Button className='menu-item' onClick={this.doOpenInfoDialog}>
                    <Icon type='question-circle-o' />
                </Button>

                <Modal title='About' visible={showInfoDialog} onOk={this.doCloseInfoDialog} onCancel={this.doCloseInfoDialog}>
                    <div dangerouslySetInnerHTML={{__html: text }} />
                </Modal> */}
            </>
        );
    }
}

const mapStateToProps = (state: LoadingStateInStore & UIStateInStore) => {
    const readToken = state.loading.readToken;

    const title =  readToken && readToken.length > 0 ?
        `${readToken} - wiseboard` :
        '(unsaved) - wiseboard';

    return { readToken: readToken, title, showInfoDialog: state.ui.showInfoDialog };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    newDiagram, saveDiagramAsync, toggleInfoDialog
}, dispatch);

export const LoadingMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoadingMenu);