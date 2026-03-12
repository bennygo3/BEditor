import type { Command } from "./command";
import type { EditorState } from "../editor/state";

export class SelectShapeCommand implements Command {
    private previousSelectedShapeId: string | null;

    constructor(
        private editorState: EditorState,
        private nextSelectedShapeId: string | null
    ) {
        this.previousSelectedShapeId = editorState.selectedShapeId;
    }

    // Above: when Command is created, it remembers what selection used to be and what selection should become

    do(): void {
        this.editorState.selectedShapeId = this.nextSelectedShapeId;
    }

    // do() applies new selection

    undo(): void {
        this.editorState.selectedShapeId = this.previousSelectedShapeId
    }

    // undo() restores the old selection
}