import type { Vec2 } from "./vec2";

export type Transform = {
    position: Vec2;
    rotation: number;
    scale: Vec2;
};

export function identityTransform(): Transform {
    return {
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: { x: 1, y: 1 },
    };
}

export function applyTransform(p: Vec2, t: Transform): Vec2 {
    // scale
    let x = p.x * t.scale.x;
    let y = p.y * t.scale.y;

    // rotate
    const cos = Math.cos(t.rotation);
    const sin = Math.sin(t.rotation);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;

    // translate
    return { x: rx + t.position.x, y: ry + t.position.y };
}