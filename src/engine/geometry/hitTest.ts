import type { Vec2 } from "../math/vec2";
import type { Shape } from "./shape";
import { getShapeBoundsWorld } from "./bounds";

export function isPointInBounds(point: Vec2, shape: Shape): boolean {
    const bounds = getShapeBoundsWorld(shape);

    return (
        point.x >= bounds.min.x &&
        point.x <= bounds.max.x &&
        point.y >= bounds.min.y &&
        point.y <= bounds.max.y
    )
}