import { InputOptions, SignalInputString } from "./base";

export interface SliderOptions extends InputOptions {
    min: number;
    max: number;
    step: number | null;
};

export default class SignalSlider extends SignalInputString<number, SliderOptions> {
    constructor() {
        super(0, { min: 0, max: 1, step: null, label: "Number" });
        if (this.hasAttribute("min")) this.options.min = parseFloat(this.getAttribute("min")!);
        if (this.hasAttribute("max")) this.options.max = parseFloat(this.getAttribute("max")!);
        if (this.hasAttribute("step")) {
            if (this.getAttribute("step") == "any") this.options.step = null;
            else this.options.step = parseFloat(this.getAttribute("step")!);
        }

        this.input.setAttribute("type", "range");
        this.input.setAttribute("min", this.options.min.toString());
        this.input.setAttribute("max", this.options.max.toString());
        this.input.setAttribute("step", this.options.step?.toString() ?? "any");
    }

    parseValue(value: string): number {
        return parseFloat(value);
    }

    valueToString(value: number): string {
        return value.toString();
    }
}

window.customElements.define("signal-slider", SignalSlider);
