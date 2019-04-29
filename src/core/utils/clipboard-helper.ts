const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

export function pasteImage(file: File, addImage: any, diagramId: string, x: number, y: number) {
    if (file.size > FILE_SIZE_LIMIT) {
        // file is too big
        return;
    }

    const reader = new FileReader();

    reader.onload = (loadedFile: any) => {
        const imageSource: string = loadedFile.target.result;
        const imageElement = document.createElement('img');

        imageElement.onload = () => {
            addImage(diagramId, imageSource, x, y, imageElement.width, imageElement.height);
        };
        imageElement.src = imageSource;
    };
    reader.readAsDataURL(file);
}