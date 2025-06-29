import Point from "../elements/Point";
import Signal, { Getter, SignalMappable } from "../Signal";

export interface Vector {
    x: number;
    y: number;
}

export type VectorSource = SignalMappable<Vector | null> | Point;
type VSource = VectorSource;
export type NotNullVectorSource = SignalMappable<Vector>;
type NNVSource = VectorSource;
type VRes = Getter<Vector | null>;
type NNVRes = Getter<Vector>;

export function value(source: VectorSource): Vector | null {
    if (source instanceof Point) return source.params.location.getValue();
    if (source instanceof Signal) return source.getValue();
    if (source instanceof Function) return source();
    return source;
}

export function add(a: NNVSource, b: NNVSource): NNVRes;
export function add(a: VSource, b: VSource): VRes;
export function add(a: VSource, b: VSource): VRes {
    return () => {
        const aVal = value(a);
        const bVal = value(b);
        if (!aVal || !bVal) return null;
        return {
            x: aVal.x + bVal.x,
            y: aVal.y + bVal.y
        };
    };
}

export function subtract(a: NNVSource, b: NNVSource): NNVRes;
export function subtract(a: VSource, b: VSource): VRes;
export function subtract(a: VSource, b: VSource): VRes {
    return () => {
        const aVal = value(a);
        const bVal = value(b);
        if (!aVal || !bVal) return null;
        return {
            x: aVal.x - bVal.x,
            y: aVal.y - bVal.y
        };
    };
}

export function length(a: VSource): Getter<number | null>;
export function length(a: NNVSource): Getter<number>;
export function length(a: VSource): Getter<number | null> {
    return () => {
        const aVal = value(a);
        if (!aVal) return null;
        return Math.sqrt(aVal.x * aVal.x + aVal.y * aVal.y);
    };
}

export function distance(a: VSource, b: VSource): Getter<number | null>;
export function distance(a: NNVSource, b: NNVSource): Getter<number>;
export function distance(a: VSource, b: VSource): Getter<number | null> {
    return length(subtract(a, b));
}

export function equals(a: VSource, b: VSource): Getter<boolean>;
export function equals(a: NNVSource, b: NNVSource): Getter<boolean>;
export function equals(a: VSource, b: VSource): Getter<boolean> {
    return () => {
        const aVal = value(a);
        const bVal = value(b);
        if (!aVal || !bVal) return false;
        return aVal.x == bVal.x && aVal.y == bVal.y;
    };
}

export function normalise(a: VSource): VRes;
export function normalise(a: NNVSource): VRes;
export function normalise(a: VSource): VRes {
    return () => {
        const aVal = value(a);
        if (!aVal) return null;
        const l = Math.sqrt(aVal.x * aVal.x + aVal.y * aVal.y);
        if (!l) return null;
        return { x: aVal.x / l, y: aVal.y / l };
    }
}

export function directionTo(a: NNVSource, b: NNVSource): NNVRes;
export function directionTo(a: VSource, b: VSource): VRes;
export function directionTo(a: VSource, b: VSource): VRes {
    return normalise(subtract(a, b));
}

export function lineIntersection(
    a1: VSource, a2: VSource,
    b1: VSource, b2: VSource
): VRes {
    return () => _lineIntersection(
        value(a1), value(a2), value(b1), value(b2)
    );
}

export function cosSin(theta: number, r = 1, centre: Vector = { x: 0, y: 0 }): Vector {
    return {
        x: Math.cos(theta) * r + centre.x,
        y: Math.sin(theta) * r + centre.y
    }
}

export function atan(p: Vector) {
    return Math.atan2(p.y, p.x);
}

function _lineIntersection(
    line1a: Vector | null, line1b: Vector | null,
    line2a: Vector | null, line2b: Vector | null
): Vector | null {
    // Any null points means we don't have two lines so we don't have an intersection
    if (!line1a || !line2a || !line1b || !line2b) return null;
    const xDiff1 = line1a.x - line1b.x;
    const xDiff2 = line2a.x - line2b.x;
    const yDiff1 = line1a.y - line1b.y;
    const yDiff2 = line2a.y - line2b.y;
    const div = xDiff1 * yDiff2 - xDiff2 * yDiff1;
    if (!div) return null; // lines do not intersect
    const d1 = line1a.x * line1b.y - line1b.x * line1a.y;
    const d2 = line2a.x * line2b.y - line2b.x * line2a.y;
    return {
        x: (d1 * xDiff2 - d2 * xDiff1) / div,
        y: (d1 * yDiff2 - d2 * yDiff1) / div
    };
}
