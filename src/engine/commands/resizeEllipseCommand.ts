import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import { findShapeById } from "../scene/findShape";
import type { Vec2 } from "../math/vec2";

export class ResizeEllipseCommand implements Command {
    constructor(
        private editorState: EditorState,
        private shapeId: string,
        private beforeCenter: Vec2,
        private beforeRadiusX: number,
        private beforeRadiusY: number,
        private afterCenter: Vec2,
        private afterRadiusX: number,
        private afterRadiusY: number
    ) {}

    do(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape || shape.type !== "ellipse") return;

        shape.center = { ...this.afterCenter };
        shape.radiusX = this.afterRadiusX;
        shape.radiusY = this.afterRadiusY;
    }

    undo(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape || shape.type !== "ellipse") return;

        shape.center = { ...this.beforeCenter };
        shape.radiusX = this.beforeRadiusX;
        shape.radiusY = this.beforeRadiusY;
    }
}