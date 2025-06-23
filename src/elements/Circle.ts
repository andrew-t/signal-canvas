import Line, { LineDrawingOptions } from "./Line";
import type { PointParams } from "./Point";
import Element, { ElementMappable } from "./Element.js";
import { NFSignal as Signal, SignalMappable } from "../Signal.js";
import type SignalCanvas from "../SignalCanvas.js";

export interface CircleParams {
    centre: PointParams | null;
    radius: number | null;
    // Set these to just do a section of arc:
    startAngle?: number | null;
    endAngle?: number | null;
    counterClockwise?: boolean;
}

export default class Circle extends Element<CircleParams, LineDrawingOptions> {
    constructor(params: ElementMappable<CircleParams>, options: ElementMappable<LineDrawingOptions>);
    constructor(centre: ElementMappable<PointParams | null>, radius: SignalMappable<number | null>, options: ElementMappable<LineDrawingOptions>);
    constructor(
        params: ElementMappable<PointParams | null> | ElementMappable<CircleParams>,
        radius: SignalMappable<number | null> | ElementMappable<LineDrawingOptions>,
        options?: ElementMappable<LineDrawingOptions>
    ) {
        if (radius !== undefined) super(
            () => ({
                centre: Element.value(params as ElementMappable<PointParams | null>),
                radius: Signal.value(radius as SignalMappable<number | null>)
            }),
            options as ElementMappable<LineDrawingOptions>);
        else super(
            params as ElementMappable<CircleParams>,
            radius as ElementMappable<LineDrawingOptions>
        );
    }

    getCentre() {
        return new Signal(this.getParams().centre);
    }

    // TODO: support making a circle from three points

    draw({ ctx }: SignalCanvas): void {
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
}
