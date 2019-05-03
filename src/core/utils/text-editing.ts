export function isTextEditor(target: any) {
    if (!!target.getAttribute('contenteditable') || !!target.parentNode.getAttribute('contenteditable')) {
        return true;
    }
    return false;
}