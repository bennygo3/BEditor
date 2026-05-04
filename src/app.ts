import {
    vec2,
    identityTransform,
    createScene,
    createEditorState,
    findTopmostShapeAtPoint,
    findShapeById,
    CommandHistory,
    SelectShapeCommand,
    // MoveShapeCommand,
    MoveShapesCommand,
    hitTestRectHandle,
    hitTestLineHandle,
    ResizeLineCommand,
    ResizeRectCommand,
    ResizeEllipseCommand,
    serializeScene,
    deserializeScene,
    sceneToSvg,
    AddShapeCommand,
    generateId,
    DeleteShapeCommand,
    hitTestEllipseHandle,
    type RectShape,
    type EllipseShape,
    type LineShape,
    type InteractionMode,
    type Tool,
    getShapesCenterWorld,
    setShapeRotationCenter,
    hitTestRotateHandle,
    RotateShapeCommand,
    applyInverseTransform,
    getShapeBoundsWorld,
    boundsIntersect,
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
): EllipseShape {
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

function makeBoundsFromPoints(a: { x: number; y: number }, b: { x: number; y: number }) {
    return {
        min: {
            x: Math.min(a.x, b.x),
            y: Math.min(a.y, b.y),
        },
        max: {
            x: Math.max(a.x, b.x),
            y: Math.max(a.y, b.y),
        },
    };
}

function makeLineFromDrag(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    id: string,
    preview = false
): LineShape {
    return {
        type: "line",
        id,
        start: vec2(startPoint.x, startPoint.y),
        end: vec2(endPoint.x, endPoint.y),
        transform: identityTransform(),
        style: {
            stroke: preview ? "#7777" : "#000000",
            strokeWidth: preview ? 1 : 2,
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

    const scene = buildDemoScene();
    const editorState = createEditorState(scene);
    const history = new CommandHistory();
    const renderer = new CanvasRenderer(ctx);

    let activeTool: Tool = "select";

    const saveButton = document.getElementById("save-scene") as HTMLButtonElement | null;
    const loadButton = document.getElementById("load-scene") as HTMLButtonElement | null;
    const exportButton = document.getElementById("export-svg") as HTMLButtonElement | null;
    const selectToolButton = document.getElementById("tool-select") as HTMLButtonElement | null;
    const multiSelectToolButton = document.getElementById("multi-select") as HTMLButtonElement | null;
    const rectToolButton = document.getElementById("rect-tool") as HTMLButtonElement | null;
    const ellipseToolButton = document.getElementById("ellipse-tool") as HTMLButtonElement | null;
    const lineToolButton = document.getElementById("line-tool") as HTMLButtonElement | null;

    if (!saveButton || !loadButton || !exportButton || !selectToolButton || !multiSelectToolButton || !rectToolButton || !ellipseToolButton || !lineToolButton) {
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

    multiSelectToolButton.addEventListener("click", () => {
        activeTool = "multi-select";
        console.log("Active tool: multi-select");
    });

    rectToolButton.addEventListener("click", () => {
        activeTool = "rect";
        console.log("Active tool: rect");
    });

    ellipseToolButton.addEventListener("click", () => {
        activeTool = "ellipse";
        console.log("Active tool: ellipse");
    });

    lineToolButton.addEventListener("click", () => {
        activeTool = "line";
        console.log("Active tool: line")
    })

    let interaction: InteractionMode = { type: "idle" };

    function render(): void {
        renderer.renderScene(editorState.scene);

        // Multi-selected shapes
        for (const selectedId of editorState.selectedShapeIds) {
            if (selectedId === editorState.selectedShapeId) continue;

            const shape = findShapeById(editorState.scene, selectedId);

            if (shape) {
                renderer.renderBounds(shape, { color: "rgb(22, 163, 74)" });
            }
        }

        // Primary selected shape
        if (editorState.selectedShapeId) {
            const shape = findShapeById(
                editorState.scene,
                editorState.selectedShapeId
            );

            if (shape) {
                renderer.renderBounds(shape, { color: "#16a34a" });
                renderer.renderRotateHandle(shape);

                if (shape.type === "rect") {
                    renderer.renderRectHandles(shape);
                }

                if (shape.type === "ellipse") {
                    renderer.renderEllipseHandles(shape);
                }

                if (shape.type === "line") {
                    renderer.renderLineHandles(shape);
                }
            }
        }

        if (
            editorState.hoveredShapeId &&
            editorState.hoveredShapeId !== editorState.selectedShapeId
        ) {
            const hoveredShape = findShapeById(
                editorState.scene, editorState.hoveredShapeId
            );

            if (hoveredShape) {
                renderer.renderBounds(hoveredShape, { color: "#94a3b8" })
            }
        }

        if (interaction.type === "marquee-selecting") {
            const marqueeBounds = makeBoundsFromPoints(
                interaction.startPoint,
                interaction.currentPoint
            );

            renderer.renderMarquee(marqueeBounds);
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
            editorState.scene.nodes.push({ type: "shape", shape: previewEllipse });
            interaction = {
                type: "creating-ellipse",
                startPoint: point,
                previewShapeId,
            };

            render();
            return;
        }

        if (activeTool === "line") {
            const previewShapeId = generateId("line");

            const previewLine = makeLineFromDrag(point, point, previewShapeId, true);
            editorState.scene.nodes.push({ type: "shape", shape: previewLine });

            editorState.selectedShapeId = previewShapeId;
            interaction = {
                type: "creating-line",
                startPoint: point,
                previewShapeId,
            };

            render();
            return;
        }

        if (editorState.selectedShapeId) {
            const selectedShape = findShapeById(editorState.scene, editorState.selectedShapeId);

            if (selectedShape && hitTestRotateHandle(point, selectedShape)) {
                const fixedWorldCenter = getShapesCenterWorld(selectedShape);
                const startPointerAngle = Math.atan2(point.y - fixedWorldCenter.y, point.x - fixedWorldCenter.x);

                interaction = {
                    type: "rotating",
                    shapeId: selectedShape.id,
                    fixedWorldCenter,
                    startPointerAngle,
                    startRotation: selectedShape.transform.rotation,
                };

                render();
                return;
            }
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
                        startLeft: selectedShape.origin.x,
                        startTop: selectedShape.origin.y,
                        startRight: selectedShape.origin.x + selectedShape.width,
                        startBottom: selectedShape.origin.y + selectedShape.height,
                    };

                    render();
                    return;
                }
            }

            if (selectedShape && selectedShape.type === "ellipse") {
                const handle = hitTestEllipseHandle(point, selectedShape);

                if (handle) {
                    interaction = {
                        type: "resizing-ellipse",
                        shapeId: selectedShape.id,
                        handle,
                        startPointer: point,
                        startCenter: { ...selectedShape.center },
                        startRadiusX: selectedShape.radiusX,
                        startRadiusY: selectedShape.radiusY,
                    };

                    render();
                    return;
                }
            }

            if (selectedShape && selectedShape.type === "line") {
                const handle = hitTestLineHandle(point, selectedShape);

                if (handle) {
                    interaction = {
                        type: "resizing-line",
                        shapeId: selectedShape.id,
                        handle,
                        startStart: { ...selectedShape.start },
                        startEnd: { ...selectedShape.end },
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

        if (hit && activeTool === "multi-select") {
            if (editorState.selectedShapeIds.includes(hit.id)) {
                editorState.selectedShapeIds = editorState.selectedShapeIds.filter(
                    (id) => id !== hit.id
                );
            } else {
                editorState.selectedShapeIds = [
                    ...editorState.selectedShapeIds,
                    hit.id
                ];
            }

            editorState.selectedShapeId =
            editorState.selectedShapeIds.length === 1
                ? editorState.selectedShapeIds[0]
                : null;
            
            interaction = { type: "idle" };
            render();
            return;
        }

        if (hit) {

            if (!editorState.selectedShapeIds.includes(hit.id)) {
                editorState.selectedShapeIds = [hit.id];
                editorState.selectedShapeId = hit.id;
            }

            const shapeIds = 
            editorState.selectedShapeIds.length > 0 &&
            editorState.selectedShapeIds.includes(hit.id)
                ? editorState.selectedShapeIds
                : [hit.id];

            interaction = {
                type: "dragging",
                shapeIds,
                dragStart: point,
                lastPointer: point,
            };
        } else {
            editorState.selectedShapeId = null;
            editorState.selectedShapeIds = [];

            interaction = {
                type: "marquee-selecting",
                startPoint: point,
                currentPoint: point,
            };
        }

        render();
    });

    canvas.addEventListener("mousemove", (event) => {

        const rect = canvas.getBoundingClientRect();

        const point = vec2(
            event.clientX - rect.left,
            event.clientY - rect.top
        );

        if (interaction.type === "dragging") {
            canvas.style.cursor = "grabbing";
        }

        if (interaction.type === "rotating") {
            canvas.style.cursor = "grabbing";
        }

        if (interaction.type === "idle") {
            const hit = findTopmostShapeAtPoint(point, editorState.scene);
            editorState.hoveredShapeId = hit ? hit.id : null;

            canvas.style.cursor = hit ? "move" : "default";

            if (editorState.selectedShapeId) {
                const selectedShape = findShapeById(editorState.scene, editorState.selectedShapeId);

                if (selectedShape) {
                    if (hitTestRotateHandle(point, selectedShape)) {
                        canvas.style.cursor = "grab";
                    }

                    if (selectedShape.type === "rect" && hitTestRectHandle(point, selectedShape)) {
                        canvas.style.cursor = "nwse-resize";
                    }

                    if (selectedShape.type === "ellipse" && hitTestEllipseHandle(point, selectedShape)) {
                        canvas.style.cursor = "crosshair";
                    }

                    if (selectedShape.type === "line" && hitTestLineHandle(point, selectedShape)) {
                        canvas.style.cursor = "pointer";
                    }
                }
            }

            render();
        }

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

            const localPoint = applyInverseTransform(point, shape.transform);

            let left = interaction.startLeft;
            let top = interaction.startTop;
            let right = interaction.startRight;
            let bottom = interaction.startBottom;

            if (interaction.handle === "se") {
                right = localPoint.x;
                bottom = localPoint.y;
            } else if (interaction.handle === "sw") {
                left = localPoint.x;
                bottom = localPoint.y;
            } else if (interaction.handle === "ne") {
                right = localPoint.x;
                top = localPoint.y
            } else if (interaction.handle === "nw") {
                left = localPoint.x;
                top = localPoint.y;
            }

            const minSize = 10;

            if (right - left < minSize) {
                if (interaction.handle === "sw" || interaction.handle === "nw") {
                    left = right - minSize;
                } else {
                    right = left + minSize;
                }
            }

            if (bottom - top < minSize) {
                if (interaction.handle === "nw" || interaction.handle === "ne") {
                    top = bottom - minSize;
                } else {
                    bottom = top + minSize;
                }
            }

            shape.origin = { x: left, y: top };
            shape.width = right - left;
            shape.height = bottom - top;

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

        if (interaction.type === "resizing-ellipse") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);
            if (!shape || shape.type !== "ellipse") return;

            const localPoint = applyInverseTransform(point, shape.transform);
            const minRadius = 5;

            let newRadiusX = interaction.startRadiusX;
            let newRadiusY = interaction.startRadiusY;

            if (interaction.handle === "e") {
                newRadiusX = Math.max(minRadius, localPoint.x - interaction.startCenter.x);
            } else if (interaction.handle === "w") {
                newRadiusX = Math.max(minRadius, interaction.startCenter.x - localPoint.x);
            } else if (interaction.handle === "s") {
                newRadiusY = Math.max(minRadius, localPoint.y - interaction.startCenter.y);
            } else if (interaction.handle === 'n') {
                newRadiusY = Math.max(minRadius, interaction.startCenter.y - localPoint.y);
            } else if (interaction.handle === "se") {
                newRadiusX = Math.max(minRadius, localPoint.x - interaction.startCenter.x);
                newRadiusY = Math.max(minRadius, localPoint.y - interaction.startCenter.y);
            } else if (interaction.handle === "sw") {
                newRadiusX = Math.max(minRadius, interaction.startCenter.x - localPoint.x);
                newRadiusY = Math.max(minRadius, localPoint.y - interaction.startCenter.y);
            } else if (interaction.handle === "ne") {
                newRadiusX = Math.max(minRadius, localPoint.x - interaction.startCenter.x);
                newRadiusY = Math.max(minRadius, interaction.startCenter.y - localPoint.y);
            } else if (interaction.handle === "nw") {
                newRadiusX = Math.max(minRadius, interaction.startCenter.x - localPoint.x);
                newRadiusY = Math.max(minRadius, interaction.startCenter.y - localPoint.y);
            }

            shape.center = { ...interaction.startCenter };
            shape.radiusX = newRadiusX;
            shape.radiusY = newRadiusY;

            render();
            return;
        }

        if (interaction.type === "creating-line") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);

            if (!shape || shape.type !== "line") return;

            const preview = makeLineFromDrag(
                interaction.startPoint,
                point,
                interaction.previewShapeId,
                true
            );

            shape.start = preview.start;
            shape.end = preview.end;

            render();
            return;
        }

        if (interaction.type === "resizing-line") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);
            if (!shape || shape.type !== "line") return;

            // allows resizing to work correctly even if the line has been rotated:
            const localPoint = applyInverseTransform(point, shape.transform);

            if (interaction.handle === "start") {
                shape.start = localPoint;
            } else {
                shape.end = localPoint;
            }

            render();
            return;
        }

        if (interaction.type === "marquee-selecting") {
            interaction = {
                ...interaction,
                currentPoint: point,
            };

            render();
            return;
        }

        if (interaction.type === "rotating") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);
            if (!shape) return;

            const currentAngle = Math.atan2(
                point.y - interaction.fixedWorldCenter.y,
                point.x - interaction.fixedWorldCenter.x
            );

            const delta = currentAngle - interaction.startPointerAngle;
            const newRotation = interaction.startRotation + delta;
            // shape.transform.rotation = interaction.startRotation + delta;

            setShapeRotationCenter(
                shape,
                newRotation,
                interaction.fixedWorldCenter
            );

            render();
            return;
        }

        if (interaction.type !== "dragging") return;

        const dx = point.x - interaction.lastPointer.x;
        const dy = point.y - interaction.lastPointer.y;

        for (const id of interaction.shapeIds) {
            const shape = findShapeById(editorState.scene, id);
            if (!shape) continue;

            shape.transform.position.x += dx;
            shape.transform.position.y += dy;
        }

        // const shape = findShapeById(
        //     editorState.scene,
        //     interaction.shapeId
        // );

        // if (!shape) return;

        // live preview movement (Not a command yet)
        // shape.transform.position.x += dx;
        // shape.transform.position.y += dy;

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

        if (interaction.type === "marquee-selecting") {
            const marqueeBounds = makeBoundsFromPoints(
                interaction.startPoint,
                interaction.currentPoint
            );

            const selectedIds: string[] = [];

            for (const node of editorState.scene.nodes) {
                if (node.type !== "shape") continue;

                const shapeBounds = getShapeBoundsWorld(node.shape);

                if (boundsIntersect(marqueeBounds, shapeBounds)) {
                    selectedIds.push(node.shape.id);
                }
            }

            editorState.selectedShapeIds = selectedIds;
            editorState.selectedShapeId = selectedIds.length === 1 ? selectedIds[0] : null;

            interaction = { type: "idle" };
            render();
            return;
        }

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
                        {
                            x: interaction.startLeft,
                            y: interaction.startTop,
                        },
                        interaction.startRight - interaction.startLeft,
                        interaction.startBottom - interaction.startTop,
                        { ...shape.origin },
                        shape.width,
                        shape.height
                    )
                );
            }

            interaction = { type: "idle" };
            render();
            return;
        }

        if (interaction.type === "creating-ellipse") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);
            const previewId = interaction.previewShapeId;

            if (shape && shape.type === "ellipse") {
                const finalEllipse = {
                    ...shape,
                    style: {
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

        if (interaction.type === "resizing-ellipse") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);
            if (shape && shape.type === "ellipse") {
                history.execute(
                    new ResizeEllipseCommand(
                        editorState,
                        interaction.shapeId,
                        interaction.startCenter,
                        interaction.startRadiusX,
                        interaction.startRadiusY,
                        { ...shape.center },
                        shape.radiusX,
                        shape.radiusY
                    )
                );
            }

            interaction = { type: "idle" };
            render();
            return;
        }

        if (interaction.type === "creating-line") {
            const shape = findShapeById(editorState.scene, interaction.previewShapeId);
            const previewId = interaction.previewShapeId;

            if (shape && shape.type === "line") {
                const drawnLine = makeLineFromDrag(
                    shape.start,
                    shape.end,
                    shape.id,
                    false
                );

                editorState.scene.nodes = editorState.scene.nodes.filter((node) => {
                    return !(node.type === "shape" && node.shape.id === previewId);
                });

                const dx = drawnLine.end.x - drawnLine.start.x;
                const dy = drawnLine.end.y - drawnLine.start.y;
                const length = Math.hypot(dx, dy);

                if (length > 2) {
                    history.execute(new AddShapeCommand(editorState, drawnLine));
                    editorState.selectedShapeId = drawnLine.id;
                } else {
                    editorState.selectedShapeId = null;
                }
            }

            interaction = { type: "idle" };
            activeTool = "select";
            render();
            return;
        }

        if (interaction.type === "resizing-line") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);

            if (shape && shape.type === "line") {
                history.execute(
                    new ResizeLineCommand(
                        editorState,
                        interaction.shapeId,
                        interaction.startStart,
                        interaction.startEnd,
                        { ...shape.start },
                        { ...shape.end }
                    )
                );
            }

            interaction = { type: "idle" };
            render();
            return;
        }

        if (interaction.type === "rotating") {
            const shape = findShapeById(editorState.scene, interaction.shapeId);

            if (shape) {
                history.execute(
                    new RotateShapeCommand(
                        editorState,
                        interaction.shapeId,
                        interaction.startRotation,
                        shape.transform.rotation
                    )
                );
            }

            interaction = { type: "idle" };
            render();
            return;
        }

        if (interaction.type !== "dragging") return;

        const totalDelta = vec2(
            point.x - interaction.dragStart.x,
            point.y - interaction.dragStart.y
        );

        for (const id of interaction.shapeIds) {
            const shape = findShapeById(editorState.scene, id);

            if (!shape) continue;

            shape.transform.position.x -= totalDelta.x;
            shape.transform.position.y -= totalDelta.y;
        }

        // revert the preview movement
        // const shape = findShapeById(
        //     editorState.scene,
        //     interaction.shapeIds
        // );

        // if (shape) {
        //     shape.transform.position.x -= totalDelta.x;
        //     shape.transform.position.y -= totalDelta.y;
        // }

        // commit as a command
        history.execute(
            new MoveShapesCommand(
                editorState,
                interaction.shapeIds,
                totalDelta
            )
        );

        interaction = { type: "idle" };

        render();
    });

    canvas.addEventListener("mouseleave", () => {
        if (interaction.type === "creating-rect" ||
            interaction.type === "creating-ellipse" ||
            interaction.type === "creating-line"
        ) {
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