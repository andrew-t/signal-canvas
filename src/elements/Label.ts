import Element, { setSvgAttr, setSvgStyles } from "./Element";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type { GlobalOptions } from "../SignalCanvas";
import { Vector } from "../utils/Vector";
import { OptionalExceptSourceMap } from "../SignalGroup";

export interface LabelOptions extends GlobalOptions {
    // There's no real reason to make this null, but it makes it more convenient to program against
    location: Vector | null;
    text: string;
    font: string;
    colour: string;
    align: TextAlign;
}

export default class Label extends Element<LabelOptions> {
    /** Overwrite this if you'd like */
    static defaultFont = "16px sans-serif";

    constructor(params: OptionalExceptSourceMap<LabelOptions, "location" | "text">) {
        super({
            colour: "black",
            font: Label.defaultFont,
            align: TextAlign.LeftAlign,
            ...params
        });
    }

    draw({ ctx }: SignalCanvasRaster): void {
        const location = this.params.location.getValue();
        const text = this.params.text.getValue();
        if (!location || !text) return;
        ctx.font = this.params.font.getValue();
        ctx.fillStyle = this.params.colour.getValue();
        ctx.textAlign = this.params.align.getValue();
        ctx.fillText(text, location.x, location.y);
    }

    tagName = "text";
    updateSvg(): void {
        const location = this.params.location.getValue();
        const text = this.params.text.getValue();
        const disabled = this.params.disabled.getValue();
        if (disabled || !location || !text) {
            this.svgNode.replaceChildren();
            return;
        }
        this.svgNode.replaceChildren(document.createTextNode(text))
        setSvgAttr(this.svgNode, "x", location.x.toString());
        setSvgAttr(this.svgNode, "y", location.y.toString());
        setSvgStyles(this.svgNode, {
            "text-anchor": TextAlignSvg[this.params.align.getValue()],
            "fill": this.params.colour.getValue(),
            "font": this.params.font.getValue()
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
    "center": "middle",
    "right": "end",
    "start": "start",
    "end": "end"
};
