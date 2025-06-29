import Element from "./Element";
import { GlobalOptions } from "../SignalCanvas";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type SignalCanvasVector from "../SignalCanvasVector";
import { OptionalSourceMap } from "../SignalGroup";

// TODO: maybe this should allow tranforming the canvas? not sure, haven't worked out entirely what this is for yet

export interface GroupOptions {
    elements: Element<any>[];
};

export default class Group<T extends GlobalOptions = GlobalOptions>
    extends Element<T & GroupOptions>
{
    constructor(params: OptionalSourceMap<T & GroupOptions, keyof GlobalOptions |keyof GroupOptions>) {
        // @ts-expect-error This does work I promise
        super({
            // You're kind of expected to set this in the constructor but after calling super()
            elements: [] as Element<any>[],
            ...params
        });
    }

    members() {
        return this.params.elements.getValue()
            .filter((element) => !element.params.disabled.getValue())
            .sort((a, b) =>
                a.params.zIndex.getValue() -
                b.params.zIndex.getValue());
    }

    draw(canvas: SignalCanvasRaster): void {
        for (const element of this.members())
            element.draw(canvas);
    }

    tagName = "g";
    updateSvg(svg: SignalCanvasVector): void {
        for (const element of this.members())
            element.drawSvg(svg, this.svgNode);
    }
}
