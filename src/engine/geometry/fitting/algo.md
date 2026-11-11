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

The actual curve is calculated using this equation:

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

Next step in Schneider's algo: calculating optimal control points from recorded mouse positions.

Least-squares Bezier fitting

Once again, a cubic Bezier has four points:

    - P0: starting anchor
    - P1: first control point
    - P2: second control point
    - P3: ending anchor

When tracing with the mouse, the first and last points are already known. They're simply the first and last samples in the section being fit.

The main challenge is calculating P1 and P2. Instead of guessing thier positions, they can be solved for mathematically.

-Using tangent directions to reduce the problem-

A tangent is a vector indicating the direction of the curve at a particular point.

Suppose the recorded mouse points begin by moving upward and end by moving downward.

An estimation can be made using:

const startTangent = {
    x: points[1].x - points[0].x,
    y: points[1].y - points[0].y,
};

const endTangent = {
    x: points[last].x - points[last - 1].x,
    y: points[last].y - points[last - 1].y,
};

Then normalize each vector to a length of 1. Once these directions are known, the control points can be described as:

   
    P_1=P_0+\alpha T_0
    
    P_2=P_3-\beta T_1

Where: 
    - T_0 is the starting tangent
    - T_1 is the ending tangent (pointing in the direction of travel).
    - alpha is the length of the first handle
    - beta is the length of the second handle.

This simplifies the problem considerably.

Instead of solving for four unknown coordinates, I am solving for just two unknown lengths: alpha and beta. 

-Where least squares comes in-

Cubic Bezier equation:

    B(t) = b_0P_0+b_1P_1+b_2P_2+b_3P_3

The b values are the four Bernstein basis functions from the cubicBezier.ts file. Substituting the expressions for the control points gives:

    B(t) = (b_0+b_1)P_0+(b_2+b_3)P_3+alphab_1T_0-betab_2T_1

Objective is to have the calculated curve position to be as close as possible to each recorded mouse point.

For every sample, it is calculated how much curve differs from the mouse position. Least squares chooses alpha and beta to minimize the sum of those squared distances.

The equation can be rearranged into a small linear system:


begin{B-bmatrix}
C_{00} & C_{01}
C_{01} & C_{11}
end{B-matrix}
begin{B-matrix}
alpha|
beta
end{B-matrix}
=
begin{B-matrix}
X_0 |
X_1
end{B-matrix}

Despite the appearance, it is just two equations with two unknowns.

I need to calculate the C and X values from the recorded mouse points, then solve for alpha and beta.

for fitCubic.ts:

three especially important parts:

1. The dot product

function fot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
}

the dot product tells how two vectors relate in direction. In this calculation, it also helps express the squared error as a solvable system.

Eg: (3,4)•(2,5)=3(2)+4(5)=26

This is being used to accumulate the coefficients of the least-squares equations

2. The baseline

const baseline = {
    x: 
        (b0 + b1) * p0.x +
        (b2 + b3) * p3.x,

    y: 
        (b0 + b1) * p0.y +
        (b2 + b3) * p3.y,
};

Think of this as the curve position before accounting for either control-handle length.

The difference between the baseline and the actual mouse sample tells what the handles need to compensate for.

3. The determinant

const determinant = c00 * c11 - c01 * c01;

This tells whether the two-equation system has a unique, numerically usable solution.

When it is too close to zero, a fallback is used instead of dividing by an extremely small value.

The fallback uses one-third of the distance between the endpoints, a choice for approximating a straight-line cubic when the tangents align with the chord.

Tests to run to make sure math is correct:

    const originalCurve = {
        p0: { x: 0, y: 0 },
        p1: { x: 0, y: 100 },
        p2: { x: 100, y: 100 },
        p3: { x: 100, y: 0 },
    };

    const parameters = [0, 0.25, 0.5, 0.75, 1];

    const samples = parameters.map((t) => 
        evalCubicBezier(originalCurve, t)
    );

    const fittedCurve = fitCubicLeastSquares(
        samples, 
        parameters, 
        { x: 0, y: 1 }, // start direction: down
        { x: 0, y: -1 } // end direction: up
    );

    console.log("Original curve:", originalCurve);
    console.log("Fitted curve:", fittedCurve);

    for (const t of parameters) {
        console.log(
            `t=${t}`,
            evalCubicBezier(fittedCurve, t)
        );
    }

