// This is a helper function to run some code every time the browser redraws the document. It's mostly just boilerplate Javascript stuff.
export default function everyFrame(callback) {
    let start;
    function drawFrame(time) {
        if (!start) start = time;
        const t = time - start;
        callback(t);
        requestAnimationFrame(drawFrame);
    }
    drawFrame();
}
