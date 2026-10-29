import type { Shape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";
import { getBrushLocalCenter } from "./brushGeometry";

export function getShapesCenterWorld(
    shape: Shape
): Vec2 {
    switch (shape.type) {
        case "rect": {
            const localCenter = {
                x: shape.origin.x + shape.width / 2,
                y: shape.origin.y + shape.height / 2,
            };

            return applyTransform(
                localCenter,
                shape.transform
            );
        }

        case "ellipse":
            return applyTransform(
                shape.center,
                shape.transform
            );

        case "line": {
            const localCenter = {
                x: (shape.start.x + shape.end.x) / 2,
                y: (shape.start.y + shape.end.y) / 2,
            };

            return applyTransform(
                localCenter,
                shape.transform
            );
        }

        case "image": {
            const localCenter = {
                x: shape.origin.x + shape.width / 2,
                y: shape.origin.y + shape.height / 2,
            };

            return applyTransform(
                localCenter,
                shape.transform
            );
        }

        case "brush": {
            const center = getBrushLocalCenter(shape);

            return applyTransform(
                center,
                shape.transform
            );
        }

        // below: forces us to add a proper case for each new shape instead of treating each new shape as an ellipse
        default: {
            const exhaustiveCheck: never = shape;
            return exhaustiveCheck;
        }
    }
}