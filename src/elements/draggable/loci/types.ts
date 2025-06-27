import type { PointParams } from "../../Point";

export interface DraggablePointLocus<T> {
    /** Eg, if your locus is a circle, this will probably return the angle — you don't need the radius as we know it */
    toParametricSpace(position: PointParams): T;
    fromParametricSpace(params: T): PointParams;
}
