import Element, { ElementMappable } from "./Element.js";
import lineIntersection from "./line-intersection.js";
import type Line from "./Line.js";

export interface PointParams {
    x: number;
    y: number;
}

export interface PointOptions {
    colour?: string;
    radius?: number;
}

export default class Point extends Element<PointParams | null, PointOptions> {
    constructor(params: ElementMappable<PointParams | null>) {
        super(params);
    }

    draw(ctx: CanvasRenderingContext2D, options: PointOptions): void {
        const params = this.getParams();
        if (!params) return;
        ctx.fillStyle = options.colour ?? "black";
        ctx.beginPath();
        ctx.arc(params.x, params.y, options.radius ?? 5, 0, Math.PI * 2, true);
        ctx.fill();
    }

    static lineIntersection(line1: Line, line2: Line) {
        return new Point(() => lineIntersection(line1.getParams(), line2.getParams()));
    }
}
