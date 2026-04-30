import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import { findShapeById } from "../scene/findShape";
import type { Vec2 } from "../math/vec2";

export class ResizeLineCommand implements Command {
    constructor(
        private editorState: EditorState,
        private shapeId: string,
        private beforeStart: Vec2,
        private beforeEnd: Vec2,
        private afterStart: Vec2,
        private afterEnd: Vec2
    ) {}

    do(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape || shape.type !== "line") return;

        shape.start = { ...this.afterStart };
        shape.end = { ...this.afterEnd };
    }

    undo(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape || shape.type !== "line") return;

        shape.start = { ...this.beforeStart };
        shape.end = { ...this.beforeEnd};
    }
}