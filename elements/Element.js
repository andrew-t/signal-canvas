import { NFSignal as Signal } from "../Signal.js";

export class Element {
    constructor(type, params) {
        this.type = type;
        this._params = Element.mapToSignals(params);
    }

    getParams() {
        return this._params.getValue();
    }

    setParams(value) {
        this._params.setValue(value);
    }

    static value(object) {
        if (object instanceof Element) return { type: object.type, ...object.getParams() };
        if (object instanceof Signal) return object.getValue();
        return object;
    }

    static mapToSignals(object) {
        if (object instanceof Signal) return object;
        if (object instanceof Element) return new Signal(() => ({ type: object.type, ...object.getParams() }));
        if (object instanceof Function) return new Signal(object);
        if (Array.isArray(object)) return new Signal(() => object.map(Element.value));
        if (typeof object !== "object") return new Signal(object);
        return new Signal(() => Object.fromEntries(Object.entries(object).map(([name, value]) => [name, Element.value(value)])));
    }

    subscribe(callback) {
        this._params.subscribe(callback);
    }

    unsubscribe(callback) {
        this._params.unsubscribe(callback);
    }
}
