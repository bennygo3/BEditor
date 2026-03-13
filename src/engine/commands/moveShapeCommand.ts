import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import type { Vec2 } from "../math/vec2";
import { findShapeById } from "../scene/findShape";
import { moveShapeBy } from "../geometry/moveShape";

export class MoveShapeCommand implements Command {
    constructor(
        private editorState: EditorState,
        private shapeId: string,
        private delta: Vec2
    ) {}

    do(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape) return;

        moveShapeBy(shape, this.delta);
    }

    // do() moves the shape by delta (moveShapeBy)

    undo(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape) return;

        moveShapeBy(shape, {
            x: -this.delta.x,
            y: -this.delta.y,
        });
    }

    // undo() moves back to negative delta
}

// if the move is { x: 30, y: 20 } then ---> undo will be { x: -30, y: -20 }