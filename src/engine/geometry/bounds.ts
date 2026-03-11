import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";
import type { Shape } from "./shape";

export type Bounds = {
    min: Vec2;
    max: Vec2;
}

function boundsFromPoints(points: Vec2[]): Bounds {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

export function getShapeBoundsWorld(shape: Shape): Bounds {
    if (shape.type === "rect") {
        const { origin, width, height, transform } = shape;

        const cornersLocal: Vec2[] = [
            { x: origin.x, y: origin.y },
            { x: origin.x + width, y: origin.y },
            { x: origin.x + width, y: origin.y + height },
            { x: origin.x, y: origin.y + height },
        ];

        const cornersWorld = cornersLocal.map((p) => applyTransform(p, transform));
        return boundsFromPoints(cornersWorld);
    }

    // ellipse: approximate bounds using 4 cardinal points (works w/ rotation as well)
    const { center, radiusX, radiusY, transform } = shape;

    const ptsLocal: Vec2[] = [
        { x: center.x - radiusX, y: center.y },
        { x: center.x + radiusX, y: center.y },
        { x: center.x, y: center.y - radiusY },
        { x: center.x, y: center.y + radiusY },
    ];

    const ptsWorld = ptsLocal.map((p) => applyTransform(p, transform));
    return boundsFromPoints(ptsWorld);
}

