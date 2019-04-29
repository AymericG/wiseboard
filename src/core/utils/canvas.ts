export function moveCanvas(x: number, y: number) {
    const element: any = document.getElementById('editor');
    element.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    element.setAttribute('data-x', x);
    element.setAttribute('data-y', y);
} 

export function getCanvasOffset() {
    const editor = document.getElementById('editor');
    const x = parseInt(editor.getAttribute('data-x') || '0', 10);
    const y = parseInt(editor.getAttribute('data-y') || '0', 10);
    return { x, y };
}

