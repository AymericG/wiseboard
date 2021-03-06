import * as Immutable from 'immutable';

import {
    ImmutableList,
    MathHelper,
    Rotation
} from '@app/core';

import { DiagramGroup } from './diagram-group';
import { DiagramItemSet } from './diagram-item-set';
import { DiagramShape } from './diagram-shape';
import { RendererService } from './renderer.service';
import { Transform } from './transform';

export class Serializer {
    constructor(
        private readonly rendererService: RendererService
    ) {
    }

    public deserializeSet(json: string): DiagramItemSet {
        const s: DiagramShape[] = [];
        const g: DiagramGroup[] = [];

        const input = JSON.parse(json);

        const idMap: { [id: string]: string } = {};
        for (const jsonShape of input.visuals) {
            idMap[jsonShape.id] = jsonShape.id;
        }

        for (const jsonGroup of input.groups) {
            idMap[jsonGroup.id] = jsonGroup.id;
        }

        for (const jsonShape of input.visuals) {
            const shape = this.deserializeShape(jsonShape, idMap[jsonShape.id]);

            s.push(shape);
        }

        for (const jsonGroup of input.groups) {
            const group = Serializer.deserializeGroup(jsonGroup, idMap[jsonGroup.id], idMap);

            g.push(group);
        }

        return new DiagramItemSet(g, s);
    }

    public serializeSet(set: DiagramItemSet, changeIds: boolean): string {
        const output: any = { visuals: [], groups: [] };

        const idMap: any = {};
        for (let visual of set.allVisuals) {
            const shape = <DiagramShape>visual;
            let id: string = shape.id;
            if (changeIds) {
                const newId = MathHelper.guid();
                idMap[shape.id] = newId;
                id = newId;
            }
            const json = Serializer.serializeShape(shape, id);

            output.visuals.push(json);
        }

        for (let group of set.allGroups) {
            const json = Serializer.serializeGroup(group, changeIds, idMap);

            output.groups.push(json);
        }

        return JSON.stringify(output);
    }

    private static deserializeGroup(input: any, id: string, idMap: { [id: string]: string }): DiagramGroup {
        return DiagramGroup.createGroup(id,
            Serializer.deserializeChildIds(input, idMap),
            Serializer.deserializeRotation(input));
    }

    private static serializeGroup(group: DiagramGroup, changeIds: boolean, idMap: any) {
        const output = { id: changeIds ? MathHelper.guid() : group.id };

        // replace changed ids.
        const ids: string[] = [];
        for (let i = 0; i < group.childIds.size; i++) {
            const oldId = group.childIds[i];
            if (idMap[oldId]) {
                ids.push(idMap[oldId]);
            } else {
                ids.push(oldId);
            }
        }
        group = group.removeItems(...group.childIds.toArray()).addItems(...ids) as DiagramGroup;
        Serializer.serializeChildIds(group.childIds, output);
        Serializer.serializeRotation(group.rotation, output);

        return output;
    }

    private deserializeShape(input: any, id: string): DiagramShape {
        const renderer = Serializer.deserializeRenderer(input);

        let shape = this.rendererService.registeredRenderers[renderer].createDefaultShape(id);

        shape = Serializer.deserializeAppearance(shape, input);
        shape = Serializer.deserializeTransform(shape, input);

        return shape;
    }

    private static serializeShape(shape: DiagramShape, id: string): any {
        const output = { id };
        Serializer.serializeRenderer(shape.renderer, output);
        Serializer.serializeTransform(shape.transform, output);
        Serializer.serializeAppearance(shape.appearance, output);

        return output;
    }

    private static serializeChildIds(childIds: ImmutableList<string>, output: any) {
        output['childIds'] = childIds.toArray();
    }

    private static deserializeChildIds(input: any, idMap: { [id: string]: string }): ImmutableList<string> {
        return ImmutableList.of(...input['childIds'].map((i: string) => idMap[i]));
    }

    private static serializeRotation(rotation: Rotation, output: any) {
        output['rotation'] = rotation.degree;
    }

    private static deserializeRotation(input: any): Rotation {
        return Rotation.fromDegree(input['rotation']);
    }

    private static serializeRenderer(renderer: string, output: any) {
        output['renderer'] = renderer;
    }

    private static deserializeRenderer(input: any): string {
        return input['renderer'];
    }

    private static serializeAppearance(appearance: Immutable.Map<string, any>, output: any) {
        output['appearance'] = appearance.toJS();
    }

    private static deserializeAppearance(shape: DiagramShape, input: any): DiagramShape {
        return shape.replaceAppearance(shape.appearance.merge(Immutable.Map<string, any>(input['appearance']))) as DiagramShape;
    }

    private static serializeTransform(transform: Transform, output: any) {
        output['transform'] = transform.toJS();
    }

    private static deserializeTransform(shape: DiagramShape, input: any): DiagramShape {
        return shape.transformTo(Transform.fromJS(input['transform']));
    }
}