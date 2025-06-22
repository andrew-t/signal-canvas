// Import the classes we need to make this work
import Line from "./elements/Line.ts";
import Point from "./elements/Point.ts";
import everyFrame from "./every-frame.ts";
import SignalCanvas from "./SignalCanvas.ts";

// Start by defining some hard-coded elements
const pointA = new Point({ x: 100, y: 100 });
const pointB = new Point({ x: 100, y: 100 });
const staticLine = new Line({ a: { x: 25, y: 275 }, b: { x: 275, y: 25 } });

// Next, define some elements derived from the above
const lineAB = new Line({ a: pointA, b: pointB });
const intersection = Point.lineIntersection(lineAB, staticLine);

// Next, create the canvas we're going to draw on
const canvas = new SignalCanvas({ width: 300, height: 300, background: "#eee" });
document.body.appendChild(canvas.canvas);

// Add the elements we defined to the canvas, with some style information
canvas.add(pointA, { colour: 'red', zIndex: 1 });
canvas.add(pointB, { colour: 'blue', zIndex: 1 });
canvas.add(lineAB);
canvas.add(staticLine, { colour: '#bbb', width: 0.5, dashes: [ 5, 2 ] });
canvas.add(intersection, { colour: 'green', zIndex: 1 });

// Define a function that will run every frame
everyFrame(t => {
    // Note that all we have to do here is update a couple of our hard-coded points, and everything downstream of that updates on its own, including redrawing the display:
    pointA.setParams({
        x: 75 + Math.sin(t * 0.002) * 50,
        y: 75 + Math.cos(t * 0.002) * 50
    });
    pointB.setParams({
        x: 225 + Math.sin(t * 0.0017) * 50,
        y: 225 - Math.cos(t * 0.0017) * 50
    });
});
