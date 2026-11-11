import type { Vec2 } from "../../math/vec2";
import type { CubicBezier } from "./cubicBezier";

function dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
}

function normalize(vector: Vec2): Vec2 {
    const length = Math.hypot(vector.x, vector.y);

    if (length < 1e-10) {
        return { x: 0, y: 0 };
    }

    return {
        x: vector.x / length,
        y: vector.y / length,
    };
}

export function fitCubicLeastSquares(
    points: Vec2[],
    parameters: number[],
    startTangent: Vec2,
    endTangent: Vec2
): CubicBezier {
    if (points.length < 2) {
        throw new Error("Each point must have a parameter value");
    }

    const p0 = points[0];
    const p3 = points[points.length - 1];

    // Tangents must be unit vectors.
    const t0 = normalize(startTangent);
    const t1 = normalize(endTangent);

    // Straight-line fallback handle length.
    const chordLength = Math.hypot(
        p3.x - p0.x,
        p3.y - p0.y
    );

    const fallbackLength = chordLength / 3;

    // values for the 2x2 linear system
    let c00 = 0;
    let c01 = 0;
    let c11 = 0;

    let x0 = 0;
    let x1 = 0;

    for (let i = 0; i < points.length; i++) {
        const t = parameters[i];
        const u = 1 - t;

        // Bernstein basis functions
        const b0 = u * u * u;
        const b1 = 3 * u * u * t;
        const b2 = 3 * u * t * t;
        const b3 = t * t * t;

        // Coefficients for the unknown handle lengths alpha and beta
        const a0: Vec2 = {
            x: t0.x * b1,
            y: t0.y * b1,
        };

        const a1: Vec2 = {
            x: -t1.x * b2,
            y: -t1.y * b2,
        };

        // Curve position if both handle lengths are zero
        const baseline: Vec2 = {
            x: 
                (b0 + b1) * p0.x +
                (b2 + b3) * p3.x,

            y: 
                (b0 + b1) * p0.y +
                (b2 + b3) * p3.y,
        };

        // Difference between recorded point and the baseline position
        const difference: Vec2 = {
            x: points[i].x - baseline.x,
            y: points[i].y - baseline.y,
        };

        // build the coefficient matrix
        c00 += dot(a0, a0);
        c01 += dot(a0, a1);
        c11 += dot(a1, a1);

        // build the right-hand side
        x0 += dot(a0, difference);
        x1 += dot(a1, difference);
    }

    // solve the two linear equations
    const determinant = c00 * c11 - c01 * c01;

    let alpha = fallbackLength;
    let beta = fallbackLength;

    if (
        Math.abs(determinant) >
        1e-12 * Math.max(1, c00 * c11)
    ) {
        alpha = (x0 * c11 - x1 * c01) / determinant;
        beta = (c00 * x1 - c01 * x0) / determinant;
    }

    // a negative handle length would point opposite to the chosen tangent.
    // for now, fall abck to positive lengths
    if (
        !Number.isFinite(alpha) ||
        !Number.isFinite(beta) ||
        alpha <= 0 ||
        beta <= 0
    ) {
        alpha = fallbackLength;
        beta = fallbackLength;
    }

    return {
        p0,

        p1: {
            x: p0.x + alpha * t0.x,
            y: p0.y + alpha * t0.y,
        },

        p2: {
            x: p3.x - beta * t1.x,
            y: p3.y - beta * t1.y,
        },

        p3,
    };
}