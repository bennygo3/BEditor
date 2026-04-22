import type { EllipseShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";
// import { getShapeBoundsWorld } from "./bounds";

export type EllipseHandle = "e" | "w" | "n" | "s";

export function getEllipseHandlePositions(shape: EllipseShape): Record<EllipseHandle, Vec2> {
    const eLocal = { x: shape.center.x + shape.radiusX, y: shape.center.y };
    const wLocal = { x: shape.center.x - shape.radiusX, y: shape.center.y };
    const nLocal = { x: shape.center.x, y: shape.center.y - shape.radiusY };
    const sLocal = { x: shape.center.x, y: shape.center.y + shape.radiusY };

    return {
        e: applyTransform(eLocal, shape.transform),
        w: applyTransform(wLocal, shape.transform),
        n: applyTransform(nLocal, shape.transform),
        s: applyTransform(sLocal, shape.transform),
    };
}

export function hitTestEllipseHandle(
    point: Vec2,
    shape: EllipseShape,
    size = 8
): EllipseHandle | null {
    const half = size / 2;
    const handles = getEllipseHandlePositions(shape);

    for (const handle of ["e", "w", "n", "s"] as EllipseHandle[]) {
        const h = handles[handle];

        if (
            point.x >= h.x - half &&
            point.x <= h.x + half &&
            point.y >= h.y - half &&
            point.y <= h.y + half
        ) {
            return handle;
        }
    }
    
    return null;
}