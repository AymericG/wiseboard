import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as svg from 'svg.js';

import './Editor.scss';

import { ImmutableList, Vec2 } from '@app/core';

import {
    ClipboardShortcutsContainer
} from '@app/wireframes/components';

import {
    changeItemsAppearance,
    Diagram,
    DiagramGroup,
    DiagramItem,
    DiagramShape,
    DiagramVisual,
    EditorStateInStore,
    getDiagram,
    getEditor,
    getSelectedItems,
    getSelectedItemsWithLocked,
    RendererService,
    selectItems,
    setInteractionMode,
    Transform,
    transformItems,
    UIStateInStore
} from '@app/wireframes/model';

import { CanvasView }           from './CanvasView';
import { InteractionService }   from './interaction-service';
import { NavigationAdorner }    from './NavigationAdorner';
import { SelectionAdorner }     from './SelectionAdorner';
import { ShapeRef }             from './shape-ref';
import { TextAdorner }          from './TextAdorner';
import { TransformAdorner }     from './TransformAdorner';

import { InteractionMode } from '@app/constants';

export interface EditorProps {
    editorContent: React.RefObject<any>;

    // The renderer service.
    rendererService: RendererService;

    interationMode: InteractionMode;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected items including locked items.
    selectedItemsWithLocked: DiagramItem[];

    // The width of the canvas.
    zoomedWidth: number;

    // The height of the canvas.
    zoomedHeight: number;

    // The zoom value of the canvas.
    zoom: number;

    // The view size of the editor.
    viewSize: Vec2;

    // A function to select a set of items.
    selectItems: (diagram: Diagram, itemIds: string[]) => any;

    // A function to change the appearance of a visual.
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => any;

    setInteractionMode: (interactionMode: InteractionMode) => void;

    // A function to transform a set of items.
    transformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => any;
}

const showDebugOutlines = process.env.NODE_ENV === 'false';

class Editor extends React.Component<EditorProps> {
    private adornersSelect: svg.Container;
    private adornersTransform: svg.Container;
    private diagramTools: svg.Element;
    private diagramRendering: svg.Container;
    private interactionService: InteractionService;
    private shapeRefsById: { [id: string]: ShapeRef } = {};

    public componentDidUpdate() {
        this.forceRender();
    }

    private initDiagramScope = (doc: svg.Doc) => {

        // create grid pattern
        const pattern = doc.pattern(20, 20, (add: any) => {
            add.circle(1).fill('none').stroke({ color: '#999', width: '1'});
        });
        
        this.diagramTools = doc.rect().fill(pattern);
        this.diagramRendering = doc.group();
        this.adornersSelect = doc.group();
        this.adornersTransform = doc.group();

        this.interactionService = new InteractionService([this.adornersSelect, this.adornersTransform], this.diagramRendering, doc);

        this.forceRender();
        this.forceUpdate();
    }

    private forceRender() {
        if (!this.interactionService) {
            return;
        }

        const allShapesById: { [id: string]: boolean } = {};
        const allShapes = this.getOrderedShapes();

        allShapes.forEach(item => allShapesById[item.id] = true);

        for (let id in this.shapeRefsById) {
            if (this.shapeRefsById.hasOwnProperty(id)) {
                const ref = this.shapeRefsById[id];

                ref.remove();

                if (!allShapesById[id]) {
                    delete this.shapeRefsById[id];
                }
            }
        }

        for (let shape of allShapes) {
            let ref = this.shapeRefsById[shape.id];

            if (!ref) {
                const renderer = this.props.rendererService.registeredRenderers[shape.renderer];

                ref = new ShapeRef(this.diagramRendering, renderer, showDebugOutlines);
            }

            ref.render(shape);

            this.shapeRefsById[shape.id] = ref;
        }
    }

    private getOrderedShapes() {
        const flattenShapes: DiagramShape[] = [];

        const diagram = this.props.selectedDiagram;

        if (diagram) {
            let handleContainer: (itemIds: ImmutableList<string>) => any;

            handleContainer = itemIds => {
                itemIds.forEach(itemId => {
                    const item = diagram.items.get(itemId);

                    if (item) {
                        if (item instanceof DiagramShape) {
                            flattenShapes.push(item);
                        }

                        if (item instanceof DiagramGroup) {
                            handleContainer(item.childIds);
                        }
                    }
                });
            };

            handleContainer(diagram.rootIds);
        }

        return flattenShapes;
    }

    public render() {
        // tslint:disable:no-shadowed-variable
        const {
            changeItemsAppearance,
            interationMode,
            selectedDiagram,
            selectedItems,
            selectItems,
            selectedItemsWithLocked,
            setInteractionMode,
            transformItems,
            zoom,
            zoomedHeight,
            zoomedWidth,
            viewSize
        } = this.props;

        const w = viewSize.x;
        const h = viewSize.y;

        if (this.interactionService) {
            this.diagramTools.size(w, h);
            this.adornersSelect.size(w, h);
            this.adornersTransform.size(w, h);
            this.diagramRendering.size(w, h);
        }

        return (
            <>
                {selectedDiagram &&
                    <div className='editor' style={{ position: 'relative'/*, width: sizeInPx(w), height: sizeInPx(h)*/ }}>
                        <CanvasView onInit={this.initDiagramScope}
                            zoom={zoom}
                            zoomedWidth={zoomedWidth}
                            zoomedHeight={zoomedHeight} />

                        {this.interactionService && selectedDiagram && (
                            <>
                                <ClipboardShortcutsContainer />

                                <NavigationAdorner
                                    interactionMode={interationMode}
                                    setInteractionMode={setInteractionMode}
                                    editorContent={this.props.editorContent}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItemsWithLocked}
                                    selectItems={selectItems} />

                                <TransformAdorner
                                    adorners={this.adornersTransform}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItems}
                                    transformItems={transformItems}
                                    viewSize={viewSize}
                                    zoom={zoom} />

                                <SelectionAdorner
                                    interactionMode={interationMode}
                                    adorners={this.adornersSelect}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItemsWithLocked}
                                    selectItems={selectItems} />

                                <TextAdorner
                                    changeItemsAppearance={changeItemsAppearance}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItems}
                                    zoom={zoom} />
                                

                            </>
                        )}
                    </div>
                }
            </>
        );
    }
}

const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    const editor = getEditor(state);

    return {
        interationMode: state.ui.interactionMode,
        selectedDiagram: getDiagram(state),
        selectedItems: getSelectedItems(state),
        selectedItemsWithLocked: getSelectedItemsWithLocked(state),
        viewSize: editor.size,
        zoomedWidth: editor.size.x * state.ui.zoom,
        zoomedHeight: editor.size.y * state.ui.zoom,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    selectItems, changeItemsAppearance, transformItems, setInteractionMode
}, dispatch);

export const EditorContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Editor);