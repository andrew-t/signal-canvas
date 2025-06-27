import Signal from "../Signal";
import { GlobalOptions } from "../SignalCanvas";
import Circle from "./Circle";
import Element, { ElementMappable } from "./Element";
import { GroupBase } from "./Group";
import Label, { LabelOptions, TextAlign } from "./Label";
import type { LineDrawingOptions } from "./Line";
import type { PointParams } from "./Point";
import Point from "./Point";

interface AngleParams {
    from: PointParams | null;
    hinge: PointParams | null;
    to: PointParams | null;
    value?: string | null; // will be worked out if not set
}

interface AngleOptions extends GlobalOptions {
    unit?: AngleUnit;
    name?: string;
    showValue?: boolean;
    decimalPlaces?: number;
    radius?: number;
    line?: LineDrawingOptions;
    label?: LabelOptions;
    labelDistance?: number;
    labelOffset?: PointParams;
}

export default class Angle extends GroupBase<AngleParams, AngleOptions> {
    private circle: Circle;
    private label: Label;

    constructor(params: ElementMappable<AngleParams>);
    constructor(
        from: ElementMappable<PointParams | null>,
        hinge: ElementMappable<PointParams | null>,
        to: ElementMappable<PointParams | null>,
        value?: ElementMappable<string | null>
    );
    constructor(
        a: ElementMappable<AngleParams> | ElementMappable<PointParams | null>,
        b?: ElementMappable<PointParams | null>,
        c?: ElementMappable<PointParams | null>,
        d?: ElementMappable<string | null>
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

        const paramsWithAngles = new Signal(() => {
            const { from, hinge, to } = this.getParams();
            if (!from || !hinge || !to) return null;
            const htf = { x: from.x - hinge.x, y: from.y - hinge.y };
            const htt = { x: to.x - hinge.x, y: to.y - hinge.y };
            const fromAngle = Math.atan2(htf.y, htf.x);
            const toAngle = Math.atan2(htt.y, htt.x);
            return { from, hinge, to, fromAngle, toAngle };
        });
        
        this.circle = new Circle(() => {
            const angles = paramsWithAngles.getValue();
            if (!angles) return { centre: null, radius: null };
            const { radius } = this.getOptions();
            return {
                centre: angles.hinge,
                radius: radius ?? 32,
                startAngle: angles.fromAngle,
                endAngle: angles.toAngle
            };

        }).setOptions(() => this.getOptions().line ?? {});
        
        this.label = new Label(() => {
            const { value: givenValue, hinge } = this.getParams();
            const { name, unit, decimalPlaces, labelDistance, labelOffset } = this.getOptions();
            const angles = paramsWithAngles.getValue();
            if (!angles) return { text: "", location: hinge };
            const labelAngle = (angles.fromAngle + angles.toAngle) * 0.5;
            let value = "";
            if (givenValue) value = givenValue;
            else if (!value && unit != AngleUnit.Hidden) {
                const theta = (angles.toAngle - angles.fromAngle) / getUnit(unit);
                value = theta.toFixed(decimalPlaces) + getSuffix(unit);
            }
            const labelRadius = labelDistance ?? 48;
            return {
                text: name ? (value ? `${name} = ${value}` : name) : value,
                location: {
                    x: hinge!.x + Math.cos(labelAngle) * labelRadius + (labelOffset?.x ?? 0),
                    y: hinge!.y + Math.sin(labelAngle) * labelRadius + (labelOffset?.y ?? 8),
                }
            };
        }).setOptions(() => {
            const params = this.getParams();
            const options = this.getOptions();
            return {
                disabled: !options.showValue && !params.value && !options.name,
                align: TextAlign.CentreAlign,
                ...options.label
            };
        });

        this.elements.setValue([this.circle, this.label]);
    }
}

export enum AngleUnit {
    Hidden = "hidden",
    Radians = "radians",
    RadiansInTermsOfπ = "pi-radians",
    Revolutions = "revolutions",
    Degrees = "degrees"
}

function getUnit(unit?: Exclude<AngleUnit, AngleUnit.Hidden>): number {
    switch (unit) {
        case undefined: case AngleUnit.Radians: return 1;
        case AngleUnit.RadiansInTermsOfπ: return Math.PI;
        case AngleUnit.Revolutions: return Math.PI * 2;
        case AngleUnit.Degrees: return Math.PI / 180;
    }
}

function getSuffix(unit?: Exclude<AngleUnit, AngleUnit.Hidden>): string {
    switch (unit) {
        case undefined: case AngleUnit.Radians: return "";
        case AngleUnit.RadiansInTermsOfπ: return "π";
        case AngleUnit.Revolutions: return " turns";
        case AngleUnit.Degrees: return "°";
    }
}
