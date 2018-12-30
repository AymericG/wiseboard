import * as React from 'react';
import { DragSource, DragSourceCollector, DragSourceSpec } from 'react-dnd';

import { ShapeInfo } from '@app/wireframes/model';

interface ShapeImageProps {
    // The shape data.
    shape: ShapeInfo;

    // The drag source.
    connectDragSource?: any;

    // The drag preview.
    connectDragPreview?: any;
}

const ShapeTarget: DragSourceSpec<ShapeImageProps, any> = {
    beginDrag: props => {
        return { shape: props.shape.name, offset: props.shape.offset };
    }
};

const ShapeConnect: DragSourceCollector<any> = (connector, monitor) => {
    return { connectDragSource: connector.dragSource(), connectDragPreview: connector.dragPreview() };
};

@DragSource('DND_ASSET', ShapeTarget, ShapeConnect)
export class ShapeImage extends React.PureComponent<ShapeImageProps> {
    public render() {
        const preview = (node: any) => {
            if (node) {
                this.props.connectDragPreview(node.cloneNode(), {
                    dropEffect: 'copy',
                    anchorX: 0,
                    anchorY: 0
                });
            }
        };

        return this.props.connectDragSource!(
            <img ref={preview} className='asset-shape-image' alt={this.props.shape.label} src={urlPath(this.props.shape)} />,
        {
            dropEffect: 'copy'
        });
    }
}

const pathToShapes = require.context('../../../images/shapes', true);

const urlPath = (shape: ShapeInfo) => {
    return pathToShapes(`./${shape.searchTerm}.png`);
};