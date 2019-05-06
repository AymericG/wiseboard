import { Color, Rect2, Vec2 } from '@app/core';

import {
    DiagramShape,
    Renderer,
    Constraint
} from '@app/wireframes/model';

import { AbstractRenderer, SVGRenderer } from './svg-renderer';
import { ResizeMode } from '@app/constants';

const RENDER_BACKGROUND = 1;

export class AbstractContext {
    public readonly items: any[] = [];

    constructor(
        public readonly renderer: AbstractRenderer,
        public readonly shape: DiagramShape,
        public readonly bounds: Rect2
    ) {
    }

    public add(item: any) {
        this.items.push(item);
    }
}

const RENDERER = new SVGRenderer();

export abstract class AbstractControl implements Renderer {
    public abstract createDefaultShape(shapeId: string): DiagramShape;

    public abstract identifier(): string;

    public abstract defaultAppearance(): { [key: string]: any };

    public previewOffset() {
        return Vec2.ZERO;
    }

    public icon() {
        return 'fa-question';
    }

    public showInGallery() {
        return true;
    }

    public setContext(context: any) {
        RENDERER.captureContext(context);

        return this;
    }

    public render(shape: DiagramShape, options?: { debug?: boolean, noOpacity?: boolean, noTransform?: boolean }): any {
        const ctx = new AbstractContext(RENDERER, shape, new Rect2(0, 0, shape.transform.size.x, shape.transform.size.y));

        options = options || {};

        if (RENDER_BACKGROUND) {
            const backgroundItem = ctx.renderer.createRectangle(0);

            ctx.renderer.setBackgroundColor(backgroundItem, Color.WHITE);
            ctx.renderer.setOpacity(backgroundItem, 0.001);
            ctx.renderer.setTransform(backgroundItem, { rect: ctx.bounds });

            ctx.add(backgroundItem);
        }

        this.renderInternal(ctx);

        if (options.debug) {
            const boxItem = ctx.renderer.createRectangle(1);

            ctx.renderer.setStrokeColor(boxItem, 0xff0000);
            ctx.renderer.setTransform(boxItem, { rect: ctx.bounds.inflate(1) });

            ctx.add(boxItem);
        }

        const rootItem = ctx.renderer.createGroup(ctx.items);

        if (!options.noTransform) {
            ctx.renderer.setTransform(rootItem, shape);
        }

        if (!options.noOpacity) {
            ctx.renderer.setOpacity(rootItem, shape);
        }

        return rootItem;
    }

    protected abstract renderInternal(ctx: AbstractContext): void;
}

export class TextSizeConstraint implements Constraint {
    constructor(
        private readonly padding = 0,
        private readonly minWidth = 0,
        private readonly minHeight = 0,
        public readonly resizeMode = ResizeMode.LockRatio
    ) { }

    public updateSize(shape: DiagramShape, size: Vec2, prev: DiagramShape): Vec2 {
        const fontSize = shape.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE) || 10;
        const fontFamily = shape.appearance.get(DiagramShape.APPEARANCE_FONT_FAMILY) || 'inherit';
        const fontWeight = shape.appearance.get(DiagramShape.APPEARANCE_FONT_WEIGHT) || 'normal';
        let finalWidth = size.x;
        let finalHeight = size.y;

        const text = shape.appearance.get(DiagramShape.APPEARANCE_TEXT);

        let prevText = '';
        let prevFontWeight = 'normal';
        let prevFontSize = 0;
        let prevFontFamily = '';

        if (prev) {
            prevText = prev.appearance.get(DiagramShape.APPEARANCE_TEXT);
            prevFontSize = prev.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE) || 10;
            prevFontFamily = prev.appearance.get(DiagramShape.APPEARANCE_FONT_FAMILY) || 'inherit';
            prevFontWeight = prev.appearance.get(DiagramShape.APPEARANCE_FONT_WEIGHT) || 'normal';
        }

        if (prevFontWeight !== fontWeight || prevText !== text || prevFontSize !== fontSize || prevFontFamily !== fontFamily) {
            let textSize = RENDERER.getTextSize(text, fontSize, fontFamily, fontWeight);
        
            if (textSize.width) {
                textSize.width += 2 * this.padding;
                finalWidth = Math.max(this.minWidth, textSize.width);
            }

            if (textSize.height) {
                textSize.height += 2 * this.padding;
                finalHeight = Math.max(this.minHeight, textSize.height);
            }
        }
        return new Vec2(finalWidth, finalHeight).roundToMultipleOfTwo();
    }

    public calculateSizeX(): boolean {
        return this.resizeMode === ResizeMode.Fixed;
    }

    public calculateSizeY(): boolean {
        return this.resizeMode === ResizeMode.Fixed;
    }
}