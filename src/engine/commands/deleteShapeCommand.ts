import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import type { SceneNode } from "../scene/node";
import {
    removeNodeByShapeId,
    insertNodeAt,
    findNodeIndexByShapeId,
} from "../scene/mutateScene";

// Delete all shapes function below this immediate single shape delete function

export class DeleteShapeCommand implements Command {
    private removedNode: SceneNode | null = null;
    private removedIndex: number = -1;
    private previousSelectedShapeId: string | null;

    constructor(
        private editorState: EditorState,
        private shapeId: string
    ) {
        this.previousSelectedShapeId = editorState.selectedShapeId;
    }

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

        insertNodeAt(this.editorState.scene, this.removedIndex, this.removedNode);
        this.editorState.selectedShapeId = this.previousSelectedShapeId;
    }

    // undo() restores the shape in the same stacking order
}

export class DeleteShapesCommand implements Command {
    private removed: { node: SceneNode; index: number }[] = [];
    private previousSelectedShapeId: string | null;
    private previousSelectedShapeIds: string[];

    constructor(
        private editorState: EditorState,
        private shapeIds: string[]
    ) {
        this.previousSelectedShapeId = editorState.selectedShapeId;
        this.previousSelectedShapeIds = [...editorState.selectedShapeIds];
    }

    do(): void {
        this.removed = [];

        for (const id of this.shapeIds) {
            const index = findNodeIndexByShapeId(this.editorState.scene, id);
            if (index === -1) continue;

            const node = removeNodeByShapeId(this.editorState.scene, id);
            if (!node) continue;

            this.removed.push({ node, index });
        }

        this.editorState.selectedShapeId = null;
        this.editorState.selectedShapeIds = [...this.previousSelectedShapeIds];
    }

    undo(): void {
        const sorted = [...this.removed].sort((a, b) => a.index - b.index);

        for (const item of sorted) {
            insertNodeAt(this.editorState.scene, item.index, item.node);
        }

        this.editorState.selectedShapeId = this.previousSelectedShapeId;
        this.editorState.selectedShapeIds = [...this.previousSelectedShapeIds];
    }
}