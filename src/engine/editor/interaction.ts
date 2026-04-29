import type { Vec2 } from "../math/vec2";

// interaction mode = which mode is the editor currently in?

export type InteractionMode = 
| { type: "idle" }
| {
    type: "dragging"; 
    shapeId: string;
    dragStart: Vec2;
    lastPointer: Vec2;
    // mousdown -> set interaction = dragging
    // mousemove -> update shape position 
    // mouseup -> commit MoveShapeCommand
}
| {
    type: "rotating";
    shapeId: string;
    fixedWorldCenter: Vec2;
    startPointerAngle: number;
    startRotation: number;
    // mousedown -> interaction = rotating
    // mousemove -> compute delta angle
    // commit RotateCommand
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
    // mousedown -> interaction = resizing
    // mousemove -> update width/height (preview)
    // mouseup -> commit ResizeCommand
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
