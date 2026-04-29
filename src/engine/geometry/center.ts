import type { Shape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";

export function getShapesCenterWorld(shape: Shape): Vec2 {
    if (shape.type === "rect") {
        const localCenter = {
            x: shape.origin.x + shape.width / 2,
            y: shape.origin.y + shape.height /2,
        };

        return applyTransform(localCenter, shape.transform);
    }

    if (shape.type === "line") {
        const localCenter = {
            x: (shape.start.x + shape.end.x) / 2,
            y: (shape.start.y + shape.end.y) / 2,
        };

        return applyTransform(localCenter, shape.transform)
    }

    // ellipse:
    return applyTransform(shape.center, shape.transform);
}