import { MathHelper } from '@app/core';

import {
    Diagram,
    DiagramGroup,
    DiagramShape,
    EditorState,
    grouping,
    groupItems,
    ungroupItems
} from '@app/wireframes/model';

describe('GroupingReducer', () => {
    const reducer = grouping();

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should group shapes and select new group', () => {
        const diagram =
            Diagram.empty(MathHelper.guid())
                .addVisual(DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 100))
                .addVisual(DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 100));

        const groupId = 'group1';

        const action = groupItems(diagram, diagram.items.toArray(), groupId);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.last;

        expect(newDiagram.selectedItemIds.toArray()).toEqual([groupId]);
        expect(newDiagram.rootIds.toArray()).toEqual([groupId]);
    });

    it('should ungroup multiple groups and select their children', () => {
        const groupId1 = 'group1';
        const groupId2 = 'group2';

        let diagram =
            Diagram.empty(MathHelper.guid())
                .addVisual(DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 100))
                .addVisual(DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 100))
                .addVisual(DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 100))
                .addVisual(DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 100));

        const shapes = diagram.items.toArray();

        diagram = diagram.group(groupId1, [shapes[0].id, shapes[1].id]);
        diagram = diagram.group(groupId2, [shapes[2].id, shapes[3].id]);

        const group1 = <DiagramGroup>diagram.items.get(groupId1);
        const group2 = <DiagramGroup>diagram.items.get(groupId2);

        const action = ungroupItems(diagram, [group1, group2, DiagramGroup.createGroup(MathHelper.guid(), [])]);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.last;

        const ids = shapes.map(i => i.id);

        expect(newDiagram.selectedItemIds.toArray()).toEqual(ids);
        expect(newDiagram.rootIds.toArray()).toEqual(ids);
    });
});