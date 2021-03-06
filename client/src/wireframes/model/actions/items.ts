import { Reducer } from 'redux';

import { MathHelper, Vec2 } from '@app/core';

import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    DiagramItemSet,
    DiagramShape,
    DiagramVisual,
    EditorState,
    RendererService,
    Serializer
} from './../internal';

import {
    createDiagramAction,
    createItemsAction,
    DiagramRef,
    ItemsRef
} from './utils';

export interface IVisual {
    shapeId: string;
    renderer: string;
    x: number;
    y: number;
    properties?: object;
}


// tslint:disable:no-shadowed-variable

export const ADD_VISUAL = 'ADD_VISUAL';
export const addVisual = (diagram: DiagramRef, renderer: string, x: number, y: number, properties?: object, shapeId?: string) => {
    return createDiagramAction(ADD_VISUAL, diagram, { shapeId: shapeId || MathHelper.guid(), renderer, position: { x, y }, properties });
};

export const ADD_VISUALS = 'ADD_VISUALS';
export const addVisuals = (diagram: DiagramRef, visuals: IVisual[]) => {
    return createDiagramAction(ADD_VISUALS, diagram, { visuals });
};

export const ADD_IMAGE = 'ADD_IMAGE';
export const addImage = (diagram: DiagramRef, source: string, x: number, y: number, w: number, h: number, shapeId?: string) => {
    return createDiagramAction(ADD_IMAGE, diagram, { shapeId: shapeId || MathHelper.guid(), source, position: { x, y }, size: { w, h } });
};

export const ADD_ICON = 'ADD_ICON';
export const addIcon = (diagram: DiagramRef, text: string, fontFamily: string, x: number, y: number, shapeId?: string) => {
    return createDiagramAction(ADD_ICON, diagram, { shapeId: shapeId || MathHelper.guid(), text, fontFamily, position: { x, y } });
};

export const LOCK_ITEMS = 'LOCK_ITEMS';
export const lockItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(LOCK_ITEMS, diagram, items);
};

export const UNLOCK_ITEMS = 'UNLOCK_ITEMS';
export const unlockItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(UNLOCK_ITEMS, diagram, items);
};

export const SELECT_ITEMS = 'SELECT_ITEMS';
export const selectItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(SELECT_ITEMS, diagram, items);
};

export const REMOVE_ITEMS = 'REMOVE_ITEMS';
export const removeItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(REMOVE_ITEMS, diagram, items);
};

export const PASTE_ITEMS = 'PASTE_ITEMS';
export const pasteItems = (diagram: DiagramRef, json: string, x: number, y: number) => {
    return createDiagramAction(PASTE_ITEMS, diagram, { json, x, y });
};

const MAX_IMAGE_SIZE = 300;

function doAddVisual(rendererService: RendererService, rendererName: string, shapeId: string, x: number, y: number, props?: object) {
    const renderer = rendererService.registeredRenderers[rendererName];

    const shape = renderer.createDefaultShape(shapeId);

    const position =
        new Vec2(
            x + shape.transform.size.x * 0.5,
            y + shape.transform.size.y * 0.5);

    let configured = <DiagramVisual>shape.transformWith(t => t.moveTo(position));

    if (props) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                configured = configured.setAppearance(key, props[key]);
            }
        }
    }
    return configured;
}

