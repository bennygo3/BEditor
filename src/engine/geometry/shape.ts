import type { Vec2 } from "../math/vec2";
import type { Transform } from "../math/transform";
import type { BezierPath } from "./path";

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

export type ImageShape = {
    type: "image";
    id: string;
    origin: Vec2;
    width: number;
    height: number;
    src: string;
    transform: Transform;
    opacity: number;
    mask?: ImageMask;
}

export type BrushShape = {
    type: "brush";
    id: string;
    path: BezierPath;
    transform: Transform;
    style: Style;
}

export type ImageMask = {
    path: BezierPath;
    inverted: boolean;
};



export type Shape = RectShape | EllipseShape | LineShape | ImageShape | BrushShape;