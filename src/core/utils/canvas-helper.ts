export function getClientCenter() {
    const editorView = document.getElementById('editor-view');
    const rect = editorView.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
}

export function calculateCanvasOffset(zoom: number, worldX: number, worldY: number, clientX?: number, clientY?: number, getState?: any) {
    if (clientX === undefined) {
        const clientCenter = getClientCenter();
        clientX = clientCenter.x;
        clientY = clientCenter.y;
    }

    if (worldX === undefined) {
        const state = getState();
        const z = state.ui.zoom;
        const x = state.ui.x;
        const y = state.ui.y;
        
        worldX = (clientX - x) / z;
        worldY = (clientY - y) / z;
    }

    return { x: clientX - worldX * zoom, y: clientY - worldY * zoom };
}