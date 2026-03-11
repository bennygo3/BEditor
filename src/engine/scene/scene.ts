import type { SceneNode } from "./node";

export type Scene = { nodes: SceneNode[] };

export function createScene(): Scene {
    return { nodes: [] };
}