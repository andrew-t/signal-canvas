import { NFSignal as Signal, SignalMappable } from "../Signal.js";
import Element, { ElementMappable } from "./Element.js";
import type { PointParams } from "./Point.js";
import type SignalCanvas from "../SignalCanvas.js";
import type { GlobalOptions } from "../SignalCanvas.js";

export interface LabelParams {
    // There's no real reason to make this null, but it makes it more convenient to program against
    location: PointParams | null;
    text: string;
}

export interface LabelOptions extends GlobalOptions {
    font?: string;
    colour?: string;
    align?: TextAlign;
}

export default class Label extends Element<LabelParams, LabelOptions> {
    /** Overwrite this if you'd like */
    static defaultFont = "16px sans-serif";

    constructor(params: ElementMappable<LabelParams>, options: ElementMappable<LabelOptions>);
    constructor(text: SignalMappable<string>, location: ElementMappable<PointParams | null>, options: ElementMappable<LabelOptions>);
    constructor(
        params: ElementMappable<LabelParams> | SignalMappable<string>,
        location: ElementMappable<PointParams | null> | ElementMappable<LabelOptions>,
        options?: ElementMappable<LabelOptions>) {
        if (!options) super(
            params as ElementMappable<LabelParams>,
            location as ElementMappable<LabelOptions>
        );
        else super(
            () => ({
                location: Element.value(location as ElementMappable<PointParams | null>),
                text: Signal.value(params as SignalMappable<string>)
            }),
            options as ElementMappable<LabelOptions>
        );
    }

    draw({ ctx }: SignalCanvas): void {
        const { location, text } = this.getParams();
        const options = this.getOptions();
        if (!location || !text) return;
        ctx.font = options.font ?? Label.defaultFont;
        ctx.fillStyle = options.colour ?? "black";
        ctx.textAlign = options.align ?? "start";
        ctx.fillText(text, location.x, location.y);
    }
}

export enum TextAlign {
    LeftAlign = "left",
    RightAlign = "right",
    CentreAlign = "center",
    StartAlign = "start",
    EndAlign = "end",
}
