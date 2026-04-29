import type { Vec2 } from "./vec2";

// current placement/orientation of a shape:

export type Transform = {
    position: Vec2; // where is shape located in world space
    rotation: number; // how much is the shape turned? angle in radians; Math.PI = 180°
    scale: Vec2; // controls size scaling in x and y independently; { x: 1, y: 1 } = normal size { x: 2, y: 1 } = twice as wide 
};

// "do nothing" transform: 
// ex: apply transform({ x: 10, y: 5 }, identityTransform()) -> result = { x: 10, y: 5 }

export function identityTransform(): Transform {
    return {
        position: { x: 0, y: 0 }, // no movement
        rotation: 0, // no rotation
        scale: { x: 1, y: 1 }, // no scale change 
    };
}

// forward transform; takes a point in local space and outputs a point in world space:
export function applyTransform(p: Vec2, t: Transform): Vec2 {
    // scale: 
    // ... stretches or shrinks the point relative to local origin; ex: p = { x: 10, y: 20} scale = { x: 2, y: 3 } then x = 20, y = 60. - *Scale comes first because I want the shape's geometry to be resized in its own coordiante system before rotating or moving it
    let x = p.x * t.scale.x;
    let y = p.y * t.scale.y;

    // rotate: 
    // 2D geometry is defined using trigonometry (cos, sin) -> rotating a point around the origin
    // rotates around the local origin (0, 0), not around the shape's center
    const cos = Math.cos(t.rotation);
    const sin = Math.sin(t.rotation);
    
    // 2D rotation formula:
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;

    // translate:
    // now that the point has been scaled and rotated, we move it into world space:
    // if rx = 20 ry = 40 position = { x: 100, y: 50 } then -> { x: 130, y: 90 }
    return { 
        x: rx + t.position.x, 
        y: ry + t.position.y 
    };

    // apply transform: local point -> scale -> rotate -> translate -> world point
}

// Reverse transform from above. Takes a world-space point and converts it back into local space. 
// If a shape is rotated, and the mouse clicks somewhere on the screen, the raw coordinates are in world space. But for resizing/editing, i need to know: where is this point relative to the shape's own unrotated geometry. This is what applyInverse provides...
export function applyInverseTransform(point: Vec2, t: Transform): Vec2 {
    
    // undo translation. moves the point back into the rotated/scaled local frame.
    const tx = point.x - t.position.x;
    const ty = point.y - t.position.y;

    // undo rotation. rotate by the negative angle
    const cos = Math.cos(-t.rotation);
    const sin = Math.sin(-t.rotation);

    const rx = tx * cos - ty * sin;
    const ry = tx * sin + ty * cos;

    // undo scale. forward transform is multiplied by scale so the inverse divides by scale. leads back to local coordiantes.
    return {
        x: rx / t.scale.x,
        y: ry / t.scale.y,
    };

    // applyInverseTransform: world point -> subtract translation -> rotate by negative angle -> divide by scale -> local point
}
