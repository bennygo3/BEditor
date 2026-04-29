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

    if (shape.type === "line") {
        const pointsWorld = [
            applyTransform(shape.start, shape.transform),
            applyTransform(shape.end, shape.transform),
        ];

        return boundsFromPoints(pointsWorld);
    }

    // ellipse: approximate bounds using 4 cardinal points (works w/ rotation as well)
    const { center, radiusX, radiusY, transform } = shape;

    const pointsLocal: Vec2[] = [];
    const samples = 64;

    for (let i = 0; i < samples; i++) {
        const t = (i / samples) * Math.PI * 2;

        pointsLocal.push({
            x: center.x + Math.cos(t) * radiusX,
            y: center.y + Math.sin(t) * radiusY,
        });
    }

    const pointsWorld = pointsLocal.map((p) => applyTransform(p, transform));
    return boundsFromPoints(pointsWorld);
}

