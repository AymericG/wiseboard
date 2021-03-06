import { MathHelper, Vec2 } from '@app/core';

import { DiagramShape } from './diagram-shape';
import { ResizeMode } from '@app/constants';

export interface Constraint {
    updateSize(shape: DiagramShape, size: Vec2, prev?: DiagramShape): Vec2;

    resizeMode?: ResizeMode;
    calculateSizeX(): boolean;

    calculateSizeY(): boolean;
}

export class SizeConstraint implements Constraint {
    constructor(
        private readonly width: number | undefined,
        private readonly height: number | undefined
    ) {
        Object.freeze(this);
    }

    public updateSize(shape: DiagramShape, size: Vec2): Vec2 {
        let w = size.x;
        let h = size.y;

        if (this.width) {
            w = this.width;
        }

        if (this.height) {
            h = this.height;
        }

        return new Vec2(w, h);
    }

    public calculateSizeX(): boolean {
        return !!this.width;
    }

    public calculateSizeY(): boolean {
        return !!this.height;
    }
}

export class MinSizeConstraint implements Constraint {
    constructor() {
        Object.freeze(this);
    }

    public updateSize(shape: DiagramShape, size: Vec2): Vec2 {
        const minSize = Math.min(size.x, size.y);

        return new Vec2(minSize, minSize);
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return false;
    }
}

export class TextHeightConstraint implements Constraint {
    constructor(
        private readonly padding: number
    ) {
        Object.freeze(this);
    }

    public updateSize(shape: DiagramShape, size: Vec2): Vec2 {
        const fontSize = shape.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE);

        return new Vec2(size.x, MathHelper.roundToMultipleOfTwo(fontSize * 1.2 + this.padding * 2));
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}