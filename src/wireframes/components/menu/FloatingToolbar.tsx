import * as React from 'react';

import { Rotation } from '@app/core';
import { connect } from 'react-redux';

import {
    Diagram,
    DiagramItem,
    EditorStateInStore,
    getDiagram,
    getSelectedItems,
    Transform,
    UIStateInStore
} from '@app/wireframes/model';

import {
    ArrangeMenuContainer,
    CustomPropertiesMenuContainer,
    LayoutMenuContainer
} from '@app/wireframes/components';

export interface FloatingToolbarProps {
    // The current zoom value.
    zoom: number;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];
}

interface FloatingToolbarState {
    hideToolbar: boolean;
}

class FloatingToolbar extends React.Component<FloatingToolbarProps, FloatingToolbarState> {
    
    constructor(props: FloatingToolbarProps, context: any) {
        super(props, context);
        this.state = { hideToolbar: false };
    }
    
    private calculateTransform(selectedItems: DiagramItem[], selectedDiagram: Diagram) {
        let transform: Transform;

        if (selectedItems.length === 1) {
            transform = selectedItems[0].bounds(selectedDiagram);
        } else {
            transform = Transform.createFromTransformationsAndRotations(selectedItems.map(x => x.bounds(selectedDiagram)), Rotation.ZERO);
        }

        return transform;
    }

    public render(): any {
        const { selectedDiagram, selectedItems, zoom } = this.props;

        if (this.state.hideToolbar || !selectedItems.length) {
            return null;
        }
        const transform = this.calculateTransform(selectedItems, selectedDiagram);

        const left = transform.position.x * zoom;
        const top = zoom * (transform.position.y - transform.size.y / 2 - 20) - 50;

        const style = { left, top };
        return <div
            className='editor-floating-toolbox'
            style={style}>

            <CustomPropertiesMenuContainer />
            <LayoutMenuContainer />
            <ArrangeMenuContainer />
        </div>;
    }
}


const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    return {
        zoom: state.ui.zoom,
        selectedDiagram: getDiagram(state),
        selectedItems: getSelectedItems(state)
    };
};

export const FloatingToolbarContainer = connect(
    mapStateToProps
)(FloatingToolbar);