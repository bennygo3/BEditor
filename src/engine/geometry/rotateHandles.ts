import type { Shape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";
import { getBrushLocalBounds } from "./brushGeometry";
// import { getShapeBoundsWorld } from "./bounds";

function getLocalRotateAnchor(shape: Shape): Vec2 {
    switch (shape.type) {
        case "rect":
            return {
                x: shape.origin.x + shape.width,
                y: shape.origin.y + shape.height / 2,
            };

        case "ellipse":
            return {
                x: shape.center.x + shape.radiusX,
                y: shape.center.y,
            };

        case "line":
            return { ...shape.end, };

        case "image":
            return {
                x: shape.origin.x + shape.width,
                y: shape.origin.y + shape.height / 2,
            }

        case "brush": {
            const bounds = getBrushLocalBounds(shape);

            return {
                x: bounds.max.x,
                y: (bounds.min.y + bounds.max.y) / 2,
            };
        }
    }
}

function getLocalRotateHandle(shape: Shape, offset = 24): Vec2 {
    switch (shape.type) {
        case "rect":
            return {
                x: shape.origin.x + shape.width + offset,
                y: shape.origin.y + shape.height / 2,
            };

        case "ellipse":
            return {
                x: shape.center.x + shape.radiusX + offset,
                y: shape.center.y,
            }

        case "line": {
            const dx = shape.end.x - shape.start.x;
            const dy = shape.end.y - shape.start.y;
            const length = Math.hypot(dx, dy) || 1;

            return {
                x: shape.end.x + (dx / length) * offset,
                y: shape.end.y + (dy / length) * offset,
            };
        }

        case "image":
            return {
                x: shape.origin.x + shape.width + offset,
                y: shape.origin.y + shape.height / 2,
            };

        case "brush": {
            const bounds = getBrushLocalBounds(shape);

            return {
                x: bounds.max.x + offset,
                y: (bounds.min.y + bounds.max.y) / 2,
            };
        }
    }
}

export function getRotateHandleAnchor(shape: Shape): Vec2 {
    return applyTransform(getLocalRotateAnchor(shape), shape.transform);
}

export function getRotateHandlePosition(shape: Shape, offset = 24): Vec2 {
    return applyTransform(getLocalRotateHandle(shape, offset), shape.transform);
}

export function hitTestRotateHandle(point: Vec2, shape: Shape, radius = 7): boolean {
    const handle = getRotateHandlePosition(shape);
    const dx = point.x - handle.x;
    const dy = point.y - handle.y;

    return dx * dx + dy * dy <= radius * radius;
}