-Error Measurement-

The fitCubicLeastSquares() function calculates the best-fitting control points given two endpoint tangent directions and fixed parameter values.

But suppose a user is tracing the outline of someone's head, shoulder, and arm. This is a complicated path with several changes in direction. One cubic Bezier probably won't approximate the entire outline accurately.

I need a way to determine: - How accurate is the fitted curve? - Where does it deviate most from the mouse samples? - Should the curve be accepted, or split the points and fit smaller sections?

- The mathematics: squared distance -

I calculate a point on a Bezier curve with: evalCubicBezier(curve, t). For each recorded mouse point, I compare its position with the calculated curve position at the corresponding t.

const recordedPoint = { x: 50, y: 85 };
const curvePoint = { x: 50, y: 75 };

Their differences are: 

    dx = 50 - 50 = 0
    dy = 85 - 75 = 10

The squared distance is:

    d^2 = dx^2+dy^2=0^2+10^2=100

The actual distance is 10 pixels. 

Squared distance is used because calculating the true Euclidean distance requires a square root.

    Math.sqrt(dx * dx + dy * dy)

But when comparing distances, that square root is not needed. The largest squared distance is also the larget actual distance. 

This is to save some computation.

This leads to fittingError.ts:

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

For:

    if (squaredError > maxSquaredError) {
            maxSquaredError = squaredError;
            splitIndex = i;
        }

The errors aren't added together. Instead, I am looking for the single recorded point that deviates the most. Because when a curve is too inaccurate, the saples will eventually split near that location.

Eg:

    Point index:    0  1  2  3  4
    Squared Error:  0  4 100 9  0

Index 2 has the largest error (2, 100). The function returns:

{
    maxSquaredError: 100,
    splitIndex: 2
}

This tells the next stage of the algorithm where to consider dividing the trace.

The function measures deviation at each sample's assigned parameter t. This isn't necessarily the shortest geometric distance from a point to the curve. It's a practical fitting-error metric, and improvements for the parameter are needed in a later step.

The test setup for fittingError:

    const testCurve = {
        p0: { x: 0, y: 0 },
        p1: { x: 0, y: 100 },
        p2: { x: 100, y: 100 },
        p3: { x: 100, y: 0 },
    };

    const testParameters = [0, 0.25, 0.5, 0.75, 1];

    const exactPoints = testParameters.map((t) => 
        evalCubicBezier(testCurve, t)
    );

    const exactError = calculateFittingError(
        exactPoints,
        testParameters,
        testCurve
    );

    console.log("Exact curve error:", exactError);

    const modifiedPoints = exactPoints.map(point => ({ ...point }));
    modifiedPoints[2].y += 10;

    const modifiedError = calculateFittingError(
        modifiedPoints,
        testParameters,
        testCurve
    );

    console.log("Modified curve error:", modifiedError);

Expected output:
    
    Exact curve error: 
    {
        maxSquaredError: 0,
        splitIndex: -1
    }

    Modified curve error:
    {
        maxSquaredError: 100,
        splitIndex: 2
    }

The first test should produce zero error because every sampled point was calculated directly from the original curve.

The second test introduces a 10-pixel deviation at the middle point, giving a squared error of 100. The split index should be 2 because that's the index of the modified point.

-How will it be decided whether to split?-

By setting up a tolerance/max tolerance deviation.

const tolerance = 2;
const maxAllowedSquaredError = tolerance * tolerance;

The permitted squared error is: 2^2 = 4

Then:

if (result.maxSquaredError <= maxAllowedSquaredError) {
    // accept this curve
} else {
    // fit smaller sections of the trace
}

The modified example from before has a squared error of 100, considerably larger than 4, thus rejecting the approximation.

This will allow for a choice between a smoother, simpler outline and a more precise one.

Algorithm update:

    - Cubic Bezier evaluation -> $
    - Chord-length parameterization -> $
    - Least-squares fitting -> $
    - Fitting error measurement -> $
    - Curve subdivision -> tbd
    - Parameter refinement -> tbd
    - Closed-path conversion and integration -> tbd

