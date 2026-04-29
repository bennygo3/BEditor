import type { Shape } from "./shape";
import type { Vec2 } from "../math/vec2";

function getLocalCenter(shape: Shape): Vec2 {
    if (shape.type === "rect") {
        return {
            x: shape.origin.x + shape.width / 2,
            y: shape.origin.y + shape.height / 2,
        };
    }

    if (shape.type === "line") {
        return {
            x: (shape.start.x + shape.end.x) / 2,
            y: (shape.start.y + shape.end.y) / 2,
        };
    }

    return { ...shape.center };
}

export function setShapeRotationCenter(
    shape: Shape,
    newRotation: number,
    fixedWorldCenter: Vec2
): void {
    const localCenter = getLocalCenter(shape);
    const scale = shape.transform.scale;

    const scaledX = localCenter.x * scale.x;
    const scaledY = localCenter.y * scale.y;

    const cos = Math.cos(newRotation);
    const sin = Math.sin(newRotation);

    const rotatedCenterX = scaledX * cos - scaledY * sin;
    const rotatedCenterY = scaledX * sin + scaledY * cos;

    shape.transform.rotation = newRotation;
    shape.transform.position.x = fixedWorldCenter.x - rotatedCenterX;
    shape.transform.position.y = fixedWorldCenter.y - rotatedCenterY;
}