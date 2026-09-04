import type { Vec2 } from "../math/vec2";
import { isPointInBounds } from "../geometry/hitTest";
import type { Shape } from "../geometry/shape";
import type { Scene } from "./scene";
import type { SceneNode } from "./node";
import { lineHitTest } from "../geometry/lineHitTest";
import { hitTestImage } from "../geometry/imageHitTest";

function findHitInNode(point: Vec2, node: SceneNode): Shape | null {
    if (node.type === "shape") {
        const shape = node.shape;

        if (shape.type === "line") {
            return lineHitTest(point, shape) ? shape : null;
        }

        if (shape.type === "image") {
            return hitTestImage(point, shape) ? shape : null;
        }
        
        return isPointInBounds(point, shape) ? shape : null;
    }

    // groups: search children from end to start so children are on top
    for (let i = node.children.length - 1; i >= 0; i--) {
        const hit = findHitInNode(point, node.children[i]);
        
        if (hit) return hit;
    }

    return null;
}

export function findTopmostShapeAtPoint(point: Vec2, scene: Scene): Shape | null {
    // search scene from end o start so that later nodes are on top
    for (let i = scene.nodes.length - 1; i >= 0; i--) {
        const hit = findHitInNode(point, scene.nodes[i]);
        if (hit) return hit;
    }

    return null;
}