export function items(rendererService: RendererService, serializer: Serializer): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case SELECT_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    return diagram.selectItems(action.itemIds);
                });
            case REMOVE_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    return diagram.removeItems(set!);
                });
            case LOCK_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    for (let item of set!.allItems) {
                        diagram = diagram.updateItem(item.id, i => i.lock());
                    }

                    return diagram;
                });
            case UNLOCK_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    for (let item of set!.allItems) {
                        diagram = diagram.updateItem(item.id, i => i.unlock());
                    }

                    return diagram;
                });
            case PASTE_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = serializer.deserializeSet(action.json);
                    diagram = diagram.addItems(set);

                    if (!set.allVisuals.length) {
                        return diagram;
                    }

                    const origin = set.allVisuals[0];
                    const originBounds = origin.bounds(diagram);

                    const offsetX = !action.x ? 0 : action.x - originBounds.position.x;
                    const offsetY = !action.y ? 0 : action.y - originBounds.position.y;

                    for (let item of set.allVisuals) {
                        diagram = diagram.updateItem(item.id, i => {
                            const oldBounds = i.bounds(diagram);
                            const newBounds = oldBounds.moveBy(new Vec2(offsetX, offsetY));
                            return i.transformByBounds(oldBounds, newBounds);
                        });
                    }

                    diagram = diagram.selectItems(set.rootIds);

                    return diagram;
                });
            case ADD_ICON:
                return state.updateDiagram(action.diagramId, diagram => {
                    const renderer = rendererService.registeredRenderers['Icon'];

                    const shape = renderer.createDefaultShape(action.shapeId);

                    const position =
                        new Vec2(
                            action.position.x + shape.transform.size.x * 0.5,
                            action.position.y + shape.transform.size.y * 0.5);

                    const configured =
                        shape.transformWith(t => t.moveTo(position))
                            .setAppearance(DiagramShape.APPEARANCE_TEXT, action.text)
                            .setAppearance(DiagramShape.APPEARANCE_ICON_FONT_FAMILY, action.fontFamily);

                    return diagram.addVisual(configured).selectItems([configured.id]);
                });
            case ADD_IMAGE:
                return state.updateDiagram(action.diagramId, diagram => {
                    let size =
                        new Vec2(
                            action.size.w,
                            action.size.h);

                    if (size.x > MAX_IMAGE_SIZE || size.y > MAX_IMAGE_SIZE) {
                        const ratio = size.x / size.y;

                        if (ratio > 1) {
                            size = new Vec2(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE / ratio);
                        } else {
                            size = new Vec2(MAX_IMAGE_SIZE * ratio, MAX_IMAGE_SIZE);
                        }
                    }

                    const position =
                        new Vec2(
                            action.position.x + size.x * 0.5,
                            action.position.y + size.y * 0.5);

                    const renderer = rendererService.registeredRenderers['Raster'];

                    const shape =
                        renderer.createDefaultShape(action.shapeId)
                            .transformWith(t => t.resizeTo(size))
                            .transformWith(t => t.moveTo(position))
                            .setAppearance('SOURCE', action.source);

                    return diagram.addVisual(shape).selectItems([shape.id]);
                });
            case ADD_VISUAL:
                return state.updateDiagram(action.diagramId, diagram => {
                    const configured = doAddVisual(rendererService, action.renderer, action.shapeId, action.position.x, action.position.y, action.properties);
                    
                    return diagram
                        .addVisual(configured)
                        .selectItems([configured.id]);
                });
            case ADD_VISUALS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const visuals: DiagramVisual[] = action.visuals.map((x: IVisual) => doAddVisual(rendererService, x.renderer, x.shapeId, x.x, x.y, x.properties));
                    let d = diagram;
                    for (const v of visuals) {
                        d = d.addVisual(v);
                    }
                    return d.selectItems(visuals.map(x => x.id));
                });
            default:
                return state;
        }
    };

    return reducer;
}

export function calculateSelection(items: DiagramItem[], diagram: Diagram, isSingleSelection?: boolean, isCtrl?: boolean, isShift?: boolean): string[] {
    if (!items) {
        return [];
    }

    let selectedItems: DiagramItem[] = [];

    function resolveGroup(item: DiagramItem, stop?: DiagramGroup) {
        while (true) {
            const group = diagram.parent(item.id);

            if (!group || group === stop) {
                break;
            } else {
                item = group;
            }
        }

        return item;
    }

    if (isSingleSelection) {
        if (items.length === 1 && items[0]) {
            const item = items[0];
            const itemId = item.id;

            if (isCtrl || isShift) {
                if (!item.isLocked) {
                    if (diagram.selectedItemIds.contains(itemId)) {
                        return diagram.selectedItemIds.remove(itemId).toArray();
                    } else {
                        return diagram.selectedItemIds.add(resolveGroup(item).id).toArray();
                    }
                } else {
                    return diagram.selectedItemIds.toArray();
                }
            } else {
                const group = diagram.parent(item.id);

                if (group && diagram.selectedItemIds.contains(group.id)) {
                    selectedItems.push(resolveGroup(item, group));
                } else {
                    selectedItems.push(resolveGroup(item));
                }
            }
        }
    } else {
        const selection: { [id: string]: DiagramItem } = {};

        for (let item of items) {
            if (item) {
                item = resolveGroup(item);

                if (!selection[item.id]) {
                    selection[item.id] = item;
                    selectedItems.push(item);
                }
            }
        }
    }

    if (selectedItems.length > 1) {
        selectedItems = selectedItems.filter(i => !i.isLocked);
    }

    return selectedItems.map(i => i.id);
}