import type { Vec2 } from "../math/vec2";
import type { Shape } from "./shape";

export function moveShapeBy(shape: Shape, delta: Vec2): void {
    shape.transform.position.x += delta.x;
    shape.transform.position.y += delta.y;
}

// commands control mutation. undo will reverse it