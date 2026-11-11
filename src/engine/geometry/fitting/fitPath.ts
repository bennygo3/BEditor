import type { Vec2 } from "../../math/vec2";
import type { CubicBezier } from "./cubicBezier";
import { chordLengthParameters } from "./parameterize";
import { fitCubicLeastSquares } from "./fitCubic";
import { calculateFittingError } from "./fittingError";

// calculate a unit vector pointing from one point toward another
function getDirection(from: Vec2, to: Vec2): Vec2 {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const length = Math.hypot(dx, dy);

    if (length < 1e-10) {
        return { x: 0, y: 0 };
    }

    return {
        x: dx / length,
        y: dy / length,
    };
}

// construct a straight cubic between two points in case only two samples remain
function createLineCubic(start: Vec2, end: Vec2): CubicBezier {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    return {
        p0: start,
        p1: {
            x: start.x + dx / 3,
            y: start.y + dy / 3,
        },
        p2: {
            x: start.x + 2 * dx / 3,
            y: start.y + 2 * dy / 3,
        },
        p3: end,
    };
}

// estimate the direction of travel at the point where it's splitting
function getSplitTangent(points: Vec2[], splitIndex: number): Vec2 {
    const before = points[splitIndex - 1];
    const after = points[splitIndex + 1];

    const tangent = getDirection(before, after);

    if (tangent.x !==0 || tangent.y !== 0) {
        return tangent;
    }

    // if neighboring points cancel out, fall back to the incoming direction
    return getDirection(
        before,
        points[splitIndex]
    );
}

// recursively fit one or more cubics to a section of recorded mouse points
function fitSegment(
    points: Vec2[],
    startTangent: Vec2,
    endTangent: Vec2,
    maxAllowedSquaredError: number
): CubicBezier[] {

    //Base case: Two points define one straight segment
    if (points.length === 2) {
        return [
            createLineCubic(points[0], points[1])
        ];
    }

    // step 1: estimate parameter posiitions
    const parameters = chordLengthParameters(points);

    // step 2: fit one cubic using least squares
    const curve = fitCubicLeastSquares(
        points,
        parameters,
        startTangent,
        endTangent
    );

    // step 3: measure how well it fits
    const { 
        maxSquaredError,
        splitIndex
    } = calculateFittingError(
        points, 
        parameters,
        curve
    );

    // if the fit is good enough, accept it
    if (maxSquaredError <= maxAllowedSquaredError) return [curve];

    // a bad fit must have an interior point where the samples can be divided
    if (splitIndex <= 0 || splitIndex >= points.length - 1) {
        throw new Error("Unable to subdivide Bezier samples");
    }

    // step 4: estimate the tangent where the two sections will meet
    const middleTangent = getSplitTangent(points, splitIndex);

    // both sections include the split point so their endpoints meet exactly
    const leftPoints = points.slice(0, splitIndex + 1);

    const rightPoints = points.slice(splitIndex);

    // step 5: recursively fit the left side
    const leftCurves = fitSegment(
        leftPoints,
        startTangent,
        middleTangent,
        maxAllowedSquaredError
    );

    // step 6: recursively fit the right side
    const rightCurves = fitSegment(
        rightPoints,
        middleTangent,
        endTangent,
        maxAllowedSquaredError
    );

    // combine them in drawing order
    return [
        ...leftCurves,
        ...rightCurves
    ];
}

// public entry point for the new fitting engine
export function fitBezierSegments(
    rawPoints: Vec2[], 
    tolerance = 2
): CubicBezier[] {
    
    // remove consecutive duplicate samples
    const points: Vec2[] = [];

    for (const point of rawPoints) {
        if (
            !Number.isFinite(point.x) ||
            !Number.isFinite(point.y)
        ) {
            throw new Error("Bezier samples must be finite");
        }

        const previous = points[points.length - 1];

        if (!previous || Math.hypot(
                point.x - previous.x,
                point.y - previous.y
            ) > 1e-8
        ) {
            points.push({ ...point });
        }
    }

    if (points.length < 2) return [];

    const last = points.length - 1;

    const startTangent = getDirection(points[0], points[1]);

    const endTangent = getDirection(points[last - 1], points[last]);

    const allowedError = Math.max(0, tolerance) ** 2;

    return fitSegment(
        points, 
        startTangent,
        endTangent,
        allowedError
    );
}