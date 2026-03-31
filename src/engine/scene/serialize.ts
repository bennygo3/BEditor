import type { Scene } from "./scene";

export function serializeScene(scene: Scene): string {
    return JSON.stringify(scene, null, 2);
}

export function deserializeScene(json:string): Scene{
    const parsed = JSON.parse(json) as Scene;

    if (!parsed || !Array.isArray(parsed.nodes)) {
        throw new Error("Invalid scene JSON");
    }

    return parsed;
}