import { InputOptions, SignalInputBoolean } from "./base";

export interface CheckboxOptions extends InputOptions {
};

export default class SignalCheckbox extends SignalInputBoolean<CheckboxOptions> {
    constructor() {
        super({ label: "Toggle" });
        this.input.setAttribute("type", "checkbox");
    }

    parseValue(value: string): boolean {
        return !!value;
    }

    valueToString(value: boolean): string {
        return value ? "checked" : "";
    }
}

window.customElements.define("signal-checkbox", SignalCheckbox);
