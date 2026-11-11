import type { Vec2 } from "../../math/vec2";

export type CubicBezier = {
    p0: Vec2;   // starting anchor
    p1: Vec2;   // first control point
    p2: Vec2;   // second control point
    p3: Vec2;   // ending anchor
};

export function evalCubicBezier(
    curve: CubicBezier, 
    t: number
): Vec2 {
    const u = 1 - t;

    // Bernstein basis functions
    const b0 = u * u * u;
    const b1 = 3 * u * u * t;
    const b2 = 3 * u * t * t;
    const b3 = t * t * t;

    const x = 
        b0 * curve.p0.x +
        b1 * curve.p1.x +
        b2 * curve.p2.x +
        b3 * curve.p3.x;

    const y =
        b0 * curve.p0.y + 
        b1 * curve.p1.y + 
        b2 * curve.p2.y + 
        b3 * curve.p3.y;

    return { x, y };
}

export function evalCubicDerivative(
    curve: CubicBezier,
    t: number
): Vec2 {
    const u = 1 - t;

    return {
        x: 
            3 * u * u * (curve.p1.x - curve.p0.x) +
            6 * u * t * (curve.p2.x - curve.p1.x) +
            3 * t * t * (curve.p3.x - curve.p2.x),

        y: 
            3 * u * u * (curve.p1.y - curve.p0.y) +
            6 * u * t * (curve.p2.y - curve.p1.y) +
            3 * t * t * (curve.p3.y - curve.p2.y),
    };
}

export function evalCubicSecondDerivative(
    curve: CubicBezier,
    t: number
): Vec2 {
    const u = 1 - t;

    return {
        x:
            6 * u * (curve.p2.x - 2 * curve.p1.x + curve.p0.x) +
            6 * t * (curve.p3.x - 2 * curve.p2.x + curve.p1.x),

        y: 
            6 * u * (curve.p2.y - 2 * curve.p1.y + curve.p0.y) +
            6 * t * (curve.p3.y - 2 * curve.p2.y + curve.p1.y),
    };
}