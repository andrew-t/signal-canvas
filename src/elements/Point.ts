import { SignalMappable, NFSignal as Signal } from "../Signal.js";
import Element, { ElementMappable } from "./Element.js";
import lineIntersection from "./line-intersection.js";
import type { LineParams } from "./Line.js";
import type SignalCanvas from "../SignalCanvas.js";
import { GlobalOptions } from "../SignalCanvas.js";

export interface PointParams {
    x: number;
    y: number;
}

export interface PointOptions extends GlobalOptions {
    // TODO: support other markers, like unfilled circles, squares, crosses, plusses, etc
    colour?: string;
    radius?: number;
}

export default class Point extends Element<PointParams | null, PointOptions> {
    constructor(params: ElementMappable<PointParams | null>);
    constructor(x: SignalMappable<number>, y: SignalMappable<number>);
    constructor(
        a: ElementMappable<PointParams | null> | SignalMappable< number >,
        b?: SignalMappable<number>
    ) {
        if (b === undefined)
            super(
                a as ElementMappable<PointParams | null>,
                {}
            );
        else
            super(
                () => ({
                    x: Signal.value(a as SignalMappable<number>),
                    y: Signal.value(b as SignalMappable<number>)
                }),
                {}
            );
    }

    draw({ ctx }: SignalCanvas): void {
        const params = this.getParams();
        if (!params) return;
        const options = this.getOptions();
        ctx.fillStyle = options.colour ?? "black";
        ctx.beginPath();
        ctx.arc(params.x, params.y, options.radius ?? 4, 0, Math.PI * 2, true);
        ctx.fill();
    }

    add(diff: ElementMappable<PointParams | null>) {
        return new Point(() => {
            const i = this.getParams();
            const d = Element.value(diff);
            if (!d || !i) return null;
            return { x: i.x + d.x, y: i.y + d.y };
        }).setOptions(() => this.getOptions());
    }

    distanceTo(other: ElementMappable<PointParams | null>) {
        return new Signal<number | null>(() => {
            const i = this.getParams();
            const o = Element.value(other);
            if (!o || !i) return null;
            return Math.sqrt((i.x - o.x) ** 2 + (i.y - o.y) ** 2);
        });
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
