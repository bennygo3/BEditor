import {
    vec2,
    identityTransform,
    createScene,
    createEditorState,
    CommandHistory,
    AddShapeCommand,
    DeleteShapeCommand,
    findShapeById,
    type RectShape,
} from "./engine";

const rectTransform = identityTransform();
rectTransform.position = vec2(100, 50);

const rect: RectShape = {
    type: "rect",
    id: "rect1",
    origin: vec2(0, 0),
    width: 200,
    height: 100,
    transform: rectTransform,
    style: { fill: "#000" },
};

const scene = createScene();
const editorState = createEditorState(scene);
const history = new CommandHistory();

console.log("Initially found:", findShapeById(scene, "rect1"));

history.execute(new AddShapeCommand(editorState, rect));
console.log("After add:", findShapeById(scene, "rect1")?.id ?? null);

history.undo();
console.log("After undo add:", findShapeById(scene, "rect1"));

history.redo();
console.log("After redo add", findShapeById(scene, "rect1")?.id ?? null);

history.execute(new DeleteShapeCommand(editorState, "rect1"));
console.log("After delete:", findShapeById(scene, "rect1")?.id ?? null);

history.undo();
console.log("After undo delete:", findShapeById(scene, "rect1")?.id ?? null);

history.redo();
console.log("After redo delete:", findShapeById(scene, "rect1"));