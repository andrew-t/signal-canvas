import { Getter, NFSignal as Signal, SignalSubscriber } from "../Signal.js";
import type SignalCanvas from "../SignalCanvas.js";
import { GlobalOptions } from "../SignalCanvas.js";

export type Source<T> = T | Getter<T>;
export type ElementMappable<T> = Signal<T> | Element<T> | Source<T>;

export default abstract class Element<T = any, O extends GlobalOptions = GlobalOptions> {
    private params: Signal<T>;
    private options: Signal<O>;

    constructor(params: ElementMappable<T>, options: ElementMappable<O>) {
        this.params = Element.paramsSignalFrom(params);
        this.options = Element.paramsSignalFrom(options);
    }

    getParams(): T {
        return this.params.getValue();
    }

    getOptions(): O {
        return this.options.getValue();
    }

    setParams(value: Source<T>): typeof this {
        this.params.setValue(value);
        return this;
    }

    setOptions(value: Source<O>): typeof this {
        this.options.setValue(value);
        return this;
    }

    abstract draw(canvas: SignalCanvas): void;

    static value<T>(object: ElementMappable<T>) {
        if (object instanceof Element) return object.getParams();
        return Signal.value(object);
    }

    static paramsSignalFrom<T>(object: ElementMappable<T>): Signal<T> {
        if (object instanceof Element) return object.params;
        return Signal.from(object);
    }

    subscribeParams(callback: SignalSubscriber<T>): void {
        this.params.subscribe(callback);
    }

    unsubscribeParams(callback: SignalSubscriber<T>): void {
        this.params.unsubscribe(callback);
    }

    subscribeOptions(callback: SignalSubscriber<O>): void {
        this.options.subscribe(callback);
    }

    unsubscribeOptions(callback: SignalSubscriber<O>): void {
        this.options.unsubscribe(callback);
    }

    subscribe(callback: () => void): void {
        this.params.subscribe(callback);
        this.options.subscribe(callback);
    }

    unsubscribe(callback: () => void): void {
        this.params.unsubscribe(callback);
        this.options.unsubscribe(callback);
    }
}
