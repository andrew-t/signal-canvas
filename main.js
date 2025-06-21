import { NFSignal as Signal } from "./Signal.js";

const canvas = document.getElementById("canvas");

canvas.width = 300;
canvas.height = 300;
const ctx = canvas.getContext('2d');

const pointA = new Signal({ x: 100, y: 100 });
const pointB = new Signal({ x: 100, y: 100 });
const lineAB = new Signal(() => ({ a: pointA.getValue(), b: pointB.getValue() }));
const staticLine = new Signal(() => ({ a: { x: 25, y: 275 }, b: { x: 275, y: 25 } }));
const intersection = new Signal(() => lineIntersection(lineAB.getValue(), staticLine.getValue()));

let start;
function drawFrame(time) {
    if (!start) start = time;
    const t = time - start;

    pointA.setValue({
        x: 75 + Math.sin(t * 0.002) * 50,
        y: 75 + Math.cos(t * 0.002) * 50
    });

    pointB.setValue({
        x: 225 + Math.sin(t * 0.0017) * 50,
        y: 225 - Math.cos(t * 0.0017) * 50
    });

    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, 300, 300);

    drawLine(ctx, lineAB, { colour: "black" });
    drawLine(ctx, staticLine, { colour: "#888" });
    drawPoint(ctx, pointA, { colour: '#f00' });
    drawPoint(ctx, pointB, { colour: '#00f' });
    drawPoint(ctx, intersection, { colour: '#0b0' });

    requestAnimationFrame(drawFrame);
}

drawFrame();

function lineIntersection(line1, line2) {
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

function drawLine(ctx, line, options) {
    ctx.strokeStyle = options.colour ?? "black";
    ctx.beginPath();
    const val = line.getValue();
    ctx.moveTo(val.a.x, val.a.y);
    ctx.lineTo(val.b.x, val.b.y);
    ctx.stroke();
}

/** point should be a signal that resolves either to {x,y} or null */
function drawPoint(ctx, point, options = {}) {
    ctx.fillStyle = options.colour ?? "black";
    ctx.beginPath();
    const val = point.getValue();
    if (val) ctx.arc(val.x, val.y, 5, 0, Math.PI * 2, true);
    ctx.fill();
}
