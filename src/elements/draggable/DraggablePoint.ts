import Point from "../Point.js";
import { setSvgAttr, setSvgStyles } from "../Element.js";
import { GlobalOptions } from "../../SignalCanvas.js";
import { DraggablePointLocus } from "./loci/types.js";
import InteractiveElement from "./index.js";
import type SignalCanvasRaster from "../../SignalCanvasRaster.js";
import type SignalCanvasVector from "../../SignalCanvasVector.js";
import { OptionalExceptSourceMap } from "../../SignalGroup.js";
import { Vector } from "../../utils/Vector.js";

export interface DraggablePointOptions<T> extends GlobalOptions {
    params: T;
    locus: DraggablePointLocus<T>;
    colour: string;
    size: number;
    activeColour: string;
    activeSize: number;
    hoverColour: string;
    hoverSize: number;
}

export default class DraggablePoint<T> extends InteractiveElement<DraggablePointOptions<T>> {
    public readonly point: Point;

    constructor(params: OptionalExceptSourceMap<DraggablePointOptions<T>, "params" | "locus">) {
        super({
            colour: "blue",
            size: 10,
            activeColour: "#0cf",
            activeSize: 10,
            hoverColour: "red",
            hoverSize: 12,
            ...params
        });

        this.point = new Point({
            location: () => this.params.locus.getValue().fromParametricSpace(this.params.params.getValue()),
            colour: () => {
                if (this.params.active.getValue())
                    return this.params.activeColour.getValue();
                if (this.params.hover.getValue())
                    return this.params.hoverColour.getValue();
                return this.params.colour.getValue();
            },
            size: () => {
                if (this.params.active.getValue())
                    return this.params.activeSize.getValue();
                if (this.params.hover.getValue())
                    return this.params.hoverSize.getValue();
                return this.params.size.getValue();
            }
        });

        this.canBeDragged = true;
    }

    draw(canvas: SignalCanvasRaster): void {
        this.point.draw(canvas);
    }
    tagName = "g";
    updateSvg(svg: SignalCanvasVector): void {
        // TODO: add a larger, invisible click target
        this.point.drawSvg(svg, this.svgNode);
        setSvgAttr(this.svgNode, "tabindex", "0");
        setSvgStyles(this.svgNode, {
            cursor: this.params.active.getValue() ? "grabbing" : "grab"
        });
    }

    hoverScore(coords: Vector): number {
        // TODO: allow custom radius?
        const p = this.point.params.location.getValue();
        if (!p) return 0;
        const x = p.x - coords.x;
        const y = p.y - coords.y;
        return 1 - (Math.sqrt(x * x + y * y) / 16);
    }

    dragTo(coords: Vector): void {
        // We don't want params to depend on the locus, it should just get its new value and then stay there
        const locus = this.params.locus.getValue();
        this.params.params.setValue(() => locus.toParametricSpace(coords));
    }

    getLocation(): Vector {
        return this.point.params.location.getValue()!;
    }

    dragPos(): Vector {
        return this.getLocation();
    }
}
