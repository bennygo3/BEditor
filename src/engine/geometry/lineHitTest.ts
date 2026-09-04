import { applyTransform } from "../math/transform";
import { Vec2 } from "../math/vec2";
import { LineShape } from "./shape";

export function lineHitTest(
    point: Vec2,
    shape: LineShape,
    tolerance = 8
) : boolean {
    const start = applyTransform(shape.start, shape.transform);
    const end = applyTransform(shape.end, shape.transform);

    const lineX = end.x - start.x;
    const lineY = end.y - start.y;

    const pointX = point.x - start.x;
    const pointY = point.y - start.y;

    const lineLengthSquared = 
        lineX * lineX +
        lineY * lineY
    ;

    // protection against a line whose start and end are identical
    if (lineLengthSquared === 0) {
        const dx = point.x - start.x;
        const dy = point.y - start.y;

        return Math.hypot(dx, dy) <= tolerance;
    }

    let t = (pointX * lineX + pointY * lineY) / lineLengthSquared;

    // keep the closest point on the actual segment, rather than somewhere beyond either enpoint
    t = Math.max(0, Math.min(1, t));

    const closestPoint = {
        x: start.x + t * lineX,
        y: start.y + t * lineY,
    };

    const distance = Math.hypot(
        point.x - closestPoint.x,
        point.y - closestPoint.y
    );

    return distance <= tolerance;
}