import Element, { setSvgAttr, setSvgStyles } from "./Element";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type SignalCanvasVector from "../SignalCanvasVector";
import type { GlobalOptions, SignalCanvasDimensions } from "../SignalCanvas";
import { directionTo, type Vector } from "../utils/Vector";
import { OptionalExceptSourceMap, SignalMap } from "../SignalGroup";

export interface LineOptions extends GlobalOptions {
    a: Vector | null,
    b: Vector | null
    colour: string;
    width: number;
    dashes: number[] | null;
    extendPastA: boolean;
    extendPastB: boolean;
    // TODO: support arrowheads
}

export default class Line extends Element<LineOptions> {
    constructor(params: OptionalExceptSourceMap<LineOptions, "a" | "b">) {
        super({
            colour: "black",
            width: 1,
            dashes: null,
            extendPastA: false,
            extendPastB: false,
            ...params
        });
    }
    
    private trueEnds(dim: SignalCanvasDimensions) {
        const a = this.params.a.getValue();
        const b = this.params.b.getValue();
        if (!a || !b) return null;
        if (a.x == b.x && a.y == b.y) return null;
        const extendPastA = this.params.extendPastA.getValue();
        const extendPastB = this.params.extendPastB.getValue();
        let start = a;
        let end = b;
        if (extendPastA || extendPastB) {
            const diff = directionTo(start, end)();
            const sizeFactor = dim.width + dim.height;
            if (extendPastA) {
                const t = tParam(dim, diff, start);
                if (t > -sizeFactor) {
                    const extra = t + sizeFactor;
                    start = { x: start.x - diff.x * extra, y: start.y - diff.y * extra };
                }
            }
            if (extendPastB) {
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
        ctx.strokeStyle = this.params.colour.getValue();
        ctx.lineWidth = this.params.width.getValue();
        ctx.setLineDash(this.params.dashes.getValue() ?? []);
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
        setSvgStyles(this.svgNode, {
            "stroke": this.params.colour.getValue(),
            "stroke-width": `${this.params.width.getValue()}px`,
            "stroke-dasharray": this.params.dashes.getValue()?.map(d => `${d}px`).join(" ") ?? ""
        });
    }
}

function tParam(
    { width, height }: SignalCanvasDimensions,
    direction: Vector,
    point: Vector
) {
    const centreToPoint = { x: point.x - width / 2, y: point.y - height / 2 };
    return centreToPoint.x * direction.x + centreToPoint.y * direction.y;
}
