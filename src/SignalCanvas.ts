import { NFSignal as Signal, SignalMappable } from "./Signal.js";
import type Element from "./elements/Element.js";

export interface SignalCanvasOptions {
    width: number;
    height: number;
    background?: string;
}

// One day we might have a better way of doing this than "what is the third parameter to the draw function" but hey, this works
type ElementOptions<T extends Element> = Parameters<T["draw"]>[2];

export interface GlobalOptions {
    zIndex?: number;
    // TODO: maybe add "disabled" and "opacity" here?
}

export default class SignalCanvas {
    private elements: Array<{ element: Element, options: any }> = [];
    private drawRequested = false;
    private options: Signal<SignalCanvasOptions>;
    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(options: SignalMappable<SignalCanvasOptions>) {
        this.setOptions(Signal.from(options));
    }

    setOptions(options: Signal<SignalCanvasOptions>) {
        Signal.unsubscribe(options, this.updateOptions);
        this.options = options;
        Signal.subscribe(options, this.updateOptions);
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

    remove(element: Element): void {
        element.unsubscribe(this.debouncedDraw);
        for (let i = this.elements.length - 1; i >= 0; --i) {
            if (this.elements[i].element != element) continue;
            Signal.unsubscribe(this.elements[i].options, this.debouncedDraw);
            this.elements.splice(i, 1);
        }
        this.debouncedDraw();
    }

    private updateOptions(): void {
        const options = this.getOptions();
        this.canvas = document.createElement("canvas");
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
            element.draw(this.canvas, this.ctx, options);
    }

    debouncedDraw = (): void => {
        if (this.drawRequested) return;
        this.drawRequested = true;
        setTimeout(() => this.draw(), 0);
    }
}
