import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import { findShapeById } from "../scene/findShape";

export class RotateShapeCommand implements Command {
    constructor(
        private editorState: EditorState,
        private shapeId: string,
        private beforeRotation: number,
        private afterRotation: number
    ) {}

    do(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape) return;

        shape.transform.rotation = this.afterRotation;
    }

    undo(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape) return;

        shape.transform.rotation = this.beforeRotation;
    }
}