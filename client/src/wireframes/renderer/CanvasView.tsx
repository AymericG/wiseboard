import * as React from 'react';
import * as svg from 'svg.js';

export interface CanvasViewProps {
    // The width of the canvas.
    zoomedWidth: number;

    x: number;
    y: number;

    // The height of the canvas.
    zoomedHeight: number;

    // The zoom value of the canvas.
    zoom: number;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (scope: svg.Doc) => any;
}

export class CanvasView extends React.Component<CanvasViewProps> {
    private docElement: any;
    private document: svg.Doc;

    private initialize = (element: any) => {
        this.docElement = element;

        if (element) {
            this.document = svg(this.docElement).id('svg');
            if (document) {
                this.document.style({ position: 'relative', overflow: 'visible' });
            }

            this.updateViewSettings(this.props);

            this.props.onInit(this.document);
        }
    }

    public componentWillReceiveProps(nextProps: CanvasViewProps) {
        this.updateViewSettings(nextProps);
    }

    private updateViewSettings(props: CanvasViewProps) {
        if (this.document) {
            const { zoomedWidth, zoomedHeight } = props;

            const w = zoomedWidth / props.zoom;
            const h = zoomedHeight / props.zoom;

            this.document
                .size(zoomedWidth, zoomedHeight)
                .viewbox(0, 0, w, h);
        }
    }

    public render() {
        const { x, y } = this.props;
        const style = { transform: 'translate(' + x + 'px, ' + y + 'px)'};
        return <div id='canvas' style={style} className={this.props.className} ref={this.initialize} />;
    }
}