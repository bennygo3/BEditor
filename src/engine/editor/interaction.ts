import type { Vec2 } from "../math/vec2";

export type InteractionMode = 
| { type: "idle" }
| {
    type: "dragging";
    shapeId: string;
    dragStart: Vec2;
    lastPointer: Vec2;
}
| {
    type: "resizing-rect";
    shapeId: string;
    handle: "nw" | "ne" | "se" | "sw";
    startPointer: Vec2;
    startOrigin: Vec2;
    startWidth: number;
    startHeight: number;
}