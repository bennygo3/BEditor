import type { Vec2 } from "../math/vec2";
import type { Transform } from "../math/transform";
import { applyTransform } from "../math/transform";

export type PathAnchor = {
    point: Vec2;

    // relative to point above
    handleIn: Vec2;
    handleOut: Vec2;
};

export type BezierPath = {
    anchors: PathAnchor[];
    closed: boolean;
};

function distanceToSegment(
    point: Vec2,
    start: Vec2,
    end: Vec2
): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (dx === 0 && dy === 0) {
        return Math.hypot(
            point.x - start.x,
            point.y - start.y
        );
    }

    const t = Math.max(
        0,
        Math.min(
            1,
            (
                (point.x - start.x) * dx +
                (point.y - start.y) * dy
            ) /
            (dx * dx + dy * dy)
        )
    );

    const nearestX = start.x + t * dx;

    const nearestY = start.y + t * dy;

    return Math.hypot(
        point.x - nearestX,
        point.y - nearestY
    );
}

export function simplifyPoints(
    points: Vec2[],
    tolerance = 2
): Vec2[] {
    if (points.length <= 2) {
        return [...points];
    }

    let maxDistance = 0;
    let maxIndex = 0;

    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const distance = distanceToSegment(
            points[i],
            first,
            last
        );

        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }

    if (maxDistance <= tolerance) {
        return [
            { ...first },
            { ...last },
        ];
    }

    const left = simplifyPoints(
        points.slice(0, maxIndex + 1),
        tolerance
    );

    const right = simplifyPoints(
        points.slice(maxIndex),
        tolerance
    );

    return [
        ...left.slice(0, -1),
        ...right,
    ];
}

export function makeSmoothBezierPath(
    rawPoints: Vec2[],
    closed = false,
    tolerance = 2
): BezierPath {
    const points =
        simplifyPoints(
            rawPoints,
            tolerance
        );

    if (points.length === 0) {
        return {
            anchors: [],
            closed,
        };
    }

    const anchors: PathAnchor[] =
        points.map((point, index) => {
            const previous =
                closed
                    ? points[
                    (index - 1 + points.length) %
                    points.length
                    ]
                    : points[
                    Math.max(index - 1, 0)
                    ];

            const next =
                closed
                    ? points[
                    (index + 1) %
                    points.length
                    ]
                    : points[
                    Math.min(
                        index + 1,
                        points.length - 1
                    )
                    ];

            // Catmull-Rom style tangent
            const tangentX = (next.x - previous.x) / 6;

            const tangentY = (next.y - previous.y) / 6;

            return {
                point: {
                    ...point,
                },

                handleIn: {
                    x: -tangentX,
                    y: -tangentY,
                },

                handleOut: {
                    x: tangentX,
                    y: tangentY,
                },
            };
        });

    return {
        anchors,
        closed,
    };
}

export function traceBezierPath(
    ctx: CanvasRenderingContext2D,
    path: BezierPath,
    transform: Transform
): void {
    if (path.anchors.length === 0) {
        return;
    }

    const first = path.anchors[0];

    const firstWorld =
        applyTransform(
            first.point,
            transform
        );

    ctx.beginPath();

    ctx.moveTo(
        firstWorld.x,
        firstWorld.y
    );

    const segmentCount =
        path.closed
            ? path.anchors.length
            : path.anchors.length - 1;

    for (let i = 0; i < segmentCount; i++) {
        const current = path.anchors[i];

        const next =
            path.anchors[
            (i + 1) %
            path.anchors.length
            ];

        const control1Local = {
            x:
                current.point.x +
                current.handleOut.x,

            y:
                current.point.y +
                current.handleOut.y,
        };

        const control2Local = {
            x:
                next.point.x +
                next.handleIn.x,

            y:
                next.point.y +
                next.handleIn.y,

        };

        const control1 =
            applyTransform(
                control1Local,
                transform
            );

        const control2 =
            applyTransform(
                control2Local,
                transform
            );

        const end = applyTransform(next.point, transform);

        ctx.bezierCurveTo(
            control1.x,
            control1.y,

            control2.x,
            control2.y,

            end.x,
            end.y
        );
    }

    if (path.closed) {
        ctx.closePath();
    }
}



