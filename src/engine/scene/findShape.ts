import type { Shape } from "../geometry/shape";
import type { Scene } from "./scene";
import type { SceneNode } from "./node";

function findShapeInNode(node: SceneNode, shapeId: string): Shape | null {
    if (node.type === "shape") {
        return node.shape.id === shapeId ? node.shape : null;
    }

    for (const child of node.children) {
        const found = findShapeInNode(child, shapeId);
        if (found) return found;
    }

    return null;
}

export function findShapeById(scene: Scene, shapeId: string) : Shape | null {
    for (const node of scene.nodes) {
        const found = findShapeInNode(node, shapeId);
        if (found) return found;
    }

    return null;
}

// Seperation of responsibilites. Command logic is kept from needing to know the structure of the scene graph