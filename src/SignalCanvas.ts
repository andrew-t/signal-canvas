import { NFSignal as Signal, SignalMappable } from "./Signal.js";
import type Element from "./elements/Element.js";
import { isOnScreen } from "./utils/scrolling.js";

export interface SignalCanvasOptions {
    width: number;
    height: number;
    background?: string;
    disabled: boolean;
}

export interface GlobalOptions {
    zIndex?: number;
    disabled?: boolean;
    // TODO: maybe add "opacity" here?
}

export default class SignalCanvas extends HTMLElement {
    // Maybe this should be a set now??
    private elements: Element[] = [];
    private drawRequested = false;
    private options: Signal<SignalCanvasOptions>;
    public canvas = document.createElement("canvas") as HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    constructor() {
        super();
        this.appendChild(this.canvas);
        const isOnScreen = this.isOnScreen();
        this.setOptions(() => ({
            width: parseInt(this.getAttribute("width") ?? "100", 10),
            height: parseInt(this.getAttribute("height") ?? "100", 10),
            background: this.getAttribute("background") ?? "white",
            disabled: !isOnScreen.getValue()
        }));
    }

    isOnScreen(root?: HTMLElement | null) {
        return isOnScreen(this, root);
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

    add<T extends Element>(element: T): T {
        this.elements.push(element);
        element.subscribe(this.debouncedDraw);
        this.debouncedDraw();
        return element;
    }

    // this is called "delete" because HTML elements come with a function called "remove" that does something else
    delete<T extends Element>(element: T): T {
        element.unsubscribe(this.debouncedDraw);
        for (let i = this.elements.length - 1; i >= 0; --i) {
            if (this.elements[i] != element) continue;
            this.elements.splice(i, 1);
        }
        this.debouncedDraw();
        return element;
    }

    private updateOptions = () => {
        const options = this.getOptions();
        this.canvas.width = options.width;
        this.canvas.height = options.height;
        this.ctx = this.canvas.getContext('2d')!;
        this.debouncedDraw();
    };

    draw(): void {
        this.drawRequested = false;
        const options = this.getOptions();
        this.ctx.fillStyle = options.background ?? "white";
        this.ctx.fillRect(0, 0, 300, 300);
        const elements = [ ...this.elements ]
            .filter(element => !element.getOptions().disabled)
            .sort((a, b) => (a.getOptions().zIndex ?? 0) - (b.getOptions().zIndex ?? 0));
        for (const element of elements)
            element.draw(this);
    }

    debouncedDraw = (): void => {
        if (this.drawRequested) return;
        if (this.getOptions().disabled) return;
        this.drawRequested = true;
        setTimeout(() => this.draw(), 0);
    };
}

window.customElements.define("signal-canvas", SignalCanvas);
