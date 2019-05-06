export function getClientCenter() {
    const editorView = document.getElementById('editor-view');
    const rect = editorView.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
}