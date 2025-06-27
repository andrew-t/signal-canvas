import Point, { PointOptions, PointParams } from "../Point.js";
import Element, { ElementMappable } from "../Element.js";
import SignalCanvas, { GlobalOptions } from "../../SignalCanvas.js";
import { DraggablePointLocus } from "./loci/types.js";
import InteractiveElement from "./index.js";
import Signal, { NFSignal } from "../../Signal.js";

export interface DraggablePointParams<T> {
    params: T;
    locus: DraggablePointLocus<T>;
}

export interface DraggablePointOptions extends GlobalOptions {
    point?: PointOptions;
    activePoint?: PointOptions;
    hoverPoint?: PointOptions;
}

export default class DraggablePoint<T> extends InteractiveElement<DraggablePointParams<T>, DraggablePointOptions> {
    public readonly point: Point;
    
    protected t: Signal<T>;
    protected locus: Signal<DraggablePointLocus<T>>;
    
    constructor(initialPosition: PointParams, locus: DraggablePointLocus<T>);
    constructor(
        params: T,
        locus: ElementMappable<DraggablePointLocus<T>>
    ) {
        const t = new NFSignal(params);
        const locusSignal = Element.paramsSignalFrom(locus);
        super(() => ({
            params: t.getValue(),
            locus: locusSignal.getValue()
        }), {});
        this.t = t;
        this.locus = locusSignal;

        this.point = new Point(() => {
            const { params, locus } = this.getParams();
            return locus.fromParametricSpace(params);
        })
        .setOptions(() => {
            const { point, activePoint, hoverPoint } = this.getOptions();
            if(this.active.getValue())
                return activePoint ?? hoverPoint ?? { colour: "#08f", radius: 10 };
            if (this.hover.getValue())
                return hoverPoint ?? { colour: "red", radius: 8 };
            return point ?? { colour: "#00f", radius: 6 };
        });

        this.canBeDragged = true;
    }

    draw(canvas: SignalCanvas): void {
        this.point.draw(canvas);
    }

    hoverScore(coords: PointParams): number {
        // TODO: allow custom radius?
        const p = this.point.getParams();
        if (!p) return 0;
        const x = p.x - coords.x;
        const y = p.y - coords.y;
        return 1 - (Math.sqrt(x * x + y * y) / 16);
    }

    dragTo(coords: PointParams): void {
        this.t.setValue(() => this.locus.getValue().toParametricSpace(coords));
    }
}