import {
    vec2,
    identityTransform,
    createScene,
    type RectShape,
    type EllipseShape,
} from "./engine";
import { CanvasRenderer } from "./renderer/canvasRenderer";

function buildDemoScene() {
    const scene = createScene();

    const rectTransform = identityTransform();
    rectTransform.position = vec2(100, 80);
    rectTransform.rotation = Math.PI / 12;

    const ellipseTransform = identityTransform();
    ellipseTransform.position = vec2(500, 250);
    ellipseTransform.rotation = Math.PI / 10;

    const rect: RectShape = {
        type: "rect",
        id: "rect1",
        origin: vec2(0, 0),
        width: 220,
        height: 120,
        transform: rectTransform,
        style: {
            fill: "#4f46e5",
            stroke: "#111111",
            strokeWidth: 2,
        },
    };

    const ellipse: EllipseShape = {
        type: "ellipse",
        id: "ellipse1",
        center: vec2(0, 0),
        radiusX: 90,
        radiusY: 55,
        transform: ellipseTransform,
        style: {
            fill: "#e63946",
            stroke: "#333333",
            strokeWidth: 2,
        },
    };

    scene.nodes.push(
        { type: "shape", shape: rect },
        { type: "shape", shape: ellipse }
    );

    return { scene, rect, ellipse }
}

function main(): void {
    const canvas = document.getElementById("editor-canvas") as HTMLCanvasElement | null;
    if (!canvas) {
        throw new Error("Canvas element #editor-canvas not found");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("2D canvas context could not be created");
    }

    const renderer = new CanvasRenderer(ctx);
    const { scene, rect, ellipse } = buildDemoScene();

    renderer.renderScene(scene);
    renderer.renderBounds(rect);
    renderer.renderBounds(ellipse);
}

window.addEventListener("DOMContentLoaded", main);