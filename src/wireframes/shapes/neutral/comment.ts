import { ColorConfigurable, Configurable, DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

import { commentHeight, commentWidth } from '@app/constants';

const COLOR_KEY = 'COLOR';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = '';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = 1;
DEFAULT_APPEARANCE[COLOR_KEY] = CommonTheme.YELLOW;

const CONFIGURABLE: Configurable[] = [
    new ColorConfigurable(COLOR_KEY, 'Color')
];

export class Comment extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Comment';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), commentWidth, commentHeight, CONFIGURABLE, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const corner = Math.min(14.5, ctx.bounds.width, ctx.bounds.height) - .5;

        this.createBorder(ctx, corner);
        this.createText(ctx);
    }

    private createBorder(ctx: AbstractContext, c: number) {
        const l = ctx.bounds.left;
        const r = ctx.bounds.right;
        const t = ctx.bounds.top;
        const b = ctx.bounds.bottom;

        const borderItem = ctx.renderer.createPath(ctx.shape, `M${l + c},${t} L${r},${t} L${r},${b} L${l},${b} L${l},${t + c} L${l + c},${t} L${l + c},${t + c} L${l},${t + c} z`, ctx.bounds);
        ctx.renderer.setBackgroundColor(borderItem, ctx.shape.appearance.get(COLOR_KEY));
        ctx.renderer.setStrokeColor(borderItem, 0);
        ctx.renderer.setStrokeStyle(borderItem, 'round', 'round');
        ctx.renderer.setShadow(borderItem);

        ctx.add(borderItem);
    }

    private createText(ctx: AbstractContext) {
        // const textItem = ctx.renderer.createMultilineText(ctx.shape, ctx.bounds.deflate(10, 20));
        const textItem = ctx.renderer.createFittedText(ctx.shape, ctx.bounds.deflate(10, 20));
        ctx.add(textItem);
    }
}