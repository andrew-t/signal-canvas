import type { PointParams } from "../../Point";

export interface DraggablePointLocus<T> {
    toParametricSpace(position: PointParams): T;
    fromParametricSpace(params: T): PointParams;
}
