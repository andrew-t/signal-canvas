export default function lineIntersection(line1, line2) {
    const xDiff1 = line1.a.x - line1.b.x;
    const xDiff2 = line2.a.x - line2.b.x;
    const yDiff1 = line1.a.y - line1.b.y;
    const yDiff2 = line2.a.y - line2.b.y;
    const div = xDiff1 * yDiff2 - xDiff2 * yDiff1;
    if (!div) return null; // lines do not intersect
    const d1 = line1.a.x * line1.b.y - line1.b.x * line1.a.y;
    const d2 = line2.a.x * line2.b.y - line2.b.x * line2.a.y;
    return {
        x: (d1 * xDiff2 - d2 * xDiff1) / div,
        y: (d1 * yDiff2 - d2 * yDiff1) / div
    };
}
