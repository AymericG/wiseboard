export enum InteractionMode {
    Selection,
    Drag
}

export const gridSize = 20;
export const canvasSize = 5000;

export const minZoom = 0.25;
export const maxZoom = 2;

export const commentWidth = 170;
export const commentHeight = 150;

export const CLONE_OFFSET = 50;


export namespace ShapeType {
    export const Comment = 'Comment';
    export const Heading = 'Heading';
}
