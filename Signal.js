export default class Signal {
    constructor(getter, name) {
        this.name = name;
        this._subs = new Set();
        this._sources = new Set();
        this._allSources = new Set();
        this.setValue(getter);
    }

    setValue(getter) {
        this._getter = getter;
        this.calculate();
    }

    calculate() {
        Signal._newSources = new Set();
        Signal._currentContext = this;
        this._value = this._getter();
        for (const source of this._sources)
            if (!Signal._newSources.has(source)) source.unsubscribe(this);
        for (const source of Signal._newSources)
            if (!this._sources.has(source)) source.subscribe(this);
        this._sources = Signal._newSources;
        Signal._newSources = null;
        Signal._currentContext = null;

        this._allSources = new Set([
            ...this._sources,
            ...[...this._sources].flatMap(a => [...a._allSources])
        ]);

        for (const sub of this._subs) sub.calculate();
    }

    getValue() {
        if (this._allSources.has(Signal._currentContext))
            throw new Error(`Circular dependency: ${Signal._currentContext} in ${this}`);
        Signal._newSources?.add(this);
        return this._value;
    }

    subscribe(sub) {
        this._subs.add(sub);
    }

    unsubscribe(sub) {
        this._subs.remove(sub);
    }

    toString() {
        return `Signal(${this.name ?? "value"} = ${this._value})`;
    }
}

/** This is a signal whose value is contractually not a function which allows us to skip some logic and simplify the syntax */
export class NFSignal extends Signal {
    constructor(valueOrGetter, name) {
        super(NFSignal.actualGetter(valueOrGetter), name);
    }

    setValue(valueOrGetter) {
        super.setValue(NFSignal.actualGetter(valueOrGetter));
    }

    static actualGetter(valueOrGetter) {
        if (valueOrGetter instanceof Signal) return () => valueOrGetter.getValue();
        if (valueOrGetter instanceof Function) return valueOrGetter;
        return () => valueOrGetter;
    }
}
