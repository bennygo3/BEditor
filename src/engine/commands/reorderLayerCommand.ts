import type { Command } from "./command";
import type { EditorState } from "../editor/state";
import type { SceneNode } from "../scene/node";

export class ReorderLayerCommand implements Command {
    constructor(
        private editorState: EditorState,
        private beforeNodes: SceneNode[],
        private afterNodes: SceneNode[]
    ) {}

    do(): void {
        this.editorState.scene.nodes = [...this.afterNodes];
    }

    undo(): void {
        this.editorState.scene.nodes = [...this.beforeNodes];
    }
}