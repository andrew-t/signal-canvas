import { NFSignal as Signal } from "../Signal";

export interface InputOptions {
    label: string;
};

export default abstract class SignalInput<Value, Options extends InputOptions> extends HTMLElement {
    value: Signal<Value>;
    // TODO: it would be really nice if options were a signal but for now it isn't
    options: Options;

    private label: HTMLLabelElement;
    private labelSpan: HTMLSpanElement;
    public readonly input: HTMLInputElement;

    constructor(defaultValue: Value, defaultOptions: Options) {
        super();
        this.value = new Signal(defaultValue);
        this.options = defaultOptions;
        if (this.hasAttribute("label")) this.options.label = this.getAttribute("label")!;

        this.label = document.createElement("label");
        this.labelSpan = document.createElement("span");
        this.labelSpan.innerText = this.options.label;
        this.label.appendChild(this.labelSpan);
        this.input = document.createElement("input");
        this.input.value = this.valueToString(defaultValue);
        this.label.appendChild(this.input);
        this.appendChild(this.label);

        this.input.addEventListener("input", () => this.value.setValue(this.parseValue(this.input.value)));
        this.value.subscribe(() => this.input.value = this.valueToString(this.value.getValue()));

        if (this.hasAttribute("value")) this.value.setValue(this.parseValue(this.getAttribute("value")!));
    }

    getValue(): Value {
        return this.value.getValue();
    }

    abstract parseValue(value: string): Value;
    abstract valueToString(value: Value): string;
}
