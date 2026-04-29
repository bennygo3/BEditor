import type { Vec2 } from "../math/vec2";
import type { Transform } from "../math/transform";

export type Style = {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
};

export type RectShape = {
    type: "rect";
    id: string;
    origin: Vec2; // top-left in local space
    width: number;
    height: number;
    transform: Transform;
    style: Style;
};

export type EllipseShape = {
    type: "ellipse";
    id: string;
    center: Vec2; // center in local space;
    radiusX: number;
    radiusY: number;
    transform: Transform;
    style: Style;
}

export type LineShape = {
    type: "line";
    id: string;
    start: Vec2;
    end: Vec2;
    transform: Transform;
    style: Style;
}

export type Shape = RectShape | EllipseShape | LineShape;