Next step: implementing recursive subdivision. Taking a set of mouse points, finding where one cubic is insufficient, and producing multiple connected Bezier curves.

This is where the new fitter will start becoming capable of reproducing the detailed outline of a real photo

- Understanding recursive subdivision -

While tracing a person's silhouette, the outline of their sholder might form a smooth curve, but then the path changes direction around their arm.
Trying to represent that entire outline with one cubic Bezier would be inaccurate.
Instead, the algorithm being implemented will allow to divide the recorded points into smaller sections whenever the fitting error is too large.

One cubic (line) leads to a poor fit around direction changes. 
Multiple cubics (connected lines) leads to a more accurate fit

The algorithm will: 1) Fit one cubic Bezier, then 2) Measure the max error, 
then 3) determine if the error differential is within tolerance. 
If yes -> then it will keep the curve. 
If no -> then it will split and repeat.

The important concept here is recursion: a function calls itself to solve smaller versions of the same problem.

-fitPath.ts-

(see file)

Breaking down the recursion:

    const leftCurves = fitSegment(
        leftPoints,
        startTangent,
        middleTangent,
        maxAllowedSquaredError
    );

    
    const rightCurves = fitSegment(
        rightPoints,
        middleTangent,
        endTangent,
        maxAllowedSquaredError
    );

Suppose the recorded points are:

    [A, B, C, D, E, F, G]

And the maximum error occurs at point D, which has index 3.

We then divide the samples into:

    leftPoints = [A, B, C, D];
    rightPoints = [D, E, F, G];

D appears in both arrays. This is intentional. The left Bezier must end at D,
and the right Bezier must begin at D.

This gives positional continuity: 

    P_3,left = P_0,right

In graphics programming this is called C0 continuity. It means the curves connect without a gap.

The same middleTangent is passed into both fitting operations to encourage the curves to have the same direction at the junction. 
This can create smoother joins, although the two-point straight-line fallback does not guarantee tangent continuity.

-Why does recursion eventually stop?-

Every time the parent splits, each child receives fewer points than its parent. 
Eventually, one of two things happens:
 - A fitted curve satisfies the error tolerance.
 - A section contains just two points, and createLineCubic() constructs a straight segment.

That second condition is called the base case. Without a base case, a recursive function could 
keep calling itself indefinitely. 

A limitation to consider: two endpoints alone cannot tell what happens between them. The straight-line fallback faithfully
connects the samples, but it cannot guarantee the unseen image boundary follows the line.

-Testing the subdivision-

const tracePoints = [
    { x: 0, y: 0 },
    { x: 25, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 25 },
    { x: 50, y: 50 },
    { x: 75, y: 50 },
    { x: 100, y: 50 },
];

const fittedSegments = fitBezierSegments(tracePoints, 1);

console.log(
    "Number of fitted segments:",
    fittedSegments.length
);

console.log(
    "Fitted segments:",
    fittedSegments
);

// a sharp multi-direction trace should require more than one cubic
console.assert(
    fittedSegments.length > 1,
    "Expected multiple Bezier segments."
);

// check that neighboring curves connect.
for (let i = 0; i < fittedSegments.length - 1; i++) {
    const current = fittedSegments[i];
    const next = fittedSegments[i + 1];

    console.assert(
        current.p3.x === next.p0.x &&
        current.p3.y === next.p0.y,
        `Segments ${i} and ${i + 1} do not connect.`
    );
}

What is expected:
    - the algo returns multiple cubic segments.
    - each cubic has its own p0, p1, p2, p3
    - the last point of one curve matches the first point of the next
    - there are no assertion errors in the console

* a particular number of segments aren't expected yet. the actual subdivision depends on where the fitting error peaks

- Additional test for straight line:

const straightPoints = [
    { x: 0, y: 0 },
    { x: 25, y: 0 },
    { x: 50, y: 0 },
    { x: 75, y: 0 },
    { x: 100, y: 0 },
];

const straightSegments = fitBezierSegments(straightPoints, 1);

console.log("Straight-line segments:", straightSegments.length);

