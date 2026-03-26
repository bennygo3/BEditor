import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import type { Shape } from "../geometry/shape";
import { addNode, removeNodeByShapeId } from "../scene/mutateScene";

export class AddShapeCommand implements Command {
    constructor(
        private editorState: EditorState,
        private shape: Shape
    ) {}

    do(): void {
        addNode(this.editorState.scene, {
            type: "shape",
            shape: this.shape,
        });
    }

    // do() adds the shape to the scene

    undo(): void {
        removeNodeByShapeId(this.editorState.scene, this.shape.id);
    }

    // undo() removes the shape again
}
