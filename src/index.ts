import {
    vec2,
    identityTransform,
    getShapeBoundsWorld,
    isPointInBounds,
    type RectShape,
} from "./engine";

const t = identityTransform();
t.position = vec2(100, 50);
t.rotation = Math.PI / 6; // = 30 degrees

const rect: RectShape = {
    type: "rect",
    id: "rect1",
    origin: vec2(0, 0),
    width: 200,
    height: 100,
    transform: t,
    style: { fill: "#000" },
};

const bounds = getShapeBoundsWorld(rect);

console.log("Bounds min:", bounds.min);
console.log("Bounds max:", bounds.max);

const insidePoint = vec2(150, 100);
const outsidePoint = vec2(20, 20);

console.log("Inside point hit:", isPointInBounds(insidePoint, rect));
console.log("Outside point hit:", isPointInBounds(outsidePoint, rect));


