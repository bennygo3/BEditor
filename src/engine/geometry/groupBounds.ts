import type { Scene } from "../scene/scene";
import { findShapeById } from "../scene/findShape";
import { getShapeBoundsWorld, type Bounds } from "./bounds";

export function getGroupBoundsWorld(scene: Scene, shapeIds: string[]): Bounds | null {
    const boundsList = shapeIds
        .map((id) => {
            const shape = findShapeById(scene, id);
            return shape? getShapeBoundsWorld(shape) : null;
        })
        .filter((bounds): bounds is Bounds => bounds !== null);
    
    if (boundsList.length === 0) return null;

    return {
        min: {
            x: Math.min(...boundsList.map((b) => b.min.x)),
            y: Math.min(...boundsList.map((b) => b.min.y)),
        },
        max: {
            x: Math.max(...boundsList.map((b) => b.max.x)),
            y: Math.max(...boundsList.map((b) => b.max.y)),
        },
    };
}