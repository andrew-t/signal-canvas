import Element from "../Element";
import type { GlobalOptions } from "../../SignalCanvas";
import { Vector } from "../../utils/Vector";
import { OptionalSourceMap } from "../../SignalGroup";

export interface InteractiveElementOptions {
    active: boolean;
    hover: boolean;
}

export default abstract class InteractiveElement<T extends GlobalOptions = GlobalOptions> extends Element<T & InteractiveElementOptions>
{
    constructor(params: OptionalSourceMap<T, keyof GlobalOptions>) {
        // @ts-expect-error This does work I promise
        super({
            active: false,
            hover: false,
            ...params
        });
    }

    public canBeDragged = false;

    /** Return a value between 0 and 1 for how good a match this is for a mouse position. */
    abstract hoverScore(coords: Vector): number;

    abstract dragTo(coords: Vector, from: Vector): void;
    abstract dragPos(): Vector;
}
