import { SignalMappable } from "../Signal";
import { GlobalOptions } from "../SignalCanvas";
import Circle from "./Circle";
import Element, { ElementMappable } from "./Element";
import { GroupBase } from "./Group";
import Label, { LabelOptions } from "./Label";
import type { LineDrawingOptions } from "./Line";
import type { PointParams } from "./Point";

interface AngleParams {
    from: PointParams | null;
    hinge: PointParams | null;
    to: PointParams | null;
    value?: number | string | null; // will be worked out if not set
}

interface AngleOptions extends GlobalOptions {
    unit?: AngleUnit;
    name?: string;
    format?: string;
    radius?: number;
    line?: LineDrawingOptions;
    label?: LabelOptions;
}

export default class Angle extends GroupBase<AngleParams, AngleOptions> {
    private circle: Circle;

    constructor(params: ElementMappable<AngleParams>);
    constructor(
        from: ElementMappable<PointParams | null>,
        hinge: ElementMappable<PointParams | null>,
        to: ElementMappable<PointParams | null>,
        value?: ElementMappable<number | string | null>
    );
    constructor(
        a: ElementMappable<AngleParams> | ElementMappable<PointParams | null>,
        b?: ElementMappable<PointParams | null>,
        c?: ElementMappable<PointParams | null>,
        d?: ElementMappable<number | string | null>
    ) {
        if (!b)
            super(a as ElementMappable<AngleParams>, {}, []);
        else
            super(() => ({
                from: Element.value(a as ElementMappable<PointParams | null>),
                hinge: Element.value(b!),
                to: Element.value(c!),
                value: Element.value(d!),
            }), {}, []);
        
        this.circle = new Circle(() => {
            const { from, hinge, to } = this.getParams();
            if (!from || !hinge || !to) return { centre: null, radius: null };
            const htf = { x: from.x - hinge.x, y: from.y - hinge.y };
            const htt = { x: to.x - hinge.x, y: to.y - hinge.y };
            const fromAngle = Math.atan2(htf.y, htf.x);
            const toAngle = Math.atan2(htt.y, htt.x);
            const { radius } = this.getOptions();
            return {
                centre: hinge,
                radius: radius ?? 32,
                startAngle: fromAngle,
                endAngle: toAngle
            };

        }).setOptions(() => this.getOptions().line ?? {});
        
        // TODO: label

        this.elements.setValue([this.circle]);
    }
}

export enum AngleUnit {
    Hidden = "hidden",
    Radians = "radians",
    Degrees = "degrees"
}
