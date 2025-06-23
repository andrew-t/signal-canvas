import { NFSignal as Signal, SignalMappable } from "./Signal.js";
import type Element from "./elements/Element.js";

export interface SignalCanvasOptions {
    width: number;
    height: number;
    background?: string;
}

// One day we might have a better way of doing this than "what is the third parameter to the draw function" but hey, this works
type ElementOptions<T extends Element> = Parameters<T["draw"]>[1];

export interface GlobalOptions {
    zIndex?: number;
    // TODO: maybe add "disabled" and "opacity" here?
}

export default class SignalCanvas extends HTMLElement {
    private elements: Array<{ element: Element, options: Signal<GlobalOptions> }> = [];
    private drawRequested = false;
    private options: Signal<SignalCanvasOptions>;
    public canvas = document.createElement("canvas") as HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    constructor() {
        super();
        this.appendChild(this.canvas);
        this.setOptions({
            width: parseInt(this.getAttribute("width") ?? "100", 10),
            height: parseInt(this.getAttribute("height") ?? "100", 10),
            background: this.getAttribute("background") ?? "white"
        });
    }

    setOptions(options: SignalMappable<SignalCanvasOptions>) {
        this.options = Signal.from(options);
        this.options.unsubscribe(this.updateOptions);
        this.options.subscribe(this.updateOptions);
        this.updateOptions();
    }

    getOptions(): SignalCanvasOptions {
        return Signal.value(this.options);
    }

    add<T extends Element>(
        element: T,
        options: SignalMappable<ElementOptions<T> & GlobalOptions> = {}
    ): void {
        const optionSignal = Signal.from(options);
        this.elements.push({ element, options: optionSignal });
        element.subscribe(this.debouncedDraw);
        optionSignal.subscribe(this.debouncedDraw);
        this.debouncedDraw();
    }

    // this is called "delete" because HTML elements come with a function called "remove" that does something else
    delete(element: Element): void {
        element.unsubscribe(this.debouncedDraw);
        for (let i = this.elements.length - 1; i >= 0; --i) {
            if (this.elements[i].element != element) continue;
            this.elements[i].options.unsubscribe(this.debouncedDraw);
            this.elements.splice(i, 1);
        }
        this.debouncedDraw();
    }

    private updateOptions(): void {
        const options = this.getOptions();
        this.canvas.width = options.width;
        this.canvas.height = options.height;
        this.ctx = this.canvas.getContext('2d')!;
        this.debouncedDraw();
    }

    draw(): void {
        this.drawRequested = false;
        const options = this.getOptions();
        this.ctx.fillStyle = options.background ?? "white";
        this.ctx.fillRect(0, 0, 300, 300);
        const elements = [ ...this.elements ]
            .map(({ element, options}) => ({
                element,
                options: Signal.value(options)
            }))
            .sort((a, b) => (a.options.zIndex ?? 0) - (b.options.zIndex ?? 0));
        for (const { element, options } of elements)
            element.draw(this, options);
    }

    debouncedDraw = (): void => {
        if (this.drawRequested) return;
        this.drawRequested = true;
        setTimeout(() => this.draw(), 0);
    };
}

window.customElements.define("signal-canvas", SignalCanvas);
