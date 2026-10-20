import { downloadBlob } from "./download";

export type RasterFormat =
    | "png"
    | "jpeg"
    | "webp";

export function exportCanvasImage(
    canvas: HTMLCanvasElement,
    format: RasterFormat,
    filename = "bEditor-export"
): void {
    const mimeTypes = {
        png: "image/png",
        jpeg: "image/jpeg",
        webp: "image/webp",
    } as const;

    const extensions = {
        png: "png",
        jpeg: "jpg",
        webp: "webp",
    } as const;

    const mimeType = mimeTypes[format];
    const extension = extensions[format];

    canvas.toBlob(
        (blob) => {
            if (!blob) {
                console.error("Could not create image export.");
                return;
            }

            downloadBlob(
                blob,
                `${filename}.${extension}`
            );
        },
        mimeType,
        0.92
    );
}