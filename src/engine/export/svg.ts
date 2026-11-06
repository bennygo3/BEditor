import type { Scene } from "../scene/scene";
import type { SceneNode } from "../scene/node";
import type { Shape, ImageShape, RectShape, EllipseShape, LineShape, BrushShape } from "../geometry/shape";
import { downloadBlob } from "./download";
import { BezierPath } from "../geometry/path";


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
    const {
        position,
        rotation,
        scale,
    } = shape.transform;

    const rotationDegrees = rotation * (180 / Math.PI);

    const transform = `
        translate(${position.x} ${position.y})
        rotate(${rotationDegrees})
        scale(${scale.x} ${scale.y})
    `;

    // escape characters that could break XML attributs:
    const src = shape.src
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");

    const imageMarkup = `
        <image             
            href="${src}"
            x="${shape.origin.x}"
            y="${shape.origin.y}"
            width="${shape.width}"
            height="${shape.height}"
            opacity="${shape.opacity}"
            preserveAspectRatio="none"
        />
    `;

    // return `<image             
    //     href="${shape.src}"
    //     x="${shape.origin.x}"
    //     y="${shape.origin.y}"
    //     width="${shape.width}"
    //     height="${shape.height}"
    //     opacity="${shape.opacity}"
    //     ${transformToSvg(shape)}
    // />`;

    // normal image without mask
    if (!shape.mask || shape.mask.path.anchors.length < 3) {
        return `
            <g transform="${transform}">
                ${imageMarkup}
            </g>
        `;
    }

    // converts the closed Bezier mask to svg path data
    const maskD = bezierPathToSvg(shape.mask.path);

    // gives each image mask a unique svg identifier
    const clipId = `clip-${shape.id.replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
    )}`;

    return `
        <g transform="${transform}">
            <defs>
                <clipPath 
                    id="${clipId}"
                    clipPathUnits="userSpaceOnUse"
                >
                    <path d="${maskD}" />
                </clipPath>
            </defs>

            <g clip-path="url(#${clipId})">
                ${imageMarkup}
            </g>
        </g>
    `;
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

function bezierPathToSvg(path: BezierPath): string {
    if (path.anchors.length === 0) {
        return "";
    }

    const first = path.anchors[0];

    let d = `M ${first.point.x} ${first.point.y}`;

    const segmentCount =
        path.closed
            ? path.anchors.length
            : path.anchors.length - 1;

    for (let i = 0; i < segmentCount; i++) {
        const current = path.anchors[i];

        const next = path.anchors[
            (i + 1) %
            path.anchors.length
        ];

        const control1 = {
            x:
                current.point.x +
                current.handleOut.x,
            y:
                current.point.y +
                current.handleOut.y,
        };

        const control2 = {
            x:
                next.point.x +
                next.handleIn.x,
            y:
                next.point.y +
                next.handleIn.y,
        };

        d += `
            C ${control1.x} ${control1.y}
              ${control2.x} ${control2.y}
              ${next.point.x} ${next.point.y}
        `;
    }

    if (path.closed) {
        d += " Z";
    }

    return d;
}

function brushToSvg(shape: BrushShape): string {
    if (shape.path.anchors.length < 2) {
        return "";
    }

    const d = bezierPathToSvg(shape.path);

    const stroke = shape.style.stroke ?? "none";

    const strokeWidth = shape.style.strokeWidth ?? 1;

    const {
        position,
        rotation,
        scale,
    } = shape.transform;

    const rotationDegrees = rotation * (180 / Math.PI);

    return `
        <path 
            d="${d}"
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