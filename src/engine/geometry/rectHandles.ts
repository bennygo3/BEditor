import type { RectShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { getShapeBoundsWorld } from "./bounds";

export type RectHandle = "nw" | "ne" | "se" | "sw";

export function getRectHandlePositions(shape: RectShape): Record<RectHandle, Vec2> {
    const bounds = getShapeBoundsWorld(shape);

    return {
        nw: { x: bounds.min.x, y: bounds.min.y },
        ne: { x: bounds.max.x, y: bounds.min.y },
        se: { x: bounds.max.x, y: bounds.max.y },
        sw: { x: bounds.min.x, y: bounds.max.y },
    };
}

export function hitTestRectHandle(
    point: Vec2,
    shape: RectShape,
    size = 8
): RectHandle | null {
    const half = size / 2;
    const handles = getRectHandlePositions(shape);

    for (const handle of ["nw", "ne", "se", "sw"] as RectHandle[]) {
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
    