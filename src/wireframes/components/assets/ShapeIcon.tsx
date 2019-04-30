import * as React from 'react';
import { DragSource, DragSourceCollector, DragSourceSpec } from 'react-dnd';

import { ShapeInfo } from '@app/wireframes/model';

interface ShapeIconProps {
    // The shape data.
    shape: ShapeInfo;

    // The drag source.
    connectDragSource?: any;

    // The drag preview.
    connectDragPreview?: any;
}

const ShapeTarget: DragSourceSpec<ShapeIconProps, any> = {
    beginDrag: props => {
        return { shape: props.shape.name, offset: props.shape.offset };
    }
};

const ShapeConnect: DragSourceCollector<any> = (connector, monitor) => {
    return { connectDragSource: connector.dragSource(), connectDragPreview: connector.dragPreview() };
};

@DragSource('DND_ASSET', ShapeTarget, ShapeConnect)
export class ShapeIcon extends React.PureComponent<ShapeIconProps> {
    public render() {
        const { shape } = this.props;
        
        const preview = (node: any) => {
            if (!node) {
                return;
            }

            const clone = new Image();
            clone.src = dragPath(this.props.shape);

            this.props.connectDragPreview(clone, {
                dropEffect: 'copy',
                anchorX: 0,
                anchorY: 0
            });
        };

        return this.props.connectDragSource!(<i ref={preview} className={'fa ' + shape.icon} />, { dropEffect: 'copy' });
    }
}

const pathToShapes = require.context('../../../images/shapes', true);

const dragPath = (shape: ShapeInfo) => {
    return pathToShapes(`./${shape.displaySearch}.png`);
};