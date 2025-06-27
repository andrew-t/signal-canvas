import type { PointParams } from "../../Point";
import type { DraggablePointLocus } from "./types";

const Anywhere: DraggablePointLocus<PointParams> = {
    toParametricSpace(p) { return p; },
    fromParametricSpace(p) { return p; }
};

export default Anywhere;
