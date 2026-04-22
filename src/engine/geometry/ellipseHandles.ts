import type { EllipseShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";
// import { getShapeBoundsWorld } from "./bounds";

export type EllipseHandle = "e" | "w" | "n" | "s" | "ne" | "nw" | "se" | "sw";

export function getEllipseHandlePositions(shape: EllipseShape): Record<EllipseHandle, Vec2> {
    const { center, radiusX, radiusY, transform } = shape;

    const handlesLocal = {
        n: { x: center.x ,           y: center.y - radiusY },
        e: { x: center.x + radiusX,  y: center.y },
        s: { x: center.x,            y: center.y + radiusY },
        w: { x: center.x - radiusX,  y: center.y },

        ne: { x: center.x + radiusX, y: center.y - radiusY },
        nw: { x: center.x - radiusX, y: center.y - radiusY },
        se: { x: center.x + radiusX, y: center.y + radiusY },
        sw: { x: center.x - radiusX, y: center.y + radiusY },
    };
    // const eLocal = { x: shape.center.x + shape.radiusX, y: shape.center.y };
    // const wLocal = { x: shape.center.x - shape.radiusX, y: shape.center.y };
    // const nLocal = { x: shape.center.x, y: shape.center.y - shape.radiusY };
    // const sLocal = { x: shape.center.x, y: shape.center.y + shape.radiusY };

    return {
        n: applyTransform(handlesLocal.n, transform),
        e: applyTransform(handlesLocal.e, transform),
        s: applyTransform(handlesLocal.s, transform),
        w: applyTransform(handlesLocal.w, transform),
        ne: applyTransform(handlesLocal.ne, transform),
        nw: applyTransform(handlesLocal.nw, transform),
        se: applyTransform(handlesLocal.se, transform),
        sw: applyTransform(handlesLocal.sw, transform),
        // e: applyTransform(eLocal, shape.transform),
        // w: applyTransform(wLocal, shape.transform),
        // n: applyTransform(nLocal, shape.transform),
        // s: applyTransform(sLocal, shape.transform),
    };
}

export function hitTestEllipseHandle(
    point: Vec2,
    shape: EllipseShape,
    size = 8
): EllipseHandle | null {
    const half = size / 2;
    const handles = getEllipseHandlePositions(shape);

    for (const handle of ["n", "e", "s", "w", "ne", "nw", "se", "sw"] as EllipseHandle[]) {
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