export default class Signal {
    constructor(getter) {
        this._subs = new Set();
        this._sources = new Set();
        this.setValue(getter);
    }

    setValue(getter) {
        this._getter = getter;
        this.calculate();
    }

    calculate() {
        Signal._newSources = new Set();
        this._value = this._getter();
        for (const source of this._sources)
            if (!Signal._newSources.has(source)) source.unsubscribe(this);
        for (const source of Signal._newSources)
            if (!this._sources.has(source)) source.subscribe(this);
        this._sources = Signal._newSources;
        Signal._newSources = null;
        for (const sub of this._subs) sub.calculate();
    }

    getValue() {
        Signal._newSources?.add(this);
        return this._value;
    }

    subscribe(sub) {
        this._subs.add(sub);
    }

    unsubscribe(sub) {
        this._subs.remove(sub);
    }
}
