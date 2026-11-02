import type { BrushShape } from "./shape";
import type { Vec2 } from "../math/vec2";
import { getBezierPathLocalBounds, getBezierPathLocalCenter, type PathLocalBounds } from "./pathGeometry";

export type BrushLocalBounds = PathLocalBounds;

export function getBrushLocalBounds(shape: BrushShape): BrushLocalBounds {
    return getBezierPathLocalBounds(shape.path);
}

export function getBrushLocalCenter(shape: BrushShape): Vec2 {
    return getBezierPathLocalCenter(shape.path);
}

     
