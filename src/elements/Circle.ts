import Element, { setSvgAttr, setSvgStyles } from "./Element";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import { GlobalOptions } from "../SignalCanvas";
import { OptionalExceptSourceMap } from "../SignalGroup";
import { cosSin, Vector } from "../utils/Vector";

export const τ = Math.PI * 2;

export interface CircleOptions extends GlobalOptions {
    centre: Vector | null;
    radius: number | null;
    // Set these to just do a section of arc:
    startAngle: number;
    endAngle: number;
    counterClockwise: boolean;
    colour: string;
    width: number;
    dashes: number[] | null;
}

// TODO: support making a circle from three points

export default class Circle extends Element<CircleOptions> {
    constructor(params: OptionalExceptSourceMap<CircleOptions, "centre" | "radius">) {
        super({
            startAngle: 0,
            endAngle: τ,
            counterClockwise: false,
            colour: "black",
            width: 1,
            dashes: null,
            ...params
        });
    }


    draw({ ctx }: SignalCanvasRaster): void {
        const centre = this.params.centre.getValue();
        const radius = this.params.radius.getValue();
        if (!centre || !radius) return;
        ctx.strokeStyle = this.params.colour.getValue();
        ctx.lineWidth = this.params.width.getValue();
        ctx.setLineDash(this.params.dashes.getValue() ?? []);
        ctx.beginPath();
        ctx.arc(
            centre.x,
            centre.y,
            radius,
            this.params.startAngle.getValue(),
            this.params.endAngle.getValue(),
            this.params.counterClockwise.getValue()
        );
        ctx.stroke();
    }

    tagName = "circle";
    updateSvg() {
        const centre = this.params.centre.getValue();
        const radius = this.params.radius.getValue();
        if (this.params.disabled.getValue() || !radius || !centre) {
            setSvgAttr(this.svgNode, "d", "M 0 0");
            return;
        }

        const startAngle = this.params.startAngle.getValue();
        const endAngle = this.params.endAngle.getValue();
        if (startAngle != 0 || endAngle != τ) {
            this.setSvgTag("path")
            let start = cosSin(startAngle!, radius, centre);
            let end = cosSin(endAngle!, radius, centre);
            if (this.params.counterClockwise.getValue())
                [start, end] = [end, start];
            const theta = (endAngle - startAngle + Math.PI * 4) % (Math.PI * 2);
            const useLongArc = theta >= Math.PI;
            setSvgAttr(this.svgNode, "d",
                `M ${start.x} ${start.y}
                A ${radius} ${radius} 0
                ${+useLongArc} 1
                ${end.x} ${end.y}`);
        } else {
            this.setSvgTag("circle");
            setSvgAttr(this.svgNode, "cx", centre.x.toString());
            setSvgAttr(this.svgNode, "cy", centre.y.toString());
            setSvgAttr(this.svgNode, "r", radius.toString());
        }
        setSvgStyles(this.svgNode, {
            "stroke": this.params.colour.getValue(),
            "stroke-width": `${this.params.width.getValue()}px`,
            "stroke-dasharray": this.params.dashes.getValue()?.map(d => `${d}px`).join(" ") ?? "",
            fill: "none"
        });
    }
}
