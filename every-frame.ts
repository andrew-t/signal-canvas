// This is a helper function to run some code every time the browser redraws the document. It's mostly just boilerplate Javascript stuff.
export default function everyFrame(callback: FrameRequestCallback) {
    let start: DOMHighResTimeStamp;
    function drawFrame(time: DOMHighResTimeStamp): void {
        if (!start) start = time;
        const t = time - start;
        callback(t);
        requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);
}
