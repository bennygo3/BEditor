import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import type { Vec2 } from "../math/vec2";
import { findShapeById } from "../scene/findShape";
import { moveShapeBy } from "../geometry/moveShape";

export class MoveShapeCommand implements Command {
    constructor(
        private editorState: EditorState, // where to apply the change
        private shapeId: string, // what to apply the change to
        private delta: Vec2 // how to change it
    ) {}

    do(): void {
        const shape = findShapeById(this.editorState.scene, this.shapeId);
        if (!shape) return;

        moveShapeBy(shape, this.delta); // applies the mvmt; ex: { x: 30, y: 20 } = move right 30 and down 20
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

// MoveShapeCommand stores a delta vector representing how far the shape should move. The do() method applies the delta, and undo() applis the inverse delta. this makes undo straightforward without 
// ... needing to store the full previous state and aligns naturally with drag interactions which produce relative mvmt
// * commands should not "own" objects. they should reference them indirectly = Decoupling