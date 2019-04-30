import { Button, Layout, Tabs } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import {
    EditorViewContainer,
    FloatingToolbarContainer,
    HistoryMenuContainer,
    IconsContainer,
    InteractionModeMenuContainer,
    LoadingMenuContainer,
    MainToolbarContainer,
    ShapesContainer,
    UIMenuContainer
} from '@app/wireframes/components';

import {
    calculateSelection,
    Diagram,
    EditorStateInStore,
    getDiagram,
    loadDiagramAsync,
    LoadingStateInStore,
    newDiagram,
    selectItems,
    selectTab,
    toggleLeftSidebar,
    UIStateInStore
} from '@app/wireframes/model';

// import ReactDOM = require('react-dom');

interface AppOwnProps {
    // The read token of the diagram.
    token: string;
}

interface AppProps {
    // Show left sidebar.
    showLeftSidebar: boolean;

    // The selected tabs
    selectedTab: string;

    // The selected diagram.
    selectedDiagram: Diagram | null;


    // isLoaded: boolean;

    // Select a tab.
    selectTab: (key: string) => any;

    // Show or hide the left sidebar.
    toggleLeftSidebar: () => any;

    // Creates a new diagram.
    newDiagram: (navigate: boolean) => any;

    // Load a diagram.
    loadDiagramAsync: (token: string, navigate: boolean) => any;

    // Selcts items.
    selectItems: (diagram: Diagram, itemsIds: string[]) => any;

}

const mapStateToProps = (state: UIStateInStore & LoadingStateInStore & EditorStateInStore, props: AppOwnProps) => {
    return {
        selectedDiagram: getDiagram(state),
        selectedTab: state.ui.selectedTab,
        showLeftSidebar: state.ui.showLeftSidebar
        // isLoaded: state.loading.isLoaded
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    loadDiagramAsync,
    newDiagram,
    toggleLeftSidebar,
    selectItems,
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

        // if (props.isLoaded && !this.props.isLoaded) {
        //     this.zoomToCenter();
        // }
    }

    private doSelectTab = (key: string) => {
        this.props.selectTab(key);
    }

    private doToggleLeftSidebar = () => {
        this.props.toggleLeftSidebar();
    }

    // private zoomToCenter() {
    //     const element: any = ReactDOM.findDOMNode(this.editorContent.current);

    //     if (!element) { return; }
    //     element.scrollLeft = element.scrollWidth / 2 - element.clientWidth / 2;
    //     element.scrollTop = element.scrollHeight / 2 - element.clientHeight / 2;
    // }

    private doSelectAll = () => {
        const selectedDiagram = this.props.selectedDiagram;

        if (selectedDiagram) {
            this.props.selectItems(selectedDiagram, calculateSelection(selectedDiagram.items.toArray(), selectedDiagram));
        }
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

                    <div className='editor-main-toolbox'>
                        <div className='editor-toolbox'>
                            <InteractionModeMenuContainer />
                        </div>
                        <div className='editor-toolbox'>
                            <MainToolbarContainer />
                        </div>
                    </div>

                    <div className='editor-top-right'>
                        <div className='editor-toolbox'>
                            <LoadingMenuContainer />
                        </div>
                    </div>

                    <EditorViewContainer />

                    <FloatingToolbarContainer />

                    <div className='editor-bottom-right'>
                        <div className='editor-toolbox'>
                            <HistoryMenuContainer />
                        </div>
                        <div className='editor-toolbox'>
                            <UIMenuContainer />
                        </div>
                    </div>

                    <Shortcut 
                        onPressed={this.doSelectAll} 
                        keys='ctrl+a' />

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