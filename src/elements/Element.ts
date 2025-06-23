import { Getter, NFSignal as Signal, SignalSubscriber } from "../Signal.js";

export type ElementMappable<T> = T | Signal<T> | Element<T> | Getter<T>;

// arguably T and O (params and options) are very similar and should be one thing
// but the reason they're not is that I expect T to be stuff like "the coordinates of a thing" that will change constantly, whereas O will be stuff like "what colour to draw it" that will almost never change. the aim is so you can kind of separate from from function like in html/css and not have to think about preserving all your file info if you're doing some gross direct update to a component.
// it also happens to make it quite nice to just grab a point and use it as one end of a line, without accidentally pulling in and depending on all its style information.
// honestly it probably doesn't matter much but this way works quite nicely.
// it's a bit inelegant that the style options are in the canvas rather than here, but i don't know if that matters really, and i guess it probably makes the z-filter sort 0.01% faster
export default abstract class Element<T = any, O = any> {
    private params: Signal<T>;

    constructor(params: ElementMappable<T>) {
        this.params = Element.paramsSignalFrom(params);
    }

    getParams(): T {
        return this.params.getValue();
    }

    setParams(value: T | (() => T)): void {
        this.params.setValue(value);
    }

    abstract draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: O): void;

    static value<T>(object: T | Signal<T> | Element<T> | Getter<T>) {
        if (object instanceof Element) return object.getParams();
        return Signal.value(object);
    }

    static paramsSignalFrom<T>(object: ElementMappable<T>): Signal<T> {
        if (object instanceof Element) return object.params;
        return Signal.from(object);
    }

    subscribe(callback: SignalSubscriber<T>): void {
        this.params.subscribe(callback);
    }

    unsubscribe(callback: SignalSubscriber<T>): void {
        this.params.unsubscribe(callback);
    }
}
