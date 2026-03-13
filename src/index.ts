import {
    vec2,
    identityTransform,
    createScene,
    createEditorState,
    CommandHistory,
    SelectShapeCommand,
    findTopmostShapeAtPoint,
    type RectShape,
    type EllipseShape,
} from "./engine";

const rectTransform = identityTransform();
rectTransform.position = vec2(100, 50);

const ellipseTransform = identityTransform();
ellipseTransform.position = vec2(120, 70);

const rect: RectShape = {
    type: "rect",
    id: "rect1",
    origin: vec2(0, 0),
    width: 200,
    height: 100,
    transform: rectTransform,
    style: { fill: "#000" },
};

const ellipse: EllipseShape = {
    type: "ellipse",
    id: "ellipse1",
    center: vec2(50, 50),
    radiusX: 60,
    radiusY: 40,
    transform: ellipseTransform,
    style: { fill: "#f00" },
}

const scene = createScene();
scene.nodes.push(
    { type: "shape", shape: rect },
    { type: "shape", shape: ellipse }
);

const editorState = createEditorState(scene);
const history = new CommandHistory();

const clickedShape = findTopmostShapeAtPoint(vec2(180, 140), scene);

console.log("Before selection:", editorState.selectedShapeId);

history.execute(
    new SelectShapeCommand(editorState, clickedShape ? clickedShape.id : null)
);
console.log("After selection:", editorState.selectedShapeId);

history.undo();
console.log("After undo:", editorState.selectedShapeId);

history.redo();
console.log("After redo:", editorState.selectedShapeId);



