// We need to import the web components individually or Vite """helpfully""" optimises them out 🙃
import "./controls/index.ts";

// Import the classes we need to make this work
import Line from "./elements/Line.ts";
import Point from "./elements/Point.ts";
import timestamp from "./every-frame.ts";
import SignalCanvas from "./SignalCanvas.ts";
import type SignalSlider from "./controls/signal-slider.ts";
import type SignalCheckbox from "./controls/signal-checkbox.ts";

// Start by defining some hard-coded elements
const pointA = new Point({ x: 25, y: 25 });

// Hook into our slider and use it to define an element
const xSlider = document.getElementById("x-slider") as SignalSlider;
const staticLine = new Line(() => ({ a: { x: xSlider.getValue(), y: 275 }, b: { x: 275, y: 25 } }));

// Now a time-dependent element:
const currentTime = timestamp();
const animateCheckbox = document.getElementById("animate-checkbox") as SignalCheckbox;
const pointB = new Point(() => {
    // Because we only call currentTime.getValue() when it's needed, we won't redraw every frame unless we're animating
    const t = animateCheckbox.getValue() ? currentTime.getValue() : 0;
    return {
        x: 225 + Math.sin(t * 0.0017) * 50,
        y: 225 - Math.cos(t * 0.0023) * 50
    };
});

// Next, define some elements derived from the above
const lineAB = new Line(() => ({ a: pointA.getParams(), b: pointB.getParams() }));
const intersection = Point.lineIntersection(lineAB, staticLine);

// Next, create the canvas we're going to draw on
const canvas = new SignalCanvas({ width: 300, height: 300, background: "#eee" });
document.body.appendChild(canvas.canvas);

// Add the elements we defined to the canvas, with some style information
canvas.add(pointA, { colour: 'blue', zIndex: 1 });
canvas.add(pointB, { colour: 'blue', zIndex: 1 });
canvas.add(lineAB);
canvas.add(staticLine, { colour: '#444', width: 0.5, dashes: [ 5, 2 ] });

// The styling options can also be functions and these too will automatically update
canvas.add(intersection, () => {
    const i = intersection.getParams()!;
    const a = pointA.getParams()!;
    const b = pointB.getParams()!;
    return {
        colour: i.x >= Math.min(a.x, b.x) && i.x <= Math.max(a.x, b.x) ? 'green' : 'red',
        zIndex: 1
    };
});
