import Line from "./elements/Line.js";
import Point from "./elements/Point.js";
import SignalCanvas from "./SignalCanvas.js";

const pointA = new Point({ x: 100, y: 100 });
const pointB = new Point({ x: 100, y: 100 });
const lineAB = new Line({ a: pointA, b: pointB });
const staticLine = new Line({ a: { x: 25, y: 275 }, b: { x: 275, y: 25 } });
const intersection = Point.lineIntersection(lineAB, staticLine);

const canvas = new SignalCanvas({ width: 300, height: 300, background: "#eee" });
document.body.appendChild(canvas.canvas);

window._debugCanvas = canvas;

canvas.add(pointA, { colour: 'red', zIndex: 1 });
canvas.add(pointB, { colour: 'blue', zIndex: 1 });
canvas.add(lineAB);
canvas.add(staticLine, { colour: '#bbb', width: 0.5, dashes: [ 5, 2 ] });
canvas.add(intersection, { colour: 'green', zIndex: 1 });

let start;
function drawFrame(time) {
    if (!start) start = time;
    const t = time - start;

    pointA.setParams({
        x: 75 + Math.sin(t * 0.002) * 50,
        y: 75 + Math.cos(t * 0.002) * 50
    });

    pointB.setParams({
        x: 225 + Math.sin(t * 0.0017) * 50,
        y: 225 - Math.cos(t * 0.0017) * 50
    });

    requestAnimationFrame(drawFrame);
}

drawFrame();