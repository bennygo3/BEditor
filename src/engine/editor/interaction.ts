import type { Vec2 } from "../math/vec2";

export type InteractionMode = 
| { type: "idle" }
| {
    type: "dragging";
    shapeId: string;
    dragStart: Vec2;
    lastPointer: Vec2;
}