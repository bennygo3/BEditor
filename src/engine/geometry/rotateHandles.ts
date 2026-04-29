import type { Shape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";
// import { getShapeBoundsWorld } from "./bounds";

function getLocalRotateAnchor(shape: Shape): Vec2 {
    if (shape.type === "rect") {
        return {
            x: shape.origin.x + shape.width,
            y: shape.origin.y + shape.height / 2,
        };
    }

    if (shape.type === "line") {
        return { ...shape.end };
    }

    return {
        x: shape.center.x + shape.radiusX,
        y: shape.center.y,
    };
}

function getLocalRotateHandle(shape: Shape, offset = 24): Vec2 {
    if (shape.type === "rect") {
        return {
            x: shape.origin.x + shape.width + offset,
            y: shape.origin.y + shape.height / 2,
        };
    }

    if (shape.type === "line") {
        const dx = shape.end.x - shape.start.x;
        const dy = shape.end.y - shape.start.y;
        const length = Math.hypot(dx, dy) || 1;

        return {
            x: shape.end.x + (dx / length) * offset,
            y: shape.end.y + (dy / length) * offset,
        };
    }

    return {
        x: shape.center.x + shape.radiusX + offset,
        y: shape.center.y,
    }
}

export function getRotateHandleAnchor(shape: Shape): Vec2 {
    return applyTransform(getLocalRotateAnchor(shape), shape.transform);
    // const bounds = getShapeBoundsWorld(shape);

    // return {
    //     x: bounds.max.x,
    //     y: (bounds.min.y + bounds.max.y) / 2,
    // };
}

export function getRotateHandlePosition(shape: Shape, offset = 24): Vec2 {
    return applyTransform(getLocalRotateHandle(shape, offset), shape.transform);
    // const anchor = getRotateHandleAnchor(shape);

    // return {
    //     x: anchor.x + offset,
    //     y: anchor.y,
    // };
}

export function hitTestRotateHandle(point: Vec2, shape: Shape, radius = 7): boolean {
    const handle = getRotateHandlePosition(shape);
    const dx = point.x - handle.x;
    const dy = point.y - handle.y;

    return dx * dx + dy * dy <= radius * radius;
}