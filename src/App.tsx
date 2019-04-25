import { Button, Layout, Tabs } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    EditorViewContainer,
    HistoryMenuContainer,
    IconsContainer,
    LoadingMenuContainer,
    ShapesContainer,
    UIMenuContainer
} from '@app/wireframes/components';

import {
    loadDiagramAsync,
    newDiagram,
    selectTab,
    toggleLeftSidebar,
    UIStateInStore
} from '@app/wireframes/model';

interface AppOwnProps {
    // The read token of the diagram.
    token: string;
}

interface AppProps {
    // Show left sidebar.
    showLeftSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    // Select a tab.
    selectTab: (key: string) => any;

    // Show or hide the left sidebar.
    toggleLeftSidebar: () =>  any;

    // Creates a new diagram.
    newDiagram: (navigate: boolean) =>  any;

    // Load a diagram.
    loadDiagramAsync: (token: string, navigate: boolean) => any;
}

const mapStateToProps = (state: UIStateInStore, props: AppOwnProps) => {
    return {
        selectedTab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    loadDiagramAsync,
    newDiagram,
    toggleLeftSidebar,
    selectTab
}, dispatch);

class App extends React.PureComponent<AppProps & AppOwnProps> {
    constructor(props: AppProps & AppOwnProps) {
        super(props);

        props.newDiagram(false);

        if (props.token && props.token.length > 0) {
            props.loadDiagramAsync(props.token, false);
        }
    }

    public componentWillReceiveProps(props: AppProps & AppOwnProps) {
        if (this.props.token !== props.token) {
            if (props.token && props.token.length > 0) {
                props.loadDiagramAsync(props.token, false);
            } else {
                props.newDiagram(false);
            }
        }
    }

    private doSelectTab = (key: string) => {
        this.props.selectTab(key);
    }

    private doToggleLeftSidebar = () => {
        this.props.toggleLeftSidebar();
    }

    public render() {
        const { selectedTab, showLeftSidebar } = this.props;

        return (
            <Layout>
                <Layout className='content'>
                    <Layout.Sider width={320} className='sidebar-left'
                        collapsed={!showLeftSidebar}
                        collapsedWidth={0}>

                        <Tabs type='card' onTabClick={this.doSelectTab} activeKey={selectedTab}>
                            <Tabs.TabPane key='shapes' tab='Shapes'>
                                <ShapesContainer />
                            </Tabs.TabPane>
                            <Tabs.TabPane key='icons' tab='Icons'>
                                <IconsContainer />
                            </Tabs.TabPane>
                        </Tabs>
                    </Layout.Sider>
                    <Layout.Content className='editor-content'>
                        <div className='editor-top-right'>
                            <div className='editor-toolbox'>
                                <LoadingMenuContainer />
                            </div>
                        </div>

                        <EditorViewContainer spacing={40} />
                        <div className='editor-bottom-right'>
                            <div className='editor-toolbox'>
                                <HistoryMenuContainer />
                            </div>
                            <div className='editor-toolbox'>
                                <UIMenuContainer />
                            </div>
                        </div>
                    </Layout.Content>

                    <Button icon={toggleIcon(showLeftSidebar)}
                        className={toggleClass(showLeftSidebar, 'left')}
                        size='small'
                        shape='circle'
                        onClick={this.doToggleLeftSidebar} />

                </Layout>
            </Layout>
        );
    }
}

const toggleIcon = (left: boolean) => {
    return left ? 'left' : 'right';
};

const toggleClass = (visible: boolean, side: string) => {
    return `toggle-button-${side}` + (visible ? ' visible' : '');
};

export const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);