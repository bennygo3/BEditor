import type { Vec2 } from "../math/vec2";
import type { BezierPath, PathAnchor } from "./path";

export type PathLocalBounds = {
    min: Vec2;
    max: Vec2;
}

function cubicAt(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
): number {
    const oneMinusT = 1 - t;

    return (
        oneMinusT ** 3 * p0 +
        3 * oneMinusT ** 2 * t * p1 +
        t ** 3 * p3
    );
}

function getCubicExtrema(
    p0: number,
    p1: number,
    p2: number,
    p3: number
): number[] {
    const a = 
        -p0 +
        3 * p1 -
        3 * p2 + 
        p3;

    const b = 
        2 * (
            p0 -
            2 * p1 +
            p2
        );

    const c =
        p1 - p0;

    const extrema: number[] = [];

    if (Math.abs(a) < 0.000001) {
        if (Math.abs(b) < 0.000001) {
            return extrema;
        }

        const t = -c / b;

        if (t > 0 && t < 1) {
            extrema.push(t);
        }

        return extrema;
    }

    const discriminant = 
        b * b - 4 * a * c;

    if (discriminant < 0) {
        return extrema;
    }

    const sqrt = Math.sqrt(discriminant);

    const t1 = (-b + sqrt) / (2 * a);
    const t2 = (-b - sqrt) / (2 * a);

    if (t1 > 0 && t1 < 1) {
        extrema.push(t1);
    }

    if (t2 > 0 && t2 < 1) {
        extrema.push(t2);
    }

    return extrema;
}

function getControlPoints(current: PathAnchor, next: PathAnchor) {
    return {
        start: current.point,
        control1: {
            x: 
                current.point.x + 
                current.handleOut.x,
            y: 
                current.point.y +
                current.handleOut.y,
        },

        control2: {
            x:
                next.point.x +
                next.handleIn.x,
            y: 
                next.point.y + 
                next.handleIn.y,
        },

        end: next.point,
    };
}

export function getBezierPathLocalBounds(
    path: BezierPath
): PathLocalBounds {
    if (path.anchors.length === 0) {
        return {
            min: {
                x: 0,
                y: 0,
            },

            max: {
                x: 0,
                y: 0,
            },
        };
    }

    const first = path.anchors[0].point;

    let minX = first.x;
    let minY = first.y;
    let maxX = first.x;
    let maxY = first.y;

    const segmentCount = 
        path.closed 
            ? path.anchors.length 
            : path.anchors.length - 1;

    for (let i = 0; i < segmentCount; i++) {
        const current = path.anchors[i];

        const next = path.anchors[
            (i + 1) %
            path.anchors.length
        ];

        const {
            start,
            control1,
            control2,
            end,
        } = getControlPoints(
            current,
            next
        );

        const xValues = [
            start.x,
            end.x
        ];

        const yValues = [
            start.y,
            end.y,
        ];

        const xExtrema = 
            getCubicExtrema(
                start.x,
                control1.x,
                control2.x,
                end.x
            );

        const yExtrema =
            getCubicExtrema(
                start.y,
                control1.y,
                control2.y,
                end.y
            );

        for (const t of xExtrema) {
            xValues.push(
                cubicAt(
                    start.x,
                    control1.x,
                    control2.x,
                    end.x,
                    t
                )
            );
        }

        for (const t of yExtrema) {
            yValues.push(
                cubicAt(
                    start.y,
                    control1.y,
                    control2.y,
                    end.y,
                    t
                )
            );
        }

        minX = Math.min(minX, ...xValues);
        maxX = Math.max(maxX, ...xValues);
        minY = Math.min(minY, ...yValues);
        maxY = Math.max(maxY, ...yValues);
    }

    return {
        min: {
            x: minX,
            y: minY,
        },

        max: {
            x: maxX,
            y: maxY,
        },
    };
}

export function getBezierPathLocalCenter(
    path: BezierPath
): Vec2 {
    const bounds = getBezierPathLocalBounds(path);

    return {
        x: 
            (bounds.min.x + bounds.max.x) / 2,
        y: (bounds.min.y + bounds.max.y) / 2,
    };
}