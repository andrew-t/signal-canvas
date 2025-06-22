import { Element } from "./Element.js";
import { Line as LineSymbol } from "../SignalCanvas.js";

export default class Line extends Element {
    constructor(params) {
        super(LineSymbol, params);
    }
}
