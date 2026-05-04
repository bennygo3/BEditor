import type { Scene } from "../scene/scene";

export type EditorState = {
    scene: Scene;
    selectedShapeId: string | null;
    selectedShapeIds: string[];
    hoveredShapeId: string | null;
};

export function createEditorState(scene: Scene): EditorState {
    return {
        scene,
        selectedShapeId: null,
        selectedShapeIds: [],
        hoveredShapeId: null,
    };
}