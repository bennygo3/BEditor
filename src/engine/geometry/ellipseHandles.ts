import type { EllipseShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { getShapeBoundsWorld } from "./bounds";

export type EllipseHandle = "nw" | "ne" | "se" | "sw";

export function getEllipseHandlePositions(shape: EllipseShape): Record<EllipseHandle, Vec2> {
    const bounds = getShapeBoundsWorld(shape);

    return {
        nw: { x: bounds.min.x, y: bounds.min.y },
        ne: { x: bounds.max.x, y: bounds.min.y },
        se: { x: bounds.max.x, y: bounds.max.y },
        sw: { x: bounds.min.x, y: bounds.max.y },
    };
}

export function hitTestEllipseHandle(
    point: Vec2,
    shape: EllipseShape,
    size = 8
): EllipseHandle | null {
    const half = size / 2;
    const handles = getEllipseHandlePositions(shape);

    for (const handle of ["nw", "ne", "se", "sw"] as EllipseHandle[]) {
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