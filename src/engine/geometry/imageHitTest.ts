import type { ImageShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyInverseTransform } from "../math/transform";

export function hitTestImage(
    point: Vec2,
    shape: ImageShape
) : boolean {
    const localPoint = applyInverseTransform(
        point,
        shape.transform
    );

    return (
        localPoint.x >= shape.origin.x &&
        localPoint.x <= shape.origin.x + shape.width &&
        localPoint.y >= shape.origin.y &&
        localPoint.y <= shape.origin.y + shape.height
    );
}