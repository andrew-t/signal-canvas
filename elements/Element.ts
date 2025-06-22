import { NFSignal as Signal, SignalSubscriber } from "../Signal.js";

export type WithSignalOrElementProps<T> = T extends Array<any>
    ? Array<T | Signal<T>> | Array<T | Signal<T> | Element<T>>
    : { [key in keyof T]: T[key] | Element<T[key]> | Signal<T[key]> };

export type ElementMappable<T> = T | Signal<T> | WithSignalOrElementProps<T> | (() => T);

export default abstract class Element<T = any, O = any> {
    private params: Signal<T>;

    constructor(params: ElementMappable<T>) {
        this.params = Element.mapToSignals(params);
    }

    getParams(): T {
        return this.params.getValue();
    }

    setParams(value: T | (() => T)): void {
        this.params.setValue(value);
    }

    abstract draw(ctx: CanvasRenderingContext2D, options: O): void;

    static value<T>(object: T | Signal<T> | Element<T>) {
        if (object instanceof Element) return object.getParams();
        if (object instanceof Signal) return object.getValue();
        return object;
    }

    static mapToSignals<T>(object: ElementMappable<T>): Signal<T> {
        if (object instanceof Signal) return object;
        if (object instanceof Element) return object.params;
        if (object instanceof Function) return new Signal(object);
        // @ts-ignore Pretty sure this is fine
        if (Array.isArray(object)) return new Signal(() => object.map(Element.value));
        if (typeof object !== "object") return new Signal(object);
        // @ts-ignore Pretty sure this is fine
        return new Signal(() => Object.fromEntries(Object.entries(object).map(([name, value]) => [name, Element.value(value)])));
    }

    subscribe(callback: SignalSubscriber<T>): void {
        this.params.subscribe(callback);
    }

    unsubscribe(callback: SignalSubscriber<T>): void {
        this.params.unsubscribe(callback);
    }
}
