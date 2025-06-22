interface GetValueContext {
    signal: Signal;
    newSources: Set<Signal>;
}

export type SignalSubscriber<T = any> = Signal<T> | ((signal?: Signal<T>) => unknown);

export type WithSignalProps<T> = T extends Array<any>
    ? Array<T[number] | Signal<T[number]>>
    : { [key in keyof T]: T[key] | Signal<T[key]> };

export type SignalMappable<T> = T | Signal<T> | WithSignalProps<T>;

export default class Signal<T = any> {
    private static getValueContextStack: GetValueContext[] = [];
    
    public name?: string;
    private getter: () => T;
    private value: T;

    private subs = new Set<SignalSubscriber<T>>();
    private sources = new Set<Signal>();
    private allSources = new Set<Signal>();
    private isDirty = false;

    constructor(getter: () => T, name?: string) {
        this.name = name;
        this.setValue(getter);
    }

    setValue(getter: () => T): void {
        if (!(getter instanceof Function)) throw new Error("Getter must be function");
        this.getter = getter;
        this.markDirty();
    }

    markDirty(): void {
        if (this.isDirty) return;
        this.isDirty = true;
        for (const sub of this.subs)
            if (sub instanceof Signal) sub.markDirty();
            else sub(this);
    }

    static currentGetValueContext(): GetValueContext {
        return this.getValueContextStack[this.getValueContextStack.length - 1] ?? null;
    }

    getValue(): T {
        const currentContext = Signal.currentGetValueContext();
        if (currentContext) {
            if (this.allSources.has(currentContext.signal))
                throw new Error(`Circular dependency: ${currentContext.signal} in ${this}`);
            currentContext.newSources.add(this);
        }

        if (this.isDirty) {
            const context: GetValueContext = {
                newSources: new Set(),
                signal: this
            };
            Signal.getValueContextStack.push(context);
            try {
                this.value = this.getter();
            } finally {
                Signal.getValueContextStack.pop();
            }
            for (const source of this.sources)
                if (!context.newSources.has(source)) source.unsubscribe(this);
            for (const source of context.newSources)
                if (!this.sources.has(source)) source.subscribe(this);
            this.sources = context.newSources;
            this.isDirty = false;
            this.allSources = new Set([
                ...this.sources,
                ...[...this.sources].flatMap(a => [...a.allSources])
            ]);
        }

        return this.value;
    }

    /** sub here can be a signal, or a function, which will be passed the signal's new value whenever it changes */
    subscribe(sub: SignalSubscriber<T>): void {
        this.subs.add(sub);
    }

    unsubscribe(sub: SignalSubscriber<T>): void {
        this.subs.delete(sub);
    }

    toString(): string {
        return `Signal(${this.name ?? "value"} = ${this.isDirty ? "???" : this.value})`;
    }

    /** equivalent to "await" — give it a signal and it'll give you the value, give it anything else and it'll give you the argument back out */
    static value<T>(val: Signal<T> | T): T {
        if (val instanceof Signal) return val.getValue();
        return val;
    }
    /** Subscribes if the first param is a signal, otherwise does nothing */
    static subscribe<T>(signal: Signal<T> | T, callback: SignalSubscriber<T>) : void {
        if (signal instanceof Signal) signal.subscribe(callback);
    }
    /** Unsubscribes if the first param is a signal, otherwise does nothing */
    static unsubscribe<T>(signal: Signal<T> | T, callback: SignalSubscriber<T>) : void {
        if (signal instanceof Signal) signal.unsubscribe(callback);
    }

    static map<T>(object: SignalMappable<T>): Signal<T> {
        if (object instanceof Signal) return object;
        // @ts-ignore — TS doesn't know T[number][] is T but it is
        if (Array.isArray(object)) return new Signal(() => object.map(Signal.value));
        if (typeof object !== "object") return new Signal(() => object);
        // @ts-ignore — ok i promise
        return new Signal(() => Object.fromEntries(Object.entries(object).map(([name, value]) => [name, Signal.value(value)])));
    }
}

/** This is a signal whose value is contractually not a function which allows us to skip some logic and simplify the syntax */
export class NFSignal<T> extends Signal<T> {
    constructor(valueOrGetter: T | (() => T), name?: string) {
        super(NFSignal.actualGetter(valueOrGetter), name);
    }

    setValue(valueOrGetter: T | (() => T)): void {
        super.setValue(NFSignal.actualGetter(valueOrGetter));
    }

    static actualGetter<T>(valueOrGetter: T | (() => T)): () => T {
        if (valueOrGetter instanceof Signal) return () => valueOrGetter.getValue();
        if (valueOrGetter instanceof Function) return valueOrGetter;
        return () => valueOrGetter;
    }

    static map<T>(object: SignalMappable<T> | (() => T)): NFSignal<T> {
        if (object instanceof Signal) return object;
        if (object instanceof Function) return new Signal(object);
        // @ts-ignore — TS doesn't know T[number][] is T but it is
        if (Array.isArray(object)) return new NFSignal(() => object.map(NFSignal.value));
        if (typeof object !== "object") return new NFSignal(object);
        // @ts-ignore — ok i promise
        return new NFSignal(() => Object.fromEntries(Object.entries(object).map(([name, value]) => [name, NFSignal.value(value)])));
    }
}
