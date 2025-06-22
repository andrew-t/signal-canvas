import Element, { ElementMappable } from "./Element.js";
import type { PointParams } from "./Point.js";

export interface LineParams {
    a: PointParams | null,
    b: PointParams | null
}

export interface LineOptions {
    colour?: string;
    width?: number;
    dashes?: number[];
}

export default class Line extends Element<LineParams | null, LineOptions> {
    constructor(a: ElementMappable<PointParams | null>, b: ElementMappable<PointParams | null>);
    constructor(params: ElementMappable<LineParams | null>);
    constructor(
        a: ElementMappable<LineParams | null> | ElementMappable<PointParams | null>,
        b?: ElementMappable<PointParams | null>
    ) {
        if (b)
            super(() => ({
                a: Element.value(a as ElementMappable<PointParams | null>),
                b: Element.value(b),
            }));
        else super(a as ElementMappable<LineParams | null>);
    }
    
    draw(ctx: CanvasRenderingContext2D, options: LineOptions): void {
        const params = this.getParams();
        if (!params?.a || !params?.b) return;
        ctx.strokeStyle = options.colour ?? "black";
        ctx.lineWidth = options.width ?? 1;
        ctx.setLineDash(options.dashes ?? []);
        ctx.beginPath();
        ctx.moveTo(params.a.x, params.a.y);
        ctx.lineTo(params.b.x, params.b.y);
        ctx.stroke();
    }
}
