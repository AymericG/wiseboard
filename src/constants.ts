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

export const COLOR_KEY = 'COLOR';

export namespace Keys {
    export const ENTER = 13;
    export const ESC = 27;
    export const SPACE = 32;
    export const LEFT = 37;
    export const UP = 38;
    export const RIGHT = 39;
    export const DOWN = 40;
}

export const TEXT_PADDING = 10;