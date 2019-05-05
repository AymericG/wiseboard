﻿import * as Immutable from 'immutable';

import { Rotation, Vec2 } from '@app/core';

import { Configurable } from './configurables';
import { Constraint } from './constraints';
import { Diagram } from './diagram';
import { DiagramVisual } from './diagram-visual';
import { Transform } from './transform';

const EMPTY_CONFIGURABLES: Configurable[] = [];
const EMPTY_APPEARANCE = {};

export class DiagramShape extends DiagramVisual {
    public static readonly APPEARANCE_TEXT = 'TEXT';
    public static readonly APPEARANCE_TEXT_BEHAVIOUR = 'TEXT_BEHAVIOUR';
    public static readonly APPEARANCE_TEXT_ALIGNMENT = 'TEXT_ALIGNMENT';
    public static readonly APPEARANCE_TEXT_DISABLED = 'TEXT_DISABLED';
    public static readonly APPEARANCE_FONT_FAMILY = 'FONT_FAMILY';
    public static readonly APPEARANCE_FONT_FAMILY_CLASS_NAME = 'FONT_FAMILY_CLASS_NAME';
    public static readonly APPEARANCE_FONT_SIZE = 'FONT_SIZE';
    public static readonly APPEARANCE_FONT_WEIGHT = 'FONT_WEIGHT';
    public static readonly APPEARANCE_FOREGROUND_COLOR = 'BACKGROUND_COLOR';
    public static readonly APPEARANCE_BACKGROUND_COLOR = 'FOREGROUND_COLOR';
    public static readonly APPEARANCE_ICON_FONT_FAMILY = 'ICON_FONT_FAMILY';

    private constructor(id: string, isLocked: boolean, appearance: Immutable.Map<string, any>,
        public transform: Transform,
        public configurables: Configurable[],
        public constraint: Constraint | undefined,
        public renderer: string
    ) {
        super(id, isLocked, appearance);
    }

    public static createShape(id: string, renderer: string, w: number, h: number, configurable?: Configurable[], appearance?: { [key: string]: any }, constraint?: Constraint): DiagramShape {
        const result = new DiagramShape(id, false,
            DiagramShape.createAppearance(appearance),
            DiagramShape.createTransform(w, h),
            DiagramShape.createConfigurables(configurable),
            constraint,
            renderer);

        result.afterClone(undefined!);

        Object.freeze(result);

        return result;
    }

    private static createConfigurables(configurables?: Configurable[]): Configurable[] {
        return configurables || EMPTY_CONFIGURABLES;
    }

    private static createTransform(w: number, h: number): Transform {
        return new Transform(Vec2.ZERO, new Vec2(w, h), Rotation.ZERO);
    }

    private static createAppearance(appearance?: { [key: string]: any }): Immutable.Map<string, any> {
        return Immutable.Map<any>(appearance || EMPTY_APPEARANCE);
    }

    public bounds(diagram: Diagram): Transform {
        return this.transform;
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform): DiagramShape {
        if (!oldBounds || !newBounds || newBounds.eq(oldBounds)) {
            return this;
        }

        const newTransform = this.transform.transformByBounds(oldBounds, newBounds);

        return this.transformTo(newTransform);
    }

    public transformWith(transformer: (t: Transform) => Transform): DiagramShape {
        if (!transformer) {
            return this;
        }

        const newTransform = transformer(this.transform);

        return this.transformTo(newTransform);
    }

    public transformTo(transform: Transform): DiagramShape {
        if (!transform) {
            return this;
        }

        transform = transform.round();

        if (transform.eq(this.transform)) {
            return this;
        }

        return this.cloned<DiagramShape>((state: DiagramShape) => state.transform = transform);
    }

    protected afterClone(prev: DiagramShape) {
        if (this.constraint) {
            const size = this.constraint.updateSize(this, this.transform.size, prev);

            this.transform = this.transform.resizeTopLeft(size).round();
        }
    }

    public clone(): DiagramShape {
        return new DiagramShape(
            this.id,
            this.isLocked,
            this.appearance,
            this.transform,
            this.configurables,
            this.constraint,
            this.renderer);
    }
}