import { NFSignal as Signal } from "./Signal.js";

export const Point = Symbol("Point"),
    Line = Symbol("Line");

export default class SignalCanvas {
    constructor(options) {
        this._elements = [];
        this._drawRequested = false;
        this.setOptions(Signal.map(options));
    }

    setOptions(options) {
        Signal.unsubscribe(options, this._updateOptions);
        this._options = options;
        Signal.subscribe(options, this._updateOptions);
        this._updateOptions();
    }

    getOptions() {
        return Signal.value(this._options);
    }

    /** options can be a signal too, or a { colour, zIndex } */
    add(element, options = {}) {
        options = Signal.map(options);
        this._elements.push({ element, options });
        element.subscribe(this.debouncedDraw);
        Signal.subscribe(options, this.debouncedDraw);
        this.debouncedDraw();
    }
    remove(element) {
        element.unsubscribe(this.debouncedDraw);
        for (let i = this._elements.length - 1; i >= 0; --i) {
            if (this._elements.element != element) continue;
            Signal.unsubscribe(this._elements.options, this.debouncedDraw);
            this._elements.splice(i, 1);
        }
        this.debouncedDraw();
    }

    clear() {
        const options = this.getOptions();
        this.ctx.fillStyle = options.background;
        this.ctx.fillRect(0, 0, 300, 300);
    }

    _updateOptions() {
        const options = this.getOptions();
        this.canvas = document.createElement("canvas");
        canvas.width = options.width;
        canvas.height = options.height;
        this.ctx = canvas.getContext('2d');
        this.debouncedDraw();
    }

    draw() {
        this._drawRequested = false;
        this.clear();
        const elements = [ ...this._elements ]
            .map(({ element, options}) => ({
                type: element.type,
                params: element.getParams(),
                options: Signal.value(options)
            }))
            .sort((a, b) => (a.options.zIndex ?? 0) - (b.options.zIndex ?? 0));
        for (const { type, params, options } of elements) {
            if (!params) continue;
            switch (type) {
                case Point:
                    this.ctx.fillStyle = options.colour ?? "black";
                    this.ctx.beginPath();
                    this.ctx.arc(params.x, params.y, options.radius ?? 5, 0, Math.PI * 2, true);
                    this.ctx.fill();
                    break;
                case Line:
                    this.ctx.strokeStyle = options.colour ?? "black";
                    this.ctx.strokeWidth = options.width ?? 1;
                    this.ctx.setLineDash(options.dashes ?? []);
                    this.ctx.beginPath();
                    this.ctx.moveTo(params.a.x, params.a.y);
                    this.ctx.lineTo(params.b.x, params.b.y);
                    this.ctx.stroke();
                    break;
                default:
                    throw new Error("Unexpected type: " + type);
            }
        }
    }

    debouncedDraw = () => {
        if (this._drawRequested) return;
        this._drawRequested = true;
        setTimeout(() => this.draw(), 0);
    }
}
