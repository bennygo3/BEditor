import type { Shape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { getShapeBoundsWorld } from "./bounds";

export function getRotateHandleAnchor(shape: Shape): Vec2 {
    const bounds = getShapeBoundsWorld(shape);

    return {
        x: bounds.max.x,
        y: (bounds.min.y + bounds.max.y) / 2,
    };
}

export function getRotateHandlePosition(shape: Shape, offset = 24): Vec2 {
    const anchor = getRotateHandleAnchor(shape);

    return {
        x: anchor.x + offset,
        y: anchor.y,
    };
}

export function hitTestRotateHandle(point: Vec2, shape: Shape, radius = 7): boolean {
    const handle = getRotateHandlePosition(shape);
    const dx = point.x - handle.x;
    const dy = point.y - handle.y;

    return dx * dx + dy * dy <= radius * radius;
}