import { SignalMappable, NFSignal as Signal } from "../Signal.js";
import Element, { ElementMappable } from "./Element.js";
import lineIntersection from "./line-intersection.js";
import type { LineParams } from "./Line.js";

export interface PointParams {
    x: number;
    y: number;
}

export interface PointOptions {
    colour?: string;
    radius?: number;
}

export default class Point extends Element<PointParams | null, PointOptions> {
    constructor(params: ElementMappable<PointParams | null>);
    constructor(x: SignalMappable<number>, y: SignalMappable<number>);
    constructor(a: ElementMappable<PointParams | null> | SignalMappable< number >, b?: SignalMappable<number>) {
        if (b === undefined)
            super(a as ElementMappable<PointParams | null>);
        else
            super(() => ({
                x: Signal.value(a as SignalMappable<number>),
                y: Signal.value(b)
            }));
    }

    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: PointOptions): void {
        const params = this.getParams();
        if (!params) return;
        ctx.fillStyle = options.colour ?? "black";
        ctx.beginPath();
        ctx.arc(params.x, params.y, options.radius ?? 5, 0, Math.PI * 2, true);
        ctx.fill();
    }

    static lineIntersection(
        line1: ElementMappable<LineParams | null>,
        line2: ElementMappable<LineParams | null>
    ) {
        return new Point(() => lineIntersection(
            Element.value(line1),
            Element.value(line2)
        ));
    }
}
