import type { PointParams } from "../../Point";
import type { DraggablePointLocus } from "./types";

export default function line(
    a: PointParams,
    b: PointParams,
    options: { extendPastA?: boolean, extendPastB?: boolean } = {}
): DraggablePointLocus<number> {
    const d = { x: b.x - a.x, y: b.y - a.y };
    const l2 = d.x * d.x + d.y * d.y;
    const dol2 = { x: d.x / l2, y: d.y / l2 };
    return {
        toParametricSpace(position: PointParams) {
            let t = (position.x - a.x) * dol2.x + (position.y - a.y) * dol2.y;
            if (!options.extendPastA && t < 0) t = 0;
            if (!options.extendPastB && t > 1) t = 1;
            return t;
        },
        fromParametricSpace(t: number) {
            return {
                x: a.x + d.x * t,
                y: a.y + d.y * t
            };
        }
    }
}
