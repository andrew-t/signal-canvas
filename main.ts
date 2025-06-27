// Import the classes we need to make this work
import {
    Line, Point,
    everyFrame,
    SignalCanvas, SignalSlider, SignalCheckbox,
    Label, TextAlign,
    Circle,
    Angle, AngleUnit,
    DraggablePoint, Anywhere
} from "./src";

// Start by defining some hard-coded elements
const pointA = new DraggablePoint({ x: 25, y: 25 }, Anywhere)
    // styling options are separate from geometric options and are applied like this:
    .setOptions({ zIndex: 1 });

// Hook into our slider and use it to define an element
const xSlider = document.getElementById("x-slider") as SignalSlider;
const staticLine = new Line(
        // We have to pass the start point in as a function so that it will update as we change the slider value
        () => ({ x: xSlider.getValue(), y: 275 }),
        { x: 275, y: 25 }
    )
    .setOptions({
        colour: '#444',
        width: 0.5,
        dashes: [ 5, 2 ],
        extendPastA: true,
        extendPastB: true
    });

// Now a time-dependent element:
const currentTime = everyFrame();
const animateCheckbox = document.getElementById("animate-checkbox") as SignalCheckbox;
const pointB = new Point(() => {
        // Because we only call currentTime.getValue() when it's needed, we won't redraw every frame unless we're animating
        const t = animateCheckbox.getValue() ? currentTime.getValue() : 0;
        return {
            x: 225 + Math.sin(t * 0.0017) * 50,
            y: 225 - Math.cos(t * 0.0023) * 50
        };
    })
    .setOptions({ zIndex: 1 });

// Next, define some elements derived from the above
// Note that these functions wire up all the automatic updates for us — we just pass the "ingredients" in and everything is taken care of
const lineAB = new Line(pointA.point, pointB);

// The styling options can also be functions and these too will automatically update
const intersection = Point.lineIntersection(lineAB, staticLine)
    .setOptions(() => {
        const i = intersection.getParams()!;
        const a = pointA.point.getParams()!;
        const b = pointB.getParams()!;
        return {
            colour: i.x >= Math.min(a.x, b.x) && i.x <= Math.max(a.x, b.x) ? 'green' : 'red',
            zIndex: 1
        };
    });

// Next, hook up to the canvas we're going to draw on
const canvas = document.getElementById("test-canvas") as SignalCanvas;

// Add the elements we defined to the canvas
canvas.add(pointA);
canvas.add(pointB);
canvas.add(lineAB);
canvas.add(staticLine);
canvas.add(intersection);

// Add and create it in one step if you won't need to refer to the element again
canvas.add(
    new Label("Intersection point", intersection.add({ x: -5, y: -5 }))
        .setOptions({
            font: "italic 16px serif",
            zIndex: 2,
            align: TextAlign.RightAlign,
            colour: '#060'
        })
);

// You can also call .setOptions on the return from .add if that's simpler
canvas.add(new Angle(pointA.point, intersection, { x: 275, y: 25 }))
    .setOptions({
        line: { colour: '#06c' },
        zIndex: -1,
        showValue: true,
        name: "θ",
        decimalPlaces: 0,
        unit: AngleUnit.Degrees
    });

canvas.add(new Circle(pointB, pointB.distanceTo(intersection)))
    .setOptions({ colour: '#ccf', zIndex: -1 });
