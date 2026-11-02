import type { Scene } from "../scene/scene";
import type { SceneNode } from "../scene/node";
import type { Shape, ImageShape, RectShape, EllipseShape, LineShape, BrushShape } from "../geometry/shape";
import { downloadBlob } from "./download";


function styleToSvg(
    shape: RectShape | EllipseShape | LineShape
): string {
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

function imageToSvg(shape: ImageShape): string {
    return `<image             
        href="${shape.src}"
        x="${shape.origin.x}"
        y="${shape.origin.y}"
        width="${shape.width}"
        height="${shape.height}"
        opacity="${shape.opacity}"
        ${transformToSvg(shape)}
    />`;
}

function shapeToSvg(shape: Shape): string {
    switch (shape.type) {
        case "rect":
            return rectToSvg(shape); 

        case "ellipse":
            return ellipseToSvg(shape);

        case "line":
            return lineToSvg(shape);

        case "image":
            return imageToSvg(shape);

        case "brush":
            return brushToSvg(shape);
    }
}

function lineToSvg(shape: LineShape): string {
    return `<line x1="${shape.start.x}" y1="${shape.start.y}" x2="${shape.end.x}" y2="${shape.end.y}"${transformToSvg(shape)} ${styleToSvg(shape)} />`;
}

function brushToSvg(shape: BrushShape): string {
    if (shape.points.length < 2) {
        return "";
    }

    const points = shape.points
        .map((point) => `{point.x},${point.y}`)
        .join(" ");

    const stroke = shape.style.stroke ?? "none";

    const strokeWidth = shape.style.strokeWidth ?? 1;

    const { 
        position,
        rotation,
        scale,
    } = shape.transform;

    const rotationDegrees = rotation * (180 / Math.PI);

    return `
        <polyline 
            points="${points}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
            transform="
                translate(${position.x} ${position.y})
                rotate(${rotationDegrees})
                scale(${scale.x} ${scale.y})
            "
        />
    `;
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

export function exportSceneToSvg(
    scene: Scene,
    width = 900,
    height = 600,
    filename = "bEditor-export"
): void {
    const svg = sceneToSvg(
        scene,
        width,
        height
    );

    const blob = new Blob(
        [svg],
        {
            type: "image/svg+xml;charset=utf-8",
        }
    );

    downloadBlob(
        blob,
        `${filename}.svg`
    );
}