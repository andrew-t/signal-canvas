import type { PointParams } from "../../Point";
import type { DraggablePointLocus } from "./types";

export default function rectangle(corner: PointParams, otherCorner: PointParams): DraggablePointLocus<PointParams> {
    const minX = Math.min(corner.x, otherCorner.x);
    const maxX = Math.max(corner.x, otherCorner.x);
    const minY = Math.min(corner.y, otherCorner.y);
    const maxY = Math.max(corner.y, otherCorner.y);
    return {
        toParametricSpace(position: PointParams): PointParams {
            const params = { ...position };
            if (params.x < minX) params.x = minX;
            if (params.x > maxX) params.x = maxX;
            if (params.y < minY) params.y = minY;
            if (params.y > maxY) params.y = maxY;
            return {
                x: (params.x - minX) / (maxX - minX),
                y: (params.y - minY) / (maxY - minY)
            };
        },
        fromParametricSpace(params: PointParams): PointParams {
            return {
                x: minX + params.x * (maxX - minX),
                y: minY + params.y * (maxY - minY)
            };
        }
    };
}
