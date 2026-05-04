import type { Bounds } from "./bounds";

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
    return !(
        a.max.x < b.min.x ||  // means: A is completely to the Left of B
        a.min.x > b.max.x ||  // ... A is completely to the Right of B
        a.max.y < b.min.y ||  // ... A is completely Above B
        a.min.y > b.max.y     // ... A is completely Below B
        
        // A and B are separated if any of the above are true
    );
}

// boundsIntersect() is checking if the shapes are completely separated or not and then returning a boolean.
// overlap = Not (no overlap)