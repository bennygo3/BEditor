import type { LineShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";

export type LineHandle = "start" | "end";

export function getLineHandlePositions(shape: LineShape): Record<LineHandle, Vec2> {
    return {
        start: applyTransform(shape.start, shape.transform),
        end: applyTransform(shape.end, shape.transform),
    };
}

export function hitTestLineHandle(
    point: Vec2,
    shape: LineShape,
    size = 8
) : LineHandle | null {
    const half = size / 2;
    const handles = getLineHandlePositions(shape);

    for (const key of ["start", "end"] as LineHandle[]) {
        const h = handles[key];

        if (point.x >= h.x - half && 
            point.x <= h.x + half &&
            point.y >= h.y - half &&
            point.y <= h.y + half
        ) {
            return key;
        }
    } 
    
    return null;
}