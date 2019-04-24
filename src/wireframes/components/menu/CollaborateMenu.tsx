import { Icon, Tooltip } from 'antd';
import * as React from 'react';

declare function TogetherJS(t?: any): any;

interface CollaborateMenuState {
    // The menu button.
    button: any;
}

export class CollaborateMenu extends React.PureComponent<{}, CollaborateMenuState> {
    private doSaveButton = (button: any) => {
        this.setState({ button });
    }

    private doCollaborate = () => {
        TogetherJS(this.state.button);
    }

    public render() {
        return (
            <Tooltip title='Collaborate together'>
                <button ref={this.doSaveButton} className='menu-item ant-btn menu-item ant-btn-lg' onClick={this.doCollaborate}>
                    <Icon type='team' />
                </button>
            </Tooltip>
        );
    }
}