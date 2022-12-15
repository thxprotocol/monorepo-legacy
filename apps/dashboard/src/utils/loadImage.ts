export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        function cleanup() {
            image.onload = null;
            image.onerror = null;
        }

        image.onload = () => {
            cleanup();
            resolve(image);
        };
        image.onerror = (err) => {
            cleanup();
            reject(err);
        };

        image.src = src;
    });
}
