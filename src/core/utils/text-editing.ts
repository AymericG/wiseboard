export function isTextEditor(target: any) {
    if (!!target.getAttribute('contenteditable') || !!target.classList.contains('editable')) {
        return true;
    }
    return false;
}