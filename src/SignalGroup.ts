import type { Source } from "./elements/Element";
import { NFSignal as Signal, SignalMappable } from "./Signal";

export type SignalMap<T> = { [K in keyof T]: Signal<T[K]> };
export type SourceMap<T> = { [K in keyof T]: SignalMappable<T[K]> };
export type OptionalExceptSourceMap<T, RequiredK extends keyof T> =
    Partial<SourceMap<T>> &
    SourceMap<Pick<T, RequiredK>>;
export type OptionalSourceMap<T, OptionalK extends keyof T> =
    Partial<SourceMap<T>> &
    SourceMap<Omit<T, OptionalK>>;
type TValue<T> = T[Extract<keyof T, string>];

export default class SignalGroup<T> {
    public readonly signals: SignalMap<T>;

    constructor(defaultValues: SourceMap<T>) {
        this.signals = {} as SignalMap<T>;
        for (const key in defaultValues)
            this.signals[key] = Signal.from<TValue<T>>(defaultValues[key]);
        Object.freeze(this.signals);
    }

    get(): T;
    get(key: keyof T): T[typeof key];
    get(key?: keyof T) {
        if (!key) {
            const value: T = {} as T;
            for (const key in this.signals)
                value[key] = this.signals[key].getValue();
            return value;
        }
        return this.signals[key].getValue();
    }

    set(values: Partial<T>): void;
    set(key: keyof T, value: Source<T[typeof key]>): void;
    set(key: any, value?: any) {
        if (typeof key == "string") {
            this.signals[key].setValue(value);
            return;
        }
        const values = key as Partial<T>;
        for (const k in values) {
            if (!(k in this.signals)) throw new Error("Unexpected key");
            this.signals[k].setValue(values[k]!);
        }
    }
}
