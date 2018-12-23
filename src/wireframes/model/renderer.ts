import { Vec2 } from '@app/core';

import { DiagramShape } from './diagram-shape';

export interface Renderer {
    identifier(): string;

    defaultAppearance(): { [key: string]: any };

    previewOffset(): Vec2;

    showInGallery(): boolean;

    createDefaultShape(id: string): DiagramShape;

    setContext(context: any): void;

    render(shape: DiagramShape, showDebugMarkers: boolean): any;
}