import type { Shape, RectShape, EllipseShape, LineShape } from "../engine/geometry/shape";
import { getShapeBoundsWorld } from "../engine/geometry/bounds";
import { getRotateHandleAnchor, getRotateHandlePosition } from "../engine/geometry/rotateHandles";
import { getEllipseHandlePositions } from "../engine/geometry/ellipseHandles";
import { getRectHandlePositions } from "../engine/geometry/rectHandles";
import { applyTransform } from "../engine/math/transform";
import type { Scene } from "../engine/scene/scene";
import type { SceneNode } from "../engine/scene/node";
import type { Vec2 } from "../engine/math/vec2";

export class CanvasRenderer {
    constructor(private ctx: CanvasRenderingContext2D) {}

    renderScene(scene: Scene): void {       // Scene data
        const { canvas } = this.ctx;

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const node of scene.nodes) {
            this.renderNode(node)
        }
    }

    private renderNode(node: SceneNode): void {
        if (node.type === "shape") {
            this.renderShape(node.shape);
            return;
        }

        for (const child of node.children) {
            this.renderNode(child);
        }
    }

    private renderShape(shape: Shape): void {
        if (shape.type === "rect") {
            this.renderRect(shape);
            return;
        }

        if (shape.type === "ellipse") {
            this.renderEllipse(shape);
            return;
        }

        if (shape.type === "line") {
            this.renderLine(shape);
            return;
        }

        // above: shape specific drawing
    }

    private renderRect(shape: RectShape): void {
        const corners = [
            { x: shape.origin.x, y: shape.origin.y },
            { x: shape.origin.x + shape.width, y: shape.origin.y },
            { x: shape.origin.x + shape.width, y: shape.origin.y + shape.height },
            { x: shape.origin.x, y: shape.origin.y + shape.height },
        ].map((p) => applyTransform(p, shape.transform));   // .map transforms each corner into the world space

        this.ctx.beginPath();
        this.ctx.moveTo(corners[0].x, corners[0].y);
        this.ctx.lineTo(corners[1].x, corners[1].y);
        this.ctx.lineTo(corners[2].x, corners[2].y);
        this.ctx.lineTo(corners[3].x, corners[3].y);
        this.ctx.closePath();

        if (shape.style.fill) {
            this.ctx.fillStyle = shape.style.fill;
            this.ctx.fill();
        }

        this.ctx.strokeStyle = shape.style.stroke ?? "#222";
        this.ctx.lineWidth = shape.style.strokeWidth ?? 1;
        this.ctx.stroke();

        // lines are drawn between each corner
    }

    renderRectHandles(shape: RectShape): void {
        const handlesMap = getRectHandlePositions(shape);
        // const bounds = getShapeBoundsWorld(shape);
        
        const handles = [
            handlesMap.nw,
            handlesMap.ne,
            handlesMap.se,
            handlesMap.sw,
        ];

        const size = 8;
        const half = size / 2;
        this.ctx.save();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#16a34a";
        this.ctx.lineWidth = 1.5;

        for (const h of handles) {
            this.ctx.beginPath();
            this.ctx.rect(h.x - half, h.y - half, size, size);
            this.ctx.fill();
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    private renderEllipse(shape: EllipseShape): void {
        const steps = 48;   // ellipse is technically drawn as a many-sided polygon. With 48 steps it looks smooth enough
        const points: Vec2[] = [];

        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const localPoint = {
                x: shape.center.x + Math.cos(t) * shape.radiusX,
                y: shape.center.y + Math.sin(t) * shape.radiusY,

                // cos and sin logic above approximates an ellipse by sampling points aoround a circle/ellipse
            };

            points.push(applyTransform(localPoint, shape.transform));
        }

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        this.ctx.closePath();

        if (shape.style.fill) {
            this.ctx.fillStyle = shape.style.fill;
            this.ctx.fill();
        }

        this.ctx.strokeStyle = shape.style.stroke ?? "#222";
        this.ctx.lineWidth = shape.style.strokeWidth ?? 1;
        this.ctx.stroke();
    }

    private renderLine(shape: LineShape): void {
        const start = applyTransform(shape.start, shape.transform);
        const end = applyTransform(shape.end, shape.transform);

        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);

        this.ctx.strokeStyle = shape.style.stroke ?? "#000";
        this.ctx.lineWidth = shape.style.strokeWidth ?? 2;

        if (shape.style.stroke === "#777777") {
            this.ctx.setLineDash([6, 4]);
        }

        this.ctx.stroke();

        this.ctx.restore();
    }

    renderEllipseHandles(shape: EllipseShape): void {
        const handlesMap = getEllipseHandlePositions(shape);

        const handles = [
            handlesMap.n,
            handlesMap.ne,
            handlesMap.e,
            handlesMap.se,
            handlesMap.s,
            handlesMap.sw,
            handlesMap.w,
            handlesMap.nw,
        ];

        const size = 8;
        const half = size / 2;

        this.ctx.save();
        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#16a34a";
        this.ctx.lineWidth = 1.5;

        for (const h of handles) {
            this.ctx.beginPath();
            this.ctx.rect(h.x - half, h.y - half, size, size);
            this.ctx.fill();
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    renderBounds(shape: Shape, options?: { color?: string }): void {
        const bounds = getShapeBoundsWorld(shape);    // draws the dashed selection box. bounds are calculated by the engine, then drawn by the renderer. 

        this.ctx.save();
        this.ctx.strokeStyle = options?.color ?? "#00aaff";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([6, 4]);
        this.ctx.strokeRect(
            bounds.min.x,
            bounds.min.y,
            bounds.max.x - bounds.min.x,
            bounds.max.y - bounds.min.y
        );
        this.ctx.restore();
    }

    renderRotateHandle(shape: Shape): void {
        const anchor = getRotateHandleAnchor(shape);
        const handle = getRotateHandlePosition(shape);

        this.ctx.save();

        this.ctx.strokeStyle = "#16a34a";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(anchor.x, anchor.y);
        this.ctx.lineTo(handle.x, handle.y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }
    // renderRact/renderEllipse = pixels on canvas - actual artwork

    // renderRectHandles(), renderEllipseHandles(), renderRotateHandle(), renderBounds(): these methods draw editor UI, not the actual shapes - editor UI overlay
}