import type { Vec2 } from "../engine";

export type CanvasSize = {
    width: number;
    height: number;
};

export function setupHighDpiCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
): CanvasSize {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = rect.width;
    const height = rect.height;

    // preserve the logical/displayed size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // increase only the backing-buffer resolution
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    return {
        width,
        height,
    };
}

export function getCanvasPointFromClient(
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
): Vec2 {
    const rect = canvas.getBoundingClientRect();

    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
}

