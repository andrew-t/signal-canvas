export default class Signal {
    static _getValueContextStack = [];

    constructor(getter, name) {
        this.name = name;
        this._subs = new Set();
        this._sources = new Set();
        this._allSources = new Set();
        this.setValue(getter);
    }

    setValue(getter) {
        this._getter = getter;
        this.markDirty();
    }

    markDirty() {
        this._isDirty = true;
        for (const sub of this._subs)
            if (sub instanceof Signal) sub.markDirty();
            else sub(this);
    }

    static withContext(context, callback) {
        this._getValueContextStack.push(context);
        try {
            return callback();
        } finally {
            this._getValueContextStack.pop();
        }
    }

    static currentGetValueContext() {
        return this._getValueContextStack[this._getValueContextStack.length - 1] ?? null;
    }

    getValue() {
        const currentContext = Signal.currentGetValueContext();
        if (currentContext) {
            if (this._allSources.has(currentContext.signal))
                throw new Error(`Circular dependency: ${currentContext.signal} in ${this}`);
            currentContext.newSources.add(this);
        }

        if (this._isDirty) {
            const context = {
                newSources: new Set(),
                signal: this
            };
            this._value = Signal.withContext(context, this._getter);
            for (const source of this._sources)
                if (!context.newSources.has(source)) source.unsubscribe(this);
            for (const source of context.newSources)
                if (!this._sources.has(source)) source.subscribe(this);
            this._sources = context.newSources;
            this._isDirty = false;
            this._allSources = new Set([
                ...this._sources,
                ...[...this._sources].flatMap(a => [...a._allSources])
            ]);
        }

        return this._value;
    }

    /** sub here can be a signal, or a function, which will be passed the signal's new value whenever it changes */
    subscribe(sub) {
        this._subs.add(sub);
    }

    unsubscribe(sub) {
        this._subs.remove(sub);
    }

    toString() {
        return `Signal(${this.name ?? "value"} = ${this._isDirty ? "???" : this._value})`;
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
