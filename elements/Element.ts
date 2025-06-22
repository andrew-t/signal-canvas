import { Getter, NFSignal as Signal, SignalSubscriber } from "../Signal.js";

export type ElementMappable<T> = T | Signal<T> | Element<T> | Getter<T>;

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

    abstract draw(ctx: CanvasRenderingContext2D, options: O): void;

    static value<T>(object: T | Signal<T> | Element<T>) {
        if (object instanceof Element) return object.getParams();
        if (object instanceof Signal) return object.getValue();
        return object;
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
