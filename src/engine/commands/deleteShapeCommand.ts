import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import type { SceneNode } from "../scene/node";
import {
    removeNodeByShapeId,
    insertNodeAt,
    findNodeIndexByShapeId,
} from "../scene/mutateScene";

export class DeleteShapeCommand implements Command {
    private removedNode: SceneNode | null = null;
    private removedIndex: number = -1;

    constructor(
        private editorState: EditorState,
        private shapeId: string
    ) {}

    do(): void {
        this.removedIndex = findNodeIndexByShapeId(this.editorState.scene, this.shapeId);

        if (this.removedIndex === -1) return;

        this.removedNode = removeNodeByShapeId(this.editorState.scene, this.shapeId);

        if (this.editorState.selectedShapeId === this.shapeId) {
            this.editorState.selectedShapeId = null;
        }
    }

    // do() stores the removed node and the index it came from

    undo(): void {
        if (!this.removedNode || this.removedIndex === -1) return;

        insertNodeAt(this.editorState.scene, this.removedIndex, this.removedNode)
    }

    // undo() restores the shape in the same stacking order
}