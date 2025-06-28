import { NFSignal as Signal, SignalMappable } from "../Signal";
import Element, { ElementMappable, setSvgAttr, setSvgStyles } from "./Element";
import type { PointParams } from "./Point";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type { GlobalOptions } from "../SignalCanvas";

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

    constructor(params: ElementMappable<LabelParams>);
    constructor(text: SignalMappable<string>, location: ElementMappable<PointParams | null>);
    constructor(
        params: ElementMappable<LabelParams> | SignalMappable<string>,
        location?: ElementMappable<PointParams | null>) {
        if (!location) super(
            params as ElementMappable<LabelParams>,
            {}
        );
        else super(
            () => ({
                location: Element.value(location as ElementMappable<PointParams | null>),
                text: Signal.value(params as SignalMappable<string>)
            }),
            {}
        );
    }

    draw({ ctx }: SignalCanvasRaster): void {
        const { location, text } = this.getParams();
        const options = this.getOptions();
        if (!location || !text) return;
        ctx.font = options.font ?? Label.defaultFont;
        ctx.fillStyle = options.colour ?? "black";
        ctx.textAlign = options.align ?? "start";
        ctx.fillText(text, location.x, location.y);
    }

    tagName = "text";
    updateSvg(): void {
        const { location, text } = this.getParams();
        const { disabled, colour, align, font } = this.getOptions();
        if (disabled || !location || !text) {
            this.svgNode.replaceChildren();
            return;
        }
        this.svgNode.replaceChildren(document.createTextNode(text))
        setSvgAttr(this.svgNode, "x", location.x.toString());
        setSvgAttr(this.svgNode, "y", location.y.toString());
        setSvgStyles(this.svgNode, {
            "text-anchor": TextAlignSvg[align ?? "left"],
            "fill": colour ?? "black",
            "font": font ?? Label.defaultFont
        });
    }
}

export enum TextAlign {
    LeftAlign = "left",
    RightAlign = "right",
    CentreAlign = "center",
    StartAlign = "start",
    EndAlign = "end",
}

// TODO: make this work properly in RTL languages
const TextAlignSvg = {
    "left": "start",
    "centre": "middle",
    "right": "end",
    "start": "start",
    "end": "end"
};
