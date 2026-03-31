import type { Scene } from "../scene/scene";
import type { SceneNode } from "../scene/node";
import type { Shape, RectShape, EllipseShape } from "../geometry/shape";

function styleToSvg(shape: Shape): string {
    const fill = shape.style.fill ?? "none";
    const stroke = shape.style.stroke ?? "none";
    const strokeWidth = shape.style.strokeWidth ?? 1;

    return `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"`;
}

function transformToSvg(shape: Shape): string {
    const { position, rotation, scale } = shape.transform;

    const parts: string[] = [];

    if (position.x !== 0 || position.y !== 0) {
        parts.push(`translate(${position.x} ${position.y})`);
    }

    if (rotation !== 0) {
        const degrees = (rotation * 180) / Math.PI;
        parts.push(`rotate(${degrees})`);
    }

    if (scale.x !== 1 || scale.y !== 1) {
        parts.push(`scale(${scale.x} ${scale.y})`);
    }

    return parts.length > 0 ? ` transform="${parts.join(" ")}"` : "";
}

function rectToSvg(shape: RectShape): string {
    return `<rect x="${shape.origin.x}" y="${shape.origin.y}" width="${shape.width}" height="${shape.height}"${transformToSvg(shape)} ${styleToSvg(shape)} />`;
}

function ellipseToSvg(shape: EllipseShape): string {
    return `<ellipse cx="${shape.center.x}" cy="${shape.center.y}" rx="${shape.radiusX}" ry="${shape.radiusY}"${transformToSvg(shape)} ${styleToSvg(shape)} />`;
}

function shapeToSvg(shape: Shape): string {
    if (shape.type === "rect") {
        return rectToSvg(shape);
    }

    if (shape.type === "ellipse") {
        return ellipseToSvg(shape);
    }

    return "";
}

function nodeToSvg(node: SceneNode): string {
    if (node.type === "shape") {
        return shapeToSvg(node.shape);
    }

    const children = node.children.map(nodeToSvg).join("\n");
    return `<g>\n${children}\n</g>`;
}

export function sceneToSvg(scene: Scene, width = 900, height = 600): string {
    const content = scene.nodes.map(nodeToSvg).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${content}
    </svg>`;
}