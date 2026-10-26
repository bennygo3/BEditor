import type { Shape } from "../geometry/shape";

export type ShapeNode = {
    type: "shape";
    shape: Shape;
};

export type GroupNode = {
    type: "group";
    id: string;
    children: SceneNode[];
}

export type SceneNode =
    | ShapeNode
    | GroupNode;