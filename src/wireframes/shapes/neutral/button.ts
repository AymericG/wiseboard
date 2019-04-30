import { ColorConfigurable, Configurable, DiagramShape, SelectionConfigurable } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const STYLE_KEY = 'STYLE';
const STYLE_FILL = 'Fill';
const STYLE_OUTLINE = 'Outline';

const COLOR_KEY = 'COLOR';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Button';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[STYLE_KEY] = STYLE_FILL;
DEFAULT_APPEARANCE[COLOR_KEY] = CommonTheme.PURPLE;

const CONFIGURABLE: Configurable[] = [
    new SelectionConfigurable(STYLE_KEY, 'Style',
        [
            STYLE_FILL,
            STYLE_OUTLINE
        ]),
    new ColorConfigurable(COLOR_KEY, 'Color')
];

export class Button extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public icon() {
        return 'fa-icon-picture';
    }

    public identifier(): string {
        return 'Button';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 100, 30, CONFIGURABLE, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBorder(ctx);
        this.createText(ctx);
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.bounds);

        const style = ctx.shape.appearance.get(STYLE_KEY);
        if (style === STYLE_FILL) {
            ctx.renderer.setBackgroundColor(borderItem, ctx.shape.appearance.get(COLOR_KEY));
            ctx.renderer.setStrokeColor(borderItem, '#ccc');
        } else if (style === STYLE_OUTLINE) {
            ctx.renderer.setBackgroundColor(borderItem, 'transparent');
            ctx.renderer.setStrokeColor(borderItem, ctx.shape.appearance.get(COLOR_KEY));
        }

        ctx.add(borderItem);
    }

    private createText(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, ctx.bounds.deflate(14, 4));

        const style = ctx.shape.appearance.get(STYLE_KEY);
        if (style === STYLE_FILL) {
            ctx.renderer.setForegroundColor(textItem, '#fff');
        } else if (style === STYLE_OUTLINE) {
            ctx.renderer.setForegroundColor(textItem, ctx.shape.appearance.get(COLOR_KEY));
        }


        ctx.add(textItem);
    }
}