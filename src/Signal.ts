interface GetValueContext {
    signal: Signal;
    newSources: Set<Signal>;
}

export type SignalSubscriberFunction<T = any> = ((signal?: Signal<T>) => unknown);
export type SignalSubscriber<T = any> = Signal<T> | SignalSubscriberFunction<T>;
export type Getter<T> = () => T;

// TODO: it'd be real nice if we could support passing in sliders directly
// export type SignalMappable<T> = T | Getter<T> | Signal<T> | SignalInputBase<T, any>;
export type SignalMappable<T> = T | Getter<T> | Signal<T>;

export default class Signal<T = any> {
    private static getValueContextStack: GetValueContext[] = [];
    
    public name: string | undefined;
    private getter: Getter<T>;
    private value: T;

    private subs = new Set<SignalSubscriber<T>>();
    private sources = new Set<Signal>();
    private allSources = new Set<Signal>();
    private isDirty = false;

    constructor(getter: Getter<T>, name?: string) {
        this.name = name;
        this.setValue(getter);
    }

    setValue(getter: Getter<T>): void {
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
    subscribe(sub: SignalSubscriber<T>): void;
    subscribe(sub: SignalSubscriberFunction<T>, options: { runNow?: boolean }): void;
    subscribe(sub: SignalSubscriber<T>, options: { runNow?: boolean } = {}): void {
        this.subs.add(sub);
        if (options.runNow) (sub as SignalSubscriberFunction<T>)(this);
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
}

/** This is a signal whose value is contractually not a function which allows us to skip some logic and simplify the syntax */
export class NFSignal<T> extends Signal<T> {
    constructor(valueOrGetter: T | (Getter<T>), name?: string) {
        super(NFSignal.actualGetter(valueOrGetter), name);
    }

    setValue(valueOrGetter: T | Getter<T>): void {
        super.setValue(NFSignal.actualGetter(valueOrGetter));
    }

    static value<T>(val: Signal<T> | Getter<T> | T): T {
        if (val instanceof Signal) return val.getValue();
        if (val instanceof Function) return val();
        return val;
    }

    static actualGetter<T>(valueOrGetter: T | Getter<T>): Getter<T> {
        if (valueOrGetter instanceof Signal) return () => valueOrGetter.getValue();
        if (valueOrGetter instanceof Function) return valueOrGetter;
        return () => valueOrGetter;
    }

    static from<T>(object: SignalMappable<T>): NFSignal<T> {
        if (object instanceof NFSignal) return object;
        if (object instanceof Signal) throw new Error("Only NFSignals allowed here");
        return new NFSignal(object);
    }
}
