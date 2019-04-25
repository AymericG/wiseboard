import { Button, Collapse, Layout, Tabs } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
    CustomPropertiesContainer,
    EditorViewContainer,
    HistoryMenuContainer,
    IconsContainer,
    LoadingMenuContainer,
    ShapesContainer,
    UIMenuContainer,
    VisualPropertiesContainer
} from '@app/wireframes/components';

import {
    loadDiagramAsync,
    newDiagram,
    selectTab,
    toggleLeftSidebar,
    toggleRightSidebar,
    UIStateInStore
} from '@app/wireframes/model';

interface AppOwnProps {
    // The read token of the diagram.
    token: string;
}

interface AppProps {
    // Show left sidebar.
    showLeftSidebar: boolean;

    // Show right sidebar.
    showRightSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    // Select a tab.
    selectTab: (key: string) => any;

    // Show or hide the left sidebar.
    toggleLeftSidebar: () =>  any;

    // Show or hide the right sidebar.
    toggleRightSidebar: () =>  any;

    // Creates a new diagram.
    newDiagram: (navigate: boolean) =>  any;

    // Load a diagram.
    loadDiagramAsync: (token: string, navigate: boolean) => any;
}

const mapStateToProps = (state: UIStateInStore, props: AppOwnProps) => {
    return {
        selectedTab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar,
        showRightSidebar: state.ui.showRightSidebar
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    loadDiagramAsync,
    newDiagram,
    toggleLeftSidebar,
    toggleRightSidebar,
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

    private doToggleRightSidebar = () => {
        this.props.toggleRightSidebar();
    }

    public render() {
        const { selectedTab, showLeftSidebar, showRightSidebar } = this.props;

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
                    <Layout.Sider width={330} className='sidebar-right'
                        collapsed={!showRightSidebar}
                        collapsedWidth={0}>

                        <Collapse bordered={false} defaultActiveKey={['visual', 'custom']}>
                            <Collapse.Panel key='visual' header='Visual'>
                                <VisualPropertiesContainer />
                            </Collapse.Panel>
                            <Collapse.Panel key='custom' header='Custom'>
                                <CustomPropertiesContainer />
                            </Collapse.Panel>
                        </Collapse>
                    </Layout.Sider>

                    <Button icon={toggleIcon(showLeftSidebar)}
                        className={toggleClass(showLeftSidebar, 'left')}
                        size='small'
                        shape='circle'
                        onClick={this.doToggleLeftSidebar} />

                    <Button icon={toggleIcon(!showRightSidebar)}
                        className={toggleClass(showRightSidebar, 'right')}
                        size='small'
                        shape='circle'
                        onClick={this.doToggleRightSidebar} />
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