import Element, { ElementMappable, setSvgAttr, setSvgStyles } from "./Element";
import type { PointParams } from "./Point";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type SignalCanvasVector from "../SignalCanvasVector";
import type { GlobalOptions, SignalCanvasDimensions } from "../SignalCanvas";

export interface LineParams {
    a: PointParams | null,
    b: PointParams | null
}

export interface LineDrawingOptions extends GlobalOptions {
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
        b?: ElementMappable<PointParams | null> | ElementMappable<LineOptions>
    ) {
        if (b)
            super(
                () => ({
                    a: Element.value(a as ElementMappable<PointParams | null>),
                    b: Element.value(b as ElementMappable<PointParams | null>),
                }),
                {}
            );
        else super(
            a as ElementMappable<LineParams | null>,
            {}
        );
    }

    static applyLineOptions(ctx: CanvasRenderingContext2D, options: LineDrawingOptions = {}) {
        ctx.strokeStyle = options.colour ?? "black";
        ctx.lineWidth = options.width ?? 1;
        ctx.setLineDash(options.dashes ?? []);
    }
    
    private trueEnds(dim: SignalCanvasDimensions) {
        const params = this.getParams();
        const options = this.getOptions();
        if (!params?.a || !params?.b) return null;
        if (params.a.x == params.b.x && params.a.y == params.b.y) return null;
        let start = params.a;
        let end = params.b;
        if (options.extendPastA || options.extendPastB) {
            const diff = normalisedDiff(start, end);
            const sizeFactor = dim.width + dim.height;
            if (options.extendPastA) {
                const t = tParam(dim, diff, start);
                if (t > -sizeFactor) {
                    const extra = t + sizeFactor;
                    start = { x: start.x - diff.x * extra, y: start.y - diff.y * extra };
                }
            }
            if (options.extendPastB) {
                const t = tParam(dim, diff, end);
                if (t < sizeFactor) {
                    const extra = sizeFactor - t;
                    end = { x: end.x + diff.x * extra, y: end.y + diff.y * extra };
                }
            }
        }
        return { start, end };
    }

    draw({ ctx, dimensions }: SignalCanvasRaster): void {
        const dim = dimensions.getValue();
        const ends = this.trueEnds(dim);
        if (!ends) return;
        const options = this.getOptions();
        Line.applyLineOptions(ctx, options);
        ctx.beginPath();
        ctx.moveTo(ends.start.x, ends.start.y);
        ctx.lineTo(ends.end.x, ends.end.y);
        ctx.stroke();
    }
    
    tagName = "path";
    updateSvg({ dimensions }: SignalCanvasVector): void {
        const dim = dimensions.getValue();
        const ends = this.trueEnds(dim);
        if (!ends) return;
        setSvgAttr(this.svgNode, "d",
            `M ${ends.start.x} ${ends.start.y}
             L ${ends.end.x} ${ends.end.y}`
        );
        setSvgStyles(this.svgNode, Line.svgStyles(this.getOptions()));
    }
    static svgStyles({ width, colour, dashes }: LineDrawingOptions) {
        return {
            "stroke": colour ?? "black",
            "stroke-width": `${width ?? 1}px`,
            "stroke-dasharray": dashes?.map(d => `${d}px`).join(" ") ?? ""
        };
    }
}

function tParam(
    { width, height }: SignalCanvasDimensions,
    direction: PointParams,
    point: PointParams
) {
    const centreToPoint = { x: point.x - width / 2, y: point.y - height / 2 };
    return centreToPoint.x * direction.x + centreToPoint.y * direction.y;
}

function normalisedDiff(a: PointParams, b: PointParams): PointParams {
    const len = Math.sqrt(a.x * a.x + b.x * b.x);
    return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
}
