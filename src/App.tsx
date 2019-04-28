import { Button, Layout, Tabs } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { LoadingStateInStore } from './wireframes/model/loading-state';

import {
    EditorViewContainer,
    HistoryMenuContainer,
    IconsContainer,
    InteractionModeMenuContainer,
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
import ReactDOM = require('react-dom');

interface AppOwnProps {
    // The read token of the diagram.
    token: string;
}

interface AppProps {
    // Show left sidebar.
    showLeftSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    isLoaded: boolean;

    // Select a tab.
    selectTab: (key: string) => any;

    // Show or hide the left sidebar.
    toggleLeftSidebar: () =>  any;

    // Creates a new diagram.
    newDiagram: (navigate: boolean) =>  any;

    // Load a diagram.
    loadDiagramAsync: (token: string, navigate: boolean) => any;
}

const mapStateToProps = (state: UIStateInStore & LoadingStateInStore, props: AppOwnProps) => {
    return {
        selectedTab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar,
        isLoaded: state.loading.isLoaded
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    loadDiagramAsync,
    newDiagram,
    toggleLeftSidebar,
    selectTab
}, dispatch);

class App extends React.PureComponent<AppProps & AppOwnProps> {
    private editorContent: any;

    constructor(props: AppProps & AppOwnProps) {
        super(props);

        this.editorContent = React.createRef();
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

        if (props.isLoaded && !this.props.isLoaded) {
            this.zoomToCenter();
        }
    }

    private doSelectTab = (key: string) => {
        this.props.selectTab(key);
    }

    private doToggleLeftSidebar = () => {
        this.props.toggleLeftSidebar();
    }

    private zoomToCenter() {
        const element: any = ReactDOM.findDOMNode(this.editorContent.current);

        if (!element) { return; }
        element.scrollLeft = element.scrollWidth / 2 - element.clientWidth / 2;
        element.scrollTop = element.scrollHeight / 2 - element.clientHeight / 2;
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
                    <Layout.Content className='editor-content' ref={this.editorContent}>
                        <div className='editor-top-right'>
                            <div className='editor-toolbox'>
                                <LoadingMenuContainer />
                            </div>
                        </div>

                        <EditorViewContainer spacing={40} editorContent={this.editorContent}/>

                        <div className='editor-bottom-right'>
                            <div className='editor-toolbox'>
                                <InteractionModeMenuContainer />
                            </div>
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