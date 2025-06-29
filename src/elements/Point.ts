import Element, { setSvgAttr, setSvgStyles } from "./Element";
import { GlobalOptions } from "../SignalCanvas";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type { OptionalExceptSourceMap } from "../SignalGroup";
import { Vector } from "../utils/Vector";

export interface PointOptions extends GlobalOptions {
    location: Vector | null;
    colour: string;
    size: number;
    // TODO: support other markers, like unfilled circles, squares, crosses, plusses, etc
    // type: PointType;
}


export default class Point extends Element<PointOptions> {
    constructor(params: OptionalExceptSourceMap<PointOptions, "location">) {
        super({
            colour: "black",
            size: 5,
            ...params
        });
    }

    draw({ ctx }: SignalCanvasRaster): void {
        const location = this.params.location.getValue();
        if (!location) return;
        const radius = this.params.size.getValue();
        const colour = this.params.colour.getValue();
        ctx.fillStyle = colour ?? "black";
        ctx.beginPath();
        ctx.arc(location.x, location.y, radius ?? 4, 0, Math.PI * 2, true);
        ctx.fill();
    }

    tagName = "circle";
    updateSvg() {
        const disabled = this.params.disabled.getValue();
        if (disabled) return this.hideSvg();
        const location = this.params.location.getValue();
        if (!location) return this.hideSvg();
        const radius = this.params.size.getValue();
        const colour = this.params.colour.getValue();
        setSvgAttr(this.svgNode, "cx", location.x.toString());
        setSvgAttr(this.svgNode, "cy", location.y.toString());
        setSvgAttr(this.svgNode, "r", radius.toString());
        setSvgStyles(this.svgNode, { "fill": colour });
    }
    hideSvg() {
        setSvgAttr(this.svgNode, "r", "-1");
    }
}
