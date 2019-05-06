import { ColorConfigurable, Configurable, DiagramShape, SelectionConfigurable } from '@app/wireframes/model';

import { AbstractContext, AbstractControl, TextSizeConstraint } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

import { COLOR_KEY, TextBehaviour, TEXT_PADDING } from '@app/constants';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Heading';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_WEIGHT] = 'bold';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = 36;
DEFAULT_APPEARANCE[COLOR_KEY] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_BEHAVIOUR] = TextBehaviour.Grow;


const CONFIGURABLE: Configurable[] = [
    new SelectionConfigurable(DiagramShape.APPEARANCE_FONT_SIZE, 'Font size',
    [
        '16', '24', '36', '48'
    ], 'px'),
    new ColorConfigurable(COLOR_KEY, 'Color')
];

const CONSTRAINT = new TextSizeConstraint(10);

export class Heading extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public icon() {
        return 'fa-font';
    }

    public identifier(): string {
        return 'Heading';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 90, 30, CONFIGURABLE, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createMultilineText(ctx.shape, ctx.bounds.deflate(TEXT_PADDING, TEXT_PADDING));

        ctx.renderer.setForegroundColor(textItem, ctx.shape.appearance.get(COLOR_KEY));

        ctx.add(textItem);
    }
}