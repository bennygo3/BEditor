import type { BrushShape } from "./shape";
import type { Vec2 } from "../math/vec2";

export type BrushLocalBounds = {
    min: Vec2;
    max: Vec2;
};

export function getBrushLocalBounds(shape: BrushShape): BrushLocalBounds {
    if (shape.points.length === 0) {
        return {
            min: { x: 0, y: 0 },
            max: { x: 0, y: 0 },
        };
    }

    let minX = shape.points[0].x;
    let minY = shape.points[0].y;
    let maxX = shape.points[0].x;
    let maxY = shape.points[0].y;

    for (const point of shape.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }

    return {
        min: { x: minX, y: minY },
        max: { x: maxX, y: maxY },
    };
}

export function getBrushLocalCenter(shape: BrushShape): Vec2 {
    const bounds = getBrushLocalBounds(shape);

    return {
        x: (bounds.min.x + bounds.max.x) / 2,
        y: (bounds.min.y + bounds.max.y) / 2,
    };
}

     
