import type { ImageShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { applyTransform } from "../math/transform";

export type ImageHandle =
    | "nw"
    | "ne"
    | "sw"
    | "se";

export function getImageHandlePositions(
    shape: ImageShape 
): Record<ImageHandle, Vec2> {
    const left = shape.origin.x;
    const top = shape.origin.y;
    const right = shape.origin.x + shape.width;
    const bottom = shape.origin.y + shape.height;

    return {
        nw: applyTransform(
            { x: left, y: top },
            shape.transform
        ),

        ne: applyTransform(
            { x: right, y: top },
            shape.transform
        ),

        sw: applyTransform(
            { x: left, y: bottom },
            shape.transform
        ),

        se: applyTransform(
            { x: right, y: bottom },
            shape.transform
        ),
    };
}

export function hitTestImageHandle(
    point: Vec2,
    shape: ImageShape,
    size = 10
): ImageHandle | null {
    const half = size / 2;
    const handles = getImageHandlePositions(shape);

    for (
        const key of ["nw", "ne", "sw", "se"] as ImageHandle[]
    ) {
        const handle = handles[key];

        if (
            point.x >= handle.x - half &&
            point.x <= handle.x + half &&
            point.y >= handle.y - half &&
            point.y <= handle.y + half
        ) {
            return key;
        }
    }

    return null;
}