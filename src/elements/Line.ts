import Element, { ElementMappable } from "./Element.js";
import type { PointParams } from "./Point.js";

export interface LineParams {
    a: PointParams | null,
    b: PointParams | null
}

export interface LineDrawingOptions {
    colour?: string;
    width?: number;
    dashes?: number[];
}

export interface LineOptions extends LineDrawingOptions {
    extendPastA?: boolean;
    extendPastB?: boolean;
    // TODO: support arrowheads
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

    static applyLineOptions(ctx: CanvasRenderingContext2D, options: LineDrawingOptions = {}) {
        ctx.strokeStyle = options.colour ?? "black";
        ctx.lineWidth = options.width ?? 1;
        ctx.setLineDash(options.dashes ?? []);
    }
    
    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: LineOptions): void {
        const params = this.getParams();
        if (!params?.a || !params?.b) return;
        if (params.a.x == params.b.x && params.a.y == params.b.y) return;
        Line.applyLineOptions(ctx, options);
        ctx.beginPath();
        let start = params.a;
        let end = params.b;
        if (options.extendPastA || options.extendPastB) {
            const diff = normalisedDiff(start, end);
            const sizeFactor = canvas.width + canvas.height;
            if (options.extendPastA) {
                const t = tParam(canvas, diff, start);
                if (t > -sizeFactor) {
                    const extra = t + sizeFactor;
                    start = { x: start.x - diff.x * extra, y: start.y - diff.y * extra };
                }
            }
            if (options.extendPastB) {
                const t = tParam(canvas, diff, end);
                if (t < sizeFactor) {
                    const extra = sizeFactor - t;
                    end = { x: end.x + diff.x * extra, y: end.y + diff.y * extra };
                }
            }
        }
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}

function tParam(canvas: HTMLCanvasElement, direction: PointParams, point: PointParams) {
    const centreToPoint = { x: point.x - canvas.width / 2, y: point.y - canvas.height / 2 };
    return centreToPoint.x * direction.x + centreToPoint.y * direction.y;
}

function normalisedDiff(a: PointParams, b: PointParams): PointParams {
    const len = Math.sqrt(a.x * a.x + b.x * b.x);
    return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
}
