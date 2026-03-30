import {
    vec2,
    identityTransform,
    createScene,
    createEditorState,
    findTopmostShapeAtPoint,
    findShapeById,
    CommandHistory,
    SelectShapeCommand,
    MoveShapeCommand,
    type RectShape,
    type EllipseShape,
    type InteractionMode,
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

    return scene;

}

function main(): void {
    const canvas = document.getElementById("editor-canvas") as HTMLCanvasElement;
    if (!canvas) {
        throw new Error("Canvas element #editor-canvas not found");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("2D canvas context could not be created");
    }

    const scene = buildDemoScene();
    const editorState = createEditorState(scene);
    const history = new CommandHistory();
    const renderer = new CanvasRenderer(ctx);

    let interaction: InteractionMode = { type: "idle" };

    function render(): void {
        renderer.renderScene(editorState.scene);

        if (editorState.selectedShapeId) {
            const shape = findShapeById(
                editorState.scene,
                editorState.selectedShapeId
            );
            if (shape) {
                renderer.renderBounds(shape, { color: "#16a34a" });
            }
        }
    } 

    canvas.addEventListener("mousedown", (event) => {
        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        const hit = findTopmostShapeAtPoint(point, editorState.scene);

        history.execute(
            new SelectShapeCommand(
                editorState,
                hit ? hit.id : null
            )
        );

        if (hit) {
            interaction = {
                type: "dragging",
                shapeId: hit.id,
                dragStart: point,
                lastPointer: point,
            };
        } else {
            interaction = { type: "idle" };
        }

        render();
    });

    canvas.addEventListener("mousemove", (event) => {
        if (interaction.type !== "dragging") return;

        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        const dx = point.x - interaction.lastPointer.x;
        const dy = point.y - interaction.lastPointer.y;

        const shape = findShapeById(
            editorState.scene,
            interaction.shapeId
        );

        if (!shape) return;

        // live preview movement (Not a command yet)
        shape.transform.position.x += dx;
        shape.transform.position.y += dy;

        interaction = {
            ...interaction,
            lastPointer: point,
        };

        render();
    });

    canvas.addEventListener("mouseup", (event) => {
        if (interaction.type !== "dragging") return;

        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        const totalDelta = vec2(
            point.x - interaction.dragStart.x,
            point.y - interaction.dragStart.y
        );

        // revert the preview movement
        const shape = findShapeById(
            editorState.scene,
            interaction.shapeId
        );

        if (shape) {
            shape.transform.position.x -= totalDelta.x;
            shape.transform.position.y -= totalDelta.y;
        }

        // commit as a command
        history.execute(
            new MoveShapeCommand(
                editorState,
                interaction.shapeId,
                totalDelta
            )
        );

        interaction = { type: "idle" };

        render();
    });

    canvas.addEventListener("mouseleave", () => {
        interaction = { type: "idle" };
    });

    window.addEventListener("keydown", (event) => {
        const isMac = navigator.userAgent.toUpperCase().includes("MAC");
        const metaOrCtrl = isMac ? event.metaKey : event.ctrlKey;

        if (metaOrCtrl && event.key === "z" && !event.shiftKey) {
            history.undo();
            render();
        }

        if (
            metaOrCtrl && 
            (event.key === "y" || (event.key === "z" && event.shiftKey))
        ) {
            history.redo();
            render();
        }
    });

    render();
}

window.addEventListener("DOMContentLoaded", main);