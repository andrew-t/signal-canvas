import { NFSignal as Signal } from "../Signal";
import Element, { ElementMappable } from "./Element";
import { GlobalOptions } from "../SignalCanvas";
import type SignalCanvasRaster from "../SignalCanvasRaster";
import type SignalCanvasVector from "../SignalCanvasVector";

// TODO: maybe this should allow tranforming the canvas? not sure, haven't worked out entirely what this is for yet

export interface GroupParams {
    elements: Element[];
};

export abstract class GroupBase<T, O extends GlobalOptions> extends Element<T, O> {
    protected elements: Signal<Element[]>;

    constructor(
        params: ElementMappable<T>,
        options: ElementMappable<O>,
        elements: ElementMappable<Element[]>
    ) {
        super(params, options);
        this.elements = Element.paramsSignalFrom(elements);
    }

    members() {
        return this.elements.getValue()
            .filter((element) => !element.getOptions()?.disabled)
            .sort((a, b) =>
                (a.getOptions()?.zIndex ?? 0) -
                (b.getOptions()?.zIndex ?? 0));
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

export default class Group extends GroupBase<null, {}> {
    constructor(elements: ElementMappable<Element[]>) {
        super(null, {}, elements);
    }
}
