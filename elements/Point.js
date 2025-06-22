import { Element } from "./Element.js";
import { Point as PointSymbol } from "../SignalCanvas.js";
import lineIntersection from "./line-intersection.js";

export default class Point extends Element {
    constructor(params) {
        super(PointSymbol, params);
    }

    static lineIntersection(line1, line2) {
        return new Point(() => lineIntersection(line1.getParams(), line2.getParams()));
    }
}
