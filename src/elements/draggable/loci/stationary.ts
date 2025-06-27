import type { PointParams } from "../../Point";
import type { DraggablePointLocus } from "./types";

export default function stationary(position: PointParams): DraggablePointLocus<null> {
    return {
        toParametricSpace() {
            return null;
        },
        fromParametricSpace() {
            return position;
        }
    };
}
