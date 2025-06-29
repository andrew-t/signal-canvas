import Signal from "../Signal";
import { GlobalOptions } from "../SignalCanvas";
import { OptionalExceptSourceMap } from "../SignalGroup";
import { atan, Vector } from "../utils/Vector";
import Circle, { τ } from "./Circle";
import Group from "./Group";
import Label, { TextAlign } from "./Label";

export interface AngleOptions extends GlobalOptions {
    from: Vector | null;
    hinge: Vector | null;
    to: Vector | null;
    value: string | null; // will be worked out if not set
    unit: AngleUnit;
    name: string | null;
    showValue: boolean;
    decimalPlaces: number;
    radius: number;
    lineColour: string;
    lineWidth: number;
    lineDashes: number[] | null;
    labelFont: string;
    labelColour: string;
    labelDistance: number;
    labelOffset: Vector;
}

export default class Angle extends Group<AngleOptions> {
    private circle: Circle;
    private label: Label;

    constructor(params: OptionalExceptSourceMap<AngleOptions, "from" | "hinge" | "to">) {
        super({
            value: null,
            unit: AngleUnit.Degrees,
            name: null,
            showValue: false,
            decimalPlaces: 0,
            radius: 32,
            lineColour: "black",
            lineWidth: 1,
            lineDashes: null,
            labelFont: Label.defaultFont,
            labelColour: "black",
            labelDistance: 48,
            labelOffset: { x: 0, y: 8 },
            ...params,
        });

        const angles = new Signal(() => {
            const from = this.params.from.getValue();
            const to = this.params.to.getValue();
            const hinge = this.params.hinge.getValue();
            if (!from || !hinge || !to)
                return { fromAngle: 0, toAngle: τ, theta: τ };
            const htf = { x: from.x - hinge.x, y: from.y - hinge.y };
            const htt = { x: to.x - hinge.x, y: to.y - hinge.y };
            const fromAngle = atan(htf);
            const toAngle = atan(htt);
            let theta = (toAngle - fromAngle);
            if (theta < 0) theta += Math.PI * 2;
            return { fromAngle, toAngle, theta };
        });
        
        this.circle = new Circle({
            centre: this.params.hinge,
            radius: () => this.params.radius.getValue(),
            startAngle: () => angles.getValue().fromAngle,
            endAngle: () => angles.getValue().toAngle,
            colour: this.params.lineColour,
            width: this.params.lineWidth,
            dashes: this.params.lineDashes,
            disabled: this.params.disabled
        });
        
        this.label = new Label({
            location: () => {
                const hinge = this.params.hinge.getValue();
                const { fromAngle, theta } = angles.getValue();
                const labelOffset = this.params.labelOffset.getValue();
                const labelRadius = this.params.labelDistance.getValue();
                const labelAngle = fromAngle + theta * 0.5;
                return {
                    x: hinge!.x + Math.cos(labelAngle) * labelRadius + (labelOffset?.x ?? 0),
                    y: hinge!.y + Math.sin(labelAngle) * labelRadius + (labelOffset?.y ?? 8),
                };
            },
            text: () => {
                const name = this.params.name.getValue();
                const showValue = this.params.showValue.getValue();
                if (!showValue) return name ?? "";
                let value = this.params.value.getValue();
                if (value == null) {
                    const { theta } = angles.getValue();
                    const unit = this.params.unit.getValue();
                    const decimalPlaces = this.params.decimalPlaces.getValue();
                    value = (theta / getUnit(unit)).toFixed(decimalPlaces) + getSuffix(unit);
                }
                if (!name) return value;
                return `${name} = ${value}`;
            },
            align: TextAlign.CentreAlign,
            font: this.params.labelFont,
            colour: this.params.labelColour,
            disabled: this.params.disabled
        });

        this.params.elements.setValue([this.circle, this.label]);
    }
}

export enum AngleUnit {
    Radians = "radians",
    RadiansInTermsOfπ = "pi-radians",
    Revolutions = "revolutions",
    Degrees = "degrees"
}

function getUnit(unit?: AngleUnit): number {
    switch (unit) {
        case undefined: case AngleUnit.Radians: return 1;
        case AngleUnit.RadiansInTermsOfπ: return Math.PI;
        case AngleUnit.Revolutions: return Math.PI * 2;
        case AngleUnit.Degrees: return Math.PI / 180;
    }
}

function getSuffix(unit?: AngleUnit): string {
    switch (unit) {
        case undefined: case AngleUnit.Radians: return "";
        case AngleUnit.RadiansInTermsOfπ: return "π";
        case AngleUnit.Revolutions: return " turns";
        case AngleUnit.Degrees: return "°";
    }
}
