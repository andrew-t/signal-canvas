// Import the classes we need to make this work
import {
    Line, Point,
    everyFrame,
    SignalCanvas, SignalSlider, SignalCheckbox,
    Label, TextAlign,
    Circle,
    Angle, AngleUnit,
    DraggablePoint, Anywhere,
    OnALine,
    NFSignal as Signal,
    lineIntersection,
    add,
    distance
} from "./src";

// Start by defining some hard-coded elements
const pointA = new DraggablePoint({
    params: { x: 25, y: 25 },
    locus: Anywhere,
    zIndex: 5
});

// Hook into our slider and use it to define an element
const xSlider = document.getElementById("x-slider") as SignalSlider;
const staticLine = new Line({
    // We have to pass the start point in as a function so that it will update as we change the slider value
    a: () => ({ x: xSlider.getValue(), y: 275 }),
    b: { x: 275, y: 25 },
    colour: '#444',
    width: 0.5,
    dashes: [ 5, 2 ],
    extendPastA: true,
    extendPastB: true
});

const slp = new DraggablePoint({
    params: 0.1,
    locus: () => OnALine(
        staticLine.params.a.getValue()!,
        staticLine.params.b.getValue()!
    ),
    zIndex: 5
});

// Now a time-dependent element:
const currentTime = everyFrame();
const animateCheckbox = document.getElementById("animate-checkbox") as SignalCheckbox;
const pointB = new Point({
    location: () => {
        // Because we only call currentTime.getValue() when it's needed, we won't redraw every frame unless we're animating
        const t = animateCheckbox.getValue() ? currentTime.getValue() : 0;
        return {
            x: 225 + Math.sin(t * 0.0017) * 50,
            y: 225 - Math.cos(t * 0.0023) * 50
        };
    },
    zIndex: 1
});

// Next, define some elements derived from the above
// Note that these functions wire up all the automatic updates for us — we just pass the "ingredients" in and everything is taken care of
const lineAB = new Line({
    a: pointA.point.params.location,
    b: pointB.params.location
});

// The styling options can also be functions and these too will automatically update
const intersectionLocation = new Signal(lineIntersection(
    pointA.point, pointB,
    staticLine.params.a, staticLine.params.b
));
const intersection = new Point({
    location: intersectionLocation,
    zIndex: 1,
    colour: () => {
        const i = intersectionLocation.getValue();
        const a = pointA.getLocation();
        const b = pointB.params.location.getValue();
        if (!i || !a || !b) return "red";
        return i.x >= Math.min(a.x, b.x) && i.x <= Math.max(a.x, b.x) ? 'green' : 'red';
    }
});

// Next, hook up to the canvas we're going to draw on
const canvas = document.getElementById("test-canvas") as SignalCanvas;

// Add the elements we defined to the canvas
canvas.add(pointA);
canvas.add(pointB);
canvas.add(lineAB);
canvas.add(staticLine);
canvas.add(intersection);
canvas.add(slp);

// Add and create it in one step if you won't need to refer to the element again
canvas.add(
    new Label({
        text: "Intersection point",
        location: add(intersection, { x: -5, y: -5 }),
        font: "italic 16px serif",
        zIndex: 2,
        align: TextAlign.RightAlign,
        colour: '#060'
    })
);

// You can also call .setOptions on the return from .add if that's simpler
canvas.add(new Angle({
    from: pointA.point.params.location,
    hinge: intersection.params.location,
    to: { x: 275, y: 25 },
    lineColour: '#06c',
    zIndex: 0.5,
    showValue: true,
    name: "θ",
    decimalPlaces: 0,
    unit: AngleUnit.Degrees
}));

canvas.add(new Circle({
    centre: pointB.params.location,
    radius: distance(pointB, intersection),
    colour: '#ccf',
    zIndex: -1
}));