One cubic segment is expected because those five straight samples are collinear and can be represented exactly with a striaght Bezier curve

The above tests for the recursive subdivision passed.

The -Trace with sharp direction changes- test passed with a resulting 5 Bezier segments

The - straight-line trace- passed with 1 Bezier segment

-segment connections- test passed with no console.assertion errors shown

Five segments for seven recorded points isn't necessarily optimal, but it deomstrates that
the algorithm is subdividing a trace when one curve doesn't fit within the specified tolerance

That means the program now has a working recursive Bezier fitter!

The next step is to introduce a numerical technique called Newton-Raphson iteration.

- Refining the parameter values -

Take the chordLengthParameters() function. It estimates the t value associated with each mouse sample using distances along the recorded points.

For example:
    
    const parameters = [0, 0.28, 0.53, 0.76, 1];

But those are estimates. The points might actually correspond to positions such as:

    const actualParameters = [0, 0.25, 0.5, 0.75, 1];

That difference matters because the least-squares solver uses these t values to determine where each sample should lie on the curve

Newton-Raphson will help improve these estimates so a better fit can potentially be achieved with fewer Bezier segments.

The next objective is to build and test the implementation of Newton-Raphson separately, just as we have done with the prev components. 

-The math behind Newton-Raphson-

Imagine there is a recorded mouse point: P, and a fitted Bezier curve. 
The objective is to find a parameter: t, where the curve comes as close to possible to P.
The goal is to minimize the distance between P and B(t). B = Bezier

To minimize the squared distance, seek a value of t satisfying:

    (B(t)-P)•B'(t)=0

- B(t) is the position on the Bezier curve.
- P is the recorded mouse point.
- B'(t) is the first derivative, representing the curve's tangent.

Newton-Raphson gives an updated formula:

    t_new = t - (B(t)-P)•B'(t) ----over---- B'(t)•B'(t)+(B(t)-P)•B"(t)

Taking note of the two derivatives: B'(t) and B"(t).
These haven't been implemented yet, so it will be in order to do so.

- Adding derivative functions to cubicBezier.ts -

see formula at the bottom of cubicBezier file

The first derivative describes the direction and rate of change of the curve as t increases.
The second derivative describes how that first derivative changes.

They allow Newton-Raphson to estimate how to adjust t to reduce the fitting error.

-Safeguards built in refineParameters.ts-

Why are the safeguards needed?

Newton-Raphson is powerful, but it isn't guaranteed to find the correct solution from every starting estimate.

For example, if a curve loops back on itself, one mouse point might be close to multiple locations on that curve. 

The implementation therefore: 
    - rejects unstable divisions
    - keeps parameters between 0 and 1
    - accepts only corrections that reduce squared distance
    - preserves the order of points along the curve

These checks make this a reasonable first refinement implementation.
Later, introduction of additional strategies will be needed for difficult geometries.

-Time to test the refinement-

    const testCurve = {
        p0: { x: 0, y: 0 },
        p1: { x: 0, y: 100 },
        p2: { x: 100, y: 100 },
        p3: { x: 100, y: 0 },
    };

    const actualParameters = [0, 0.25, 0.5, 0.75, 1];

    const samples = actualParameters.map(t => evalCubicBezier(testCurve, t));

    // deliberately inaccurate estimates
    let estimatedParams = [0, 0.35, 0.58, 0.82, 1];

    const initialError = calculateFittingError(
        samples,
        estimatedParams,
        testCurve
    );

    // perform five rounds of refinement
    for (let i = 0; i < 5; i++) {
        estimatedParams = refineParameters(
            samples,
            estimatedParams,
            testCurve
        );

        console.log(`Refinement ${i + 1}:`, estimatedParams);

    }

    const finalError = calculateFittingError(
        samples,
        estimatedParams,
        testCurve
    );

    console.log("Actual:", actualParameters);
    console.log("Refined:", estimatedParams);

    console.log("Initial squared error:", initialError.maxSquaredError);
    console.log("Final squared error:", finalError.maxSquaredError);

    console.assert(finalError.maxSquaredError < initialError.maxSquaredError, "expected refinement to reduce the error")









