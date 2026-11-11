import type { Vec2 } from "../../math/vec2";
import {
    evalCubicBezier,
    evalCubicDerivative,
    evalCubicSecondDerivative,
    type CubicBezier,
} from "./cubicBezier";

function dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
}

function squaredDistance(
    a: Vec2,
    b: Vec2
): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return dx * dx + dy * dy;
}

// perform one Newton-Raphson correction for a single mouse point's parameter
export function refineParameter(
    point: Vec2,
    curve: CubicBezier,
    t: number
): number {
    const curvePoint = evalCubicBezier(curve, t);

    const firstDerivative = evalCubicDerivative(curve, t);

    const secondDerivative = evalCubicSecondDerivative(curve, t);

    const difference: Vec2 = {
        x: curvePoint.x - point.x,
        y: curvePoint.y - point.y,
    };

    const numerator = dot(difference, firstDerivative);

    const denominator = dot(firstDerivative, firstDerivative) + dot(difference, secondDerivative);

    // avoid unstable division
    if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-12) return t;

    const nextT = t - numerator / denominator;

    // the parameter must stay inside the cubic segment
    if (!Number.isFinite(nextT) || nextT <= 0 || nextT >= 1) return t;

    // only accept a correction when it reduces squared distance
    const oldError = squaredDistance(point, curvePoint);

    const newError = squaredDistance(point, evalCubicBezier(curve, nextT));

    return newError < oldError ? nextT : t;
}

// refine all interior sample parameters. the first and last remain exactly 0 and 1
export function refineParameters(
    points: Vec2[],
    parameters: number[],
    curve: CubicBezier
): number[] {
    if (points.length !== parameters.length) {
        throw new Error("each point needs a parameter");
    }

    const refined = [...parameters];

    for (let i = 1; i < points.length - 1; i++) {
        const candidate = refineParameter(
            points[i],
            curve,
            parameters[i]
        );

        // preserve increasing parameter order
        const lower = refined[i - 1] + 1e-9;
        const upper = parameters[i + 1] - 1e-9;

        if (candidate > lower && candidate < upper) {
            refined[i] = candidate;
        }
    }

    return refined;
}