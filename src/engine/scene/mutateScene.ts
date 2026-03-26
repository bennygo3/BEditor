import type { Scene } from "./scene";
import type { SceneNode } from "./node";

export function addNode(scene: Scene, node: SceneNode): void {
    scene.nodes.push(node);
}

export function removeNodeByShapeId(scene: Scene, shapeId: string): SceneNode | null {
    for (let i = 0; i < scene.nodes.length; i++) {
        const node = scene.nodes[i];

        if (node.type === "shape" && node.shape.id === shapeId) {
            const removed = scene.nodes.splice(i, 1)[0];
            return removed;
        }
    }

    return null;
}

export function insertNodeAt(scene: Scene, index: number, node: SceneNode): void {
    scene.nodes.splice(index, 0, node);
}

export function findNodeIndexByShapeId(scene: Scene, shapeId: string): number {
    for (let i = 0; i < scene.nodes.length; i++) {
        const node = scene.nodes[i];

        if (node.type === "shape" && node.shape.id === shapeId) {
            return i;
        }
    }

    return -1;
}

// Centralizing scene mutations so commands don't directly mess with array details everywhere