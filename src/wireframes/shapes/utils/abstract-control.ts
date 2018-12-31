import { Rect2, Vec2 } from '@app/core';

import {
    Constraint,
    DiagramShape,
    Renderer
} from '@app/wireframes/model';

import { AbstractRenderer, SVGRenderer } from './svg-renderer';

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

            ctx.renderer.setBackgroundColor(backgroundItem, 'transparent');
            ctx.renderer.setOpacity(backgroundItem, 0);
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
    constructor(private readonly padding: number) { }

    public updateSize(shape: DiagramShape, size: Vec2, prev: DiagramShape): Vec2 {
        const fontSize = shape.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE);

        let finalWidth = size.x;

        const text = shape.appearance.get(DiagramShape.APPEARANCE_TEXT);

        if (prev) {
            const prevText = prev.appearance.get(DiagramShape.APPEARANCE_TEXT);

            if (prevText !== text) {
                let textWidth = RENDERER.getTextWidth(text, fontSize, 'sans serif');

                if (textWidth) {
                    textWidth += 2 * this.padding + text.length * 0.1 * fontSize;

                    if (finalWidth < textWidth) {
                        finalWidth = textWidth;
                    }
                }
            }
        }

        return new Vec2(finalWidth, fontSize * 1.2 + this.padding * 2).roundToMultipleOfTwo();
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}