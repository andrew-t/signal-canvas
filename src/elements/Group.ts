import { NFSignal as Signal } from "../Signal";
import Element from "./Element.ts";

// TODO: maybe this should allow tranforming the canvas? not sure, haven't worked out entirely what this is for yet

export interface ElementWithOptions<T = unknown> {
    element: Element<any, T>;
    options?: (T & { zIndex?: number }) | null;
}

export interface GroupParams {
    elements: Array<ElementWithOptions>;
};

export default class Group extends Element<GroupParams, {}> {    
    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: {}): void {
        const elements = this.getParams()
            .elements
            .map(({ element, options}) => ({
                element,
                options: Signal.value(options)
            }))
            .sort((a, b) => (a.options?.zIndex ?? 0) - (b.options?.zIndex ?? 0));
        for (const { element, options } of elements)
            element.draw(canvas, ctx, options);
    }
}
