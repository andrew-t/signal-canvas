import { NFSignal as Signal } from "./Signal";

// This is a helper function to run some code every time the browser redraws the document. It's mostly just boilerplate Javascript stuff.
export default function everyFrame(): Signal<DOMHighResTimeStamp> {
    const signal = new Signal<DOMHighResTimeStamp>(0);
    let start: DOMHighResTimeStamp;
    function drawFrame(time: DOMHighResTimeStamp): void {
        if (!start) start = time;
        const t = time - start;
        signal.setValue(t);
        requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);
    return signal;
}
