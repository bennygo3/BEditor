import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import { findShapeById } from "../scene/findShape";

export class ResizeRectCommand implements Command {
    constructor(
        private editorState: EditorState,
        private shapeId: string,
        private beforeOrigin: { x: number; y: number },
        private beforeWidth: number,
        private beforeHeight: number,
        private afterOrigin: { x: number; y: number },
        private afterWidth: number,
        private afterHeight: number
    ) {}

    do(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape || shape.type !== "rect") return;

        shape.origin = { ...this.afterOrigin };
        shape.width = this.afterWidth;
        shape.height = this.afterHeight;
    }

    undo(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape || shape.type !== "rect") return;

        shape.origin = { ...this.beforeOrigin };
        shape.width = this.beforeWidth;
        shape.height = this.beforeHeight;
    }
}