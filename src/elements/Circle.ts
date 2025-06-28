import Line, { LineDrawingOptions } from "./Line";
import { cosSin, type PointParams } from "./Point";
import Element, { ElementMappable, setSvgAttr, setSvgStyles } from "./Element";
import { NFSignal as Signal, SignalMappable } from "../Signal";
import type SignalCanvasRaster from "../SignalCanvasRaster";

export interface CircleParams {
    centre: PointParams | null;
    radius: number | null;
    // Set these to just do a section of arc:
    startAngle?: number | null;
    endAngle?: number | null;
    counterClockwise?: boolean;
}

export default class Circle extends Element<CircleParams, LineDrawingOptions> {
    constructor(params: ElementMappable<CircleParams>);
    constructor(centre: ElementMappable<PointParams | null>, radius: SignalMappable<number | null>);
    constructor(
        params: ElementMappable<PointParams | null> | ElementMappable<CircleParams>,
        radius?: SignalMappable<number | null>,
    ) {
        if (radius !== undefined) super(
            () => ({
                centre: Element.value(params as ElementMappable<PointParams | null>),
                radius: Signal.value(radius as SignalMappable<number | null>)
            }),
            {});
        else super(
            params as ElementMappable<CircleParams>,
            {}
        );
    }

    getCentre() {
        return new Signal(this.getParams().centre);
    }

    // TODO: support making a circle from three points

    draw({ ctx }: SignalCanvasRaster): void {
        const params = this.getParams();
        const options = this.getOptions();
        if (!params.centre || !params.radius) return;
        Line.applyLineOptions(ctx, options);
        ctx.beginPath();
        ctx.arc(
            params.centre.x,
            params.centre.y,
            params.radius,
            params.startAngle ?? 0,
            params.endAngle ?? Math.PI * 2,
            !!params.counterClockwise
        );
        ctx.stroke();
    }

    tagName = "circle";
    updateSvg() {
        const {
            centre, radius,
            startAngle, endAngle,
            counterClockwise = false
        } = this.getParams();
        const { disabled, ...options } = this.getOptions();
        if (disabled || !radius || !centre) {
            setSvgAttr(this.svgNode, "d", "M 0 0");
            return;
        }
        if ((typeof startAngle == "number") && (typeof endAngle == "number")) {
            this.setSvgTag("path")
            let start = cosSin(startAngle!, radius!, centre);
            let end = cosSin(endAngle!, radius!, centre);
            if (counterClockwise) [start, end] = [end, start];
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
            ...Line.svgStyles(options),
            fill: "none"
        });
    }
}
