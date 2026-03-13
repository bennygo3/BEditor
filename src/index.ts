import {
    vec2,
    identityTransform,
    createScene,
    createEditorState,
    CommandHistory,
    MoveShapeCommand,
    findShapeById,
    getShapeBoundsWorld,
    type RectShape,
} from "./engine";

const rectTransform = identityTransform();
rectTransform.position = vec2(100, 50);

// const ellipseTransform = identityTransform();
// ellipseTransform.position = vec2(120, 70);

const rect: RectShape = {
    type: "rect",
    id: "rect1",
    origin: vec2(0, 0),
    width: 200,
    height: 100,
    transform: rectTransform,
    style: { fill: "#000" },
};

// const ellipse: EllipseShape = {
//     type: "ellipse",
//     id: "ellipse1",
//     center: vec2(50, 50),
//     radiusX: 60,
//     radiusY: 40,
//     transform: ellipseTransform,
//     style: { fill: "#f00" },
// }

const scene = createScene();
scene.nodes.push(
    { type: "shape", shape: rect }
    // { type: "shape", shape: ellipse }
);

const editorState = createEditorState(scene);
const history = new CommandHistory();

const before = findShapeById(scene, "rect1");
if (!before) {
    throw new Error("rect1 not found before move");
}

console.log("Before move position:", before.transform.position);
console.log("Before move bounds:", getShapeBoundsWorld(before));

history.execute(
    new MoveShapeCommand(editorState, "rect1", vec2(40, 25))
);

const afterMove = findShapeById(scene, "rect1");
if (!afterMove) {
    throw new Error("rect1 not found after move");
}

console.log("After move position:", afterMove.transform.position);
console.log("After move bounds:", getShapeBoundsWorld(afterMove));

history.undo();

const afterUndo = findShapeById(scene, "rect1");
if (!afterUndo) {
    throw new Error("rect1 not found after undo");
}

console.log("After undo position:", afterUndo.transform.position);
console.log("After undo bounds:", getShapeBoundsWorld(afterUndo));

history.redo();

const afterRedo = findShapeById(scene, "rect1");
if (!afterRedo) {
    throw new Error("rect1 not found after redo");
}

console.log("After redo position:", afterRedo.transform.position);
console.log("After redo bounds:", getShapeBoundsWorld(afterRedo));