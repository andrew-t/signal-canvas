import Point, { PointOptions, PointParams } from "../Point.js";
import Element, { ElementMappable } from "../Element.js";
import SignalCanvas, { GlobalOptions } from "../../SignalCanvas.js";
import { DraggablePointLocus } from "./loci/types.js";
import { NFSignal as Signal } from "../../Signal.js";

export default abstract class InteractiveElement<T, O extends GlobalOptions> extends Element<T, O>
{
    /** The user can only interact with one element at a time. Is it this one? */
    public readonly active = new Signal(false);
    /** This becomes true if the user is hovering over this element */
    public readonly hover = new Signal(false);

    public canBeDragged = false;

    /** Return a value between 0 and 1 for how good a match this is for a mouse position. */
    abstract hoverScore(coords: PointParams): number;

    abstract dragTo(coords: PointParams, from: PointParams): void;
}
