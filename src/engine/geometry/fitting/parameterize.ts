import type { Vec2 } from "../../math/vec2";

export function chordLengthParameters(
    points: Vec2[]
): number[] {
    if (points.length === 0) {
        return [];
    }

    if (points.length === 1) {
        return [0];
    }

    const distances: number[] = [0];

    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
        const previous = points[i - 1];
        const current = points[i];

        const dx = current.x - previous.x;
        const dy = current.y - previous.y;

        const distance = Math.hypot(dx, dy);

        totalDistance += distance;

        distances.push(totalDistance);
    }

    // if all points are identical, avoid dividing by zero
    if (totalDistance <= 1e-10) {
        return points.map(
            (_, i) => i / (points.length - 1)
        );
    }

    // normalize cumulative distances to 0-1
    return distances.map(
        (distance) => distance / totalDistance
    );
}