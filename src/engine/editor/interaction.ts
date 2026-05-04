import type { Vec2 } from "../math/vec2";

// interaction mode = which mode is the editor currently in?

export type InteractionMode = 
| { type: "idle" }
| {
    type: "dragging";
    shapeId: string;
    dragStart: Vec2;
    lastPointer: Vec2;
}
| {
    type: "rotating";
    shapeId: string;
    fixedWorldCenter: Vec2;
    startPointerAngle: number;
    startRotation: number;
}
| {
    type: "resizing-rect";
    shapeId: string;
    handle: "nw" | "ne" | "se" | "sw";
    startPointer: Vec2;
    startLeft: number;
    startTop: number;
    startRight: number;
    startBottom: number;
}
| {
    type: "resizing-ellipse";
    shapeId: string;
    handle: "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw";
    startPointer: Vec2;
    startCenter: Vec2;
    startRadiusX: number;
    startRadiusY: number;
}
| {
    type: "creating-rect";
    startPoint: Vec2;
    previewShapeId: string;
}
| {
    type: "creating-ellipse";
    startPoint: Vec2;
    previewShapeId: string;
}
| {
    type: "creating-line";
    startPoint: Vec2;
    previewShapeId: string;
}
| {
    type: "resizing-line";
    shapeId: string;
    handle: "start" | "end";
    startStart: Vec2;
    startEnd: Vec2;
}
| {
    type: "marquee-selecting";
    startPoint: Vec2;
    currentPoint: Vec2;
}
