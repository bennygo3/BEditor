import type { Scene } from "../scene/scene";

export type EditorState = {
    scene: Scene;
    selectedShapeId: string | null;
};

export function createEditorState(scene: Scene): EditorState {
    return {
        scene,
        selectedShapeId: null,
    };
}