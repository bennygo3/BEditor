Algorithm differences notes

The idea is to replace the previous algorithm used to trace and outline an object so that the image can use a more accurate mask while tracing the outline of the image object.

The previous Bézier rendering used in this app:

ctx.bezierCurveTo(
    control1.x,
    control1.y,
    control2.x,
    control2.y,
    end.x,
    end.y
);

The above function draws the curve but the browser hides the math.

For a more accurate trace, I need to calculate the points on the curve myself.

A cubic Bézier is described by four points:

    - P0: where the curve starts
    - P1: First control point, influencing the outgoing direction
    - P2: Second control point, influencing its incoming direction.
    - P3: Where the curve ends.

! The actual curve is calculated using this equation:

    B(t)=(1-t)^3P_0+3(1-t)^2tP_1+3(1-t)t^2P_2+t^3P_3
    
t ranges fro 0 to 1.

0 gives the starting point, 1 gives the ending point, and 0.5 gives the midpoint in the curve's parameter, not necessarily halfway along its physical length.


in action:

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

Breaking down the math:

    const b1 = 3 * u * u * t;

    corresponds to:

    3(1-t)^2t

    since: 

    const u = 1 - t;

I can write the equation using ordinary JS multiplication rather than exponentiation.

Each b value acts as a weight for one of the four points.

Eg, at t = 0.5, the four weights are:

    b0 = 0.125
    b1 = 0.375
    b2 = 0.375
    b3 = 0.125

they always sum to 1 for a parameter between 0 and 1. This is how the equation combines four points into one position on the curve.

Parameterize

Suppose these mouse positions are recorded:

const points = [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 20, y: 0 },
    { x: 100, y: 0 },
];

if the points are assigned evenly spaced parameter values:

Point 0 -> t = 0
Point 1 -> t = 0.333
Point 2 -> t = 0.667
Point 3 -> t = 1

but the points aren't evenly spaced geometrically

The first two points are only 5 pixels apart. The last two points are 80 pixels apart.

Schneider's algorithm begins with chord-length parameterization. That means we assign t values according to the distances between successive mouse samples.

For this example, the intial parameters become:

Point 0 -> t = 0
Point 1 -> t = 0.05
Point 2 -> t = 0.20
Point 3 -> t = 1

These values better reflect where the samples fall along the traced geometery.

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

Why accumulate distances?

Suppose there are three points:

[
    { x: 0, y: 0 },
    { x: 3, y: 4 },
    { x: 6, y: 8 },
]

The distace between the first two:

    sqrt{3^2+4^2}=5

The distance between the second and third is also 5.

The cumulative distances are: 

[0, 5, 10]

The total is 10, so divide each by 10:

[0, 0.5, 1]

Now each mourse sample has an estimated position along the curve that is going to eventually fit.




