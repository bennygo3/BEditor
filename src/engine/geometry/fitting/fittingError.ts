import type { Vec2 } from "../../math/vec2";
import { evalCubicBezier, type CubicBezier } from "./cubicBezier";

export type FittingError = {
    maxSquaredError: number;
    splitIndex: number;
};

export function calculateFittingError(
    points: Vec2[],
    parameters: number[],
    curve: CubicBezier
): FittingError {
    if (points.length !== parameters.length) {
        throw new Error("Each point must have a corresponding parameter.");
    }

    let maxSquaredError = 0;
    let splitIndex = -1;

    // skip the first and last points because the cubic uses those as fixed endpoints
    for (let i = 1; i < points.length - 1; i++) {
        const point = points[i];
        const t = parameters[i];

        const curvePoint = evalCubicBezier(curve, t);

        const dx = point.x - curvePoint.x;
        const dy = point.y - curvePoint.y;

        const squaredError = dx * dx + dy * dy;

        if (squaredError > maxSquaredError) {
            maxSquaredError = squaredError;
            splitIndex = i;
        }
    }

    return {
        maxSquaredError,
        splitIndex,
    };
}