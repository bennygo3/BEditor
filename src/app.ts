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
    hitTestRectHandle,
    ResizeRectCommand,
    serializeScene,
    deserializeScene,
    sceneToSvg,
    AddShapeCommand,
    generateId,
    DeleteShapeCommand,
    type RectShape,
    type EllipseShape,
    type InteractionMode,
    type Tool,
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

function makeRectFromDrag(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }, id: string): RectShape {
    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);

    return {
        type: "rect",
        id,
        origin: vec2(x, y),
        width,
        height,
        transform: identityTransform(),
        style: {
            fill: "#60a5fa55",
            stroke: "#2563eb",
            strokeWidth: 2,
        },
    };

    // function allows the drag to work in any direction
}

function makeEllipseFromDrag(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    id: string
) : EllipseShape {
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerY = (startPoint.y + endPoint.y) / 2;
    const radiusX = Math.abs(endPoint.x - startPoint.x) / 2;
    const radiusY = Math.abs(endPoint.y - startPoint.y) / 2;

    return {
        type: "ellipse",
        id,
        center: vec2(centerX, centerY),
        radiusX,
        radiusY,
        transform: identityTransform(),
        style: {
            fill: "#fca5a555",
            stroke: "#5c1f1f",
            strokeWidth: 2,
        },
    };
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

    // let scene = buildDemoScene();
    const scene = buildDemoScene();
    const editorState = createEditorState(scene);
    const history = new CommandHistory();
    const renderer = new CanvasRenderer(ctx);
    
    let activeTool: Tool = "select";

    const saveButton = document.getElementById("save-scene") as HTMLButtonElement | null;
    const loadButton = document.getElementById("load-scene") as HTMLButtonElement | null;
    const exportButton = document.getElementById("export-svg") as HTMLButtonElement | null;
    const selectToolButton = document.getElementById("tool-select") as HTMLButtonElement | null;
    const rectToolButton = document.getElementById("rect-tool") as HTMLButtonElement | null;
    const ellipseToolButton = document.getElementById("ellipse-tool") as HTMLButtonElement | null;


    console.log("saveButton:", saveButton);
    console.log("loadButton:", loadButton);
    console.log("exportButton", exportButton);
    
    if (!saveButton || !loadButton || !exportButton || !selectToolButton || !rectToolButton || !ellipseToolButton) {
        // throw new Error("Save/load buttons not found");
        console.error("Save/load/export/etc buttons not found")
        return;
    }

    saveButton.addEventListener("click", () => {
        const json = serializeScene(editorState.scene);
        localStorage.setItem("logo-editor-scene", json);
        console.log("Scene saved");
    });

    loadButton.addEventListener("click", () => {
        const json = localStorage.getItem("logo-editor-scene");

        if (!json) {
            console.log("No saved scene found");
            return;
        }

        const loadedScene = deserializeScene(json);
        editorState.scene.nodes = loadedScene.nodes;
        editorState.selectedShapeId = null;
        interaction = { type: "idle" };

        console.log("Scene loaded");
        render();
    });

    exportButton.addEventListener("click", () => {
        const svg = sceneToSvg(editorState.scene, canvas.width, canvas.height);

        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "logo-export.svg";
        a.click();

        URL.revokeObjectURL(url);

        console.log("SVG exported");
    });

    selectToolButton.addEventListener("click", () => {
        activeTool = "select";
        console.log("Active tool: select");
    });

    rectToolButton.addEventListener("click", () => {
        activeTool = "rect";
        console.log("Active tool: rect");
    });

    ellipseToolButton.addEventListener("click", () => {
        activeTool = "ellipse";
        console.log("Active tool: ellipse");
    })

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
                
                if (shape.type === "rect") {
                    renderer.renderRectHandles(shape);
                }
            }
        }
    } 

    canvas.addEventListener("mousedown", (event) => {
        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        if (activeTool === "rect") {
            const previewShapeId = generateId("rect");

            const previewRect = makeRectFromDrag(point, point, previewShapeId);
            editorState.scene.nodes.push({ type: "shape", shape: previewRect });

            editorState.selectedShapeId = previewShapeId;
            interaction = {
                type: "creating-rect",
                startPoint: point,
                previewShapeId,
            };

            render();
            return;
        }

        if (activeTool === "ellipse") {
            const previewShapeId = generateId("ellipse");

            const previewEllipse = makeEllipseFromDrag(point, point, previewShapeId);
            editorState.scene.nodes.push({ type: "shape", shape: previewEllipse});
            interaction = {
                type: "creating-ellipse",
                startPoint: point,
                previewShapeId,
            };

            render();
            return;
        }

        if (editorState.selectedShapeId) {
            const selectedShape = findShapeById(editorState.scene, editorState.selectedShapeId);

            if (selectedShape && selectedShape.type === "rect") {
                const handle = hitTestRectHandle(point, selectedShape);

                if (handle) {
                    interaction = {
                        type: "resizing-rect",
                        shapeId: selectedShape.id,
                        handle,
                        startPointer: point,
                        startOrigin: {...selectedShape.origin },
                        startWidth: selectedShape.width,
                        startHeight: selectedShape.height,
                    };

                    render();
                    return;
                }
            }
        }

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
        
        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        if (interaction.type === "creating-rect") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);

            if (!shape || shape.type !== "rect") return;

            const preview = makeRectFromDrag(
                interaction.startPoint,
                point,
                interaction.previewShapeId
            );

            shape.origin = preview.origin;
            shape.width = preview.width;
            shape.height = preview.height;

            render();
            return;
        }

        if (interaction.type === "resizing-rect") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);
            if (!shape || shape.type !== "rect") return;

            const dx = point.x - interaction.startPointer.x;
            const dy = point.y - interaction.startPointer.y;

            let newOrigin = { ...interaction.startOrigin};
            let newWidth = interaction.startWidth;
            let newHeight = interaction.startHeight;

            if (interaction.handle === "se") {
                newWidth = interaction.startWidth + dx;
                newHeight = interaction.startHeight + dy;
            } else if (interaction.handle === "sw") {
                newOrigin.x = interaction.startOrigin.x + dx;
                newWidth = interaction.startWidth - dx;
                newHeight = interaction.startHeight + dy;
            } else if (interaction.handle === "ne") {
                newOrigin.y = interaction.startOrigin.y + dy;
                newWidth = interaction.startWidth + dx;
                newHeight = interaction.startHeight - dy;
            } else if (interaction.handle === "nw") {
                newOrigin.x = interaction.startOrigin.x + dx;
                newOrigin.y = interaction.startOrigin.y + dy;
                newWidth = interaction.startWidth - dx;
                newHeight = interaction.startHeight - dy;
            }

            newWidth = Math.max(10, newWidth);
            newHeight = Math.max(10, newHeight);

            shape.origin = newOrigin;
            shape.width = newWidth;
            shape.height = newHeight;

            render();
            return;
        }

        if (interaction.type === "creating-ellipse") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);

            if (!shape || shape.type !== "ellipse") return;

            const preview = makeEllipseFromDrag(
                interaction.startPoint,
                point,
                interaction.previewShapeId
            );

            shape.center = preview.center;
            shape.radiusX = preview.radiusX;
            shape.radiusY = preview.radiusY;

            render();
            return;
        }

        if (interaction.type !== "dragging") return;

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
        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        if (interaction.type === "creating-rect") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);
            const previewId = interaction.previewShapeId;

            if (shape && shape.type === "rect") {
                const finalRect = {
                    ...shape,
                    style: {
                        fill: "#4f46e5",
                        stroke: "#111111",
                        strokeWidth: 2,
                    },
                };

                // remove preview node
                editorState.scene.nodes = editorState.scene.nodes.filter((node) => {
                    return !(node.type === "shape" && node.shape.id === previewId);
                });

                //only commit if it has visible size
                if (finalRect.width > 2 && finalRect.height > 2) {
                    history.execute(new AddShapeCommand(editorState, finalRect));
                    editorState.selectedShapeId = finalRect.id;
                } else {
                    editorState.selectedShapeId = null;
                }
            }

            interaction = { type: "idle" };
            activeTool = "select";
            render();
            return;
        }

        if (interaction.type === "resizing-rect") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);
            if (shape && shape.type === "rect") {
                history.execute(
                    new ResizeRectCommand(
                        editorState,
                        interaction.shapeId,
                        interaction.startOrigin,
                        interaction.startWidth,
                        interaction.startHeight,
                        { ...shape.origin },
                        shape.width,
                        shape.height
                    )
                );
            }

            interaction = { type: "idle"};
            render();
            return;
        }

        if (interaction.type === "creating-ellipse") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);
            const previewId = interaction.previewShapeId;

            if (shape && shape.type === "ellipse") {
                const finalEllipse = {
                    ...shape,
                    style:{
                        fill: "#e63946",
                        stroke: "#333333",
                        strokeWidth: 2,
                    },
                };

                editorState.scene.nodes = editorState.scene.nodes.filter((node) => {
                    return !(node.type === "shape" && node.shape.id === previewId);
                });

                if (finalEllipse.radiusX > 2 && finalEllipse.radiusY > 2) {
                    history.execute(new AddShapeCommand(editorState, finalEllipse));
                    editorState.selectedShapeId = finalEllipse.id;
                } else {
                    editorState.selectedShapeId = null;
                }
            }

            interaction = { type: "idle" };
            activeTool = "select";
            render();
            return;
        }

        if (interaction.type !== "dragging") return;

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
        if (interaction.type === "creating-rect" || interaction.type === "creating-ellipse") {
            const previewId = interaction.previewShapeId;
            
            editorState.scene.nodes = editorState.scene.nodes.filter((node) => {
                return !(node.type === "shape" && node.shape.id === previewId);
            });

            editorState.selectedShapeId = null;
        }

        interaction = { type: "idle" };
        render();
    });

    window.addEventListener("keydown", (event) => {
        const isMac = navigator.userAgent.toUpperCase().includes("MAC");
        const metaOrCtrl = isMac ? event.metaKey : event.ctrlKey;

        if ((event.key === "Backspace" || event.key === "Delete") && editorState.selectedShapeId) {
            event.preventDefault();

            history.execute(
                new DeleteShapeCommand(editorState, editorState.selectedShapeId)
            );

            interaction = { type: "idle" };
            render();
            return;
        }

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