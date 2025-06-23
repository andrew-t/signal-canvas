import { NFSignal as Signal, SignalMappable } from "../Signal";
import Element, { ElementMappable } from "./Element.ts";
import type SignalCanvas from "../SignalCanvas.js";
import { GlobalOptions } from "../SignalCanvas.js";

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

    draw(canvas: SignalCanvas): void {
        const elements = this.elements.getValue()
            .filter((element) => !element.getOptions()?.disabled)
            .sort((a, b) =>
                (a.getOptions()?.zIndex ?? 0) -
                (b.getOptions()?.zIndex ?? 0));
        for (const element of elements)
            element.draw(canvas);
    }
}

export default class Group extends GroupBase<null, {}> {
    constructor(elements: ElementMappable<Element[]>) {
        super(null, {}, elements);
    }
}
