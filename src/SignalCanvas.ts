import { NFSignal as Signal } from "./Signal.js";
import type Element from "./elements/Element.js";
import type { PointParams } from "./elements/Point.js";
import InteractiveElement from "./elements/draggable/index.js";
import { isOnScreen } from "./utils/scrolling.js";

export interface SignalCanvasDimensions {
    width: number;
    height: number;
}

export interface GlobalOptions {
    zIndex?: number;
    disabled?: boolean;
    // TODO: maybe add "opacity" here?
}

export default class SignalCanvas extends HTMLElement {
    // Maybe this should be a set now??
    private elements = new Signal<Element[]>([]);
    private drawRequested = false;

    public readonly dimensions: Signal<SignalCanvasDimensions>;
    public readonly background: Signal<string>;
    public readonly disabled: Signal<boolean>;
    public readonly pixelDensity: Signal<number>;

    public canvas = document.createElement("canvas") as HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    public currentDrag: {
        start: PointParams;
        element: InteractiveElement<unknown, GlobalOptions>;
    } | null = null;
    public hoveredElement: InteractiveElement<unknown, GlobalOptions> | null = null;

    constructor() {
        super();
        this.appendChild(this.canvas);

        this.pixelDensity = new Signal(() => this.attrOr("pixel-density", devicePixelRatio));

        this.dimensions = new Signal(() => {
            const pixelDensity = this.pixelDensity.getValue();
            return {
                width: this.attrOr("width", this.clientWidth * pixelDensity),
                height: this.attrOr("height", this.clientWidth * pixelDensity)
            };
        });

        this.background = new Signal(this.getAttribute("background") ?? "white");

        const isOnScreen = this.isOnScreen();
        this.disabled = new Signal(() => !isOnScreen.getValue());

        this.canvas.addEventListener("mouseenter", this.updateHover);
        this.canvas.addEventListener("mousemove", this.updateHover);
        this.canvas.addEventListener("mousedown", this.startDrag);
        this.canvas.addEventListener("mouseup", this.releaseDrag);
        this.canvas.addEventListener("mouseleave", this.cancelHover);

        this.dimensions.subscribe(() => {
            const { width, height } = this.dimensions.getValue();
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext('2d')!;
            const pixelDensity = this.pixelDensity.getValue();
            this.ctx.scale(pixelDensity, pixelDensity);
            this.debouncedDraw();
        }, { runNow: true });
        this.elements.subscribe(this.debouncedDraw);
        setTimeout(() => this.draw());
    }

    updateSize = () => {
        this.dimensions.markDirty();
        this.pixelDensity.markDirty();
    }
    connectedCallback() { window.addEventListener("resize", this.updateSize); }
    disconnectedCallback() { window.removeEventListener("resize", this.updateSize); }
    isOnScreen(root?: HTMLElement | null) { return isOnScreen(this, root); }
    mouseCoords(e: MouseEvent): PointParams { return { x: e.offsetX, y: e.offsetY }; }

    attrOr(key: string, defaultValue: number): number {
        if (this.hasAttribute(key)) return parseFloat(this.getAttribute(key)!);
        return defaultValue;
    }

    add<T extends Element>(element: T): T {
        const current = this.elements.getValue();
        this.elements.setValue([...current, element]);
        element.subscribe(this.debouncedDraw);
        return element;
    }

    // this is called "delete" because HTML elements come with a function called "remove" that does something else
    delete<T extends Element>(element: T): T {
        const current = this.elements.getValue();
        this.elements.setValue(current.filter(e => e != element));
        element.unsubscribe(this.debouncedDraw);
        return element;
    }

    draw(): void {
        this.drawRequested = false;
        this.ctx.fillStyle = this.background.getValue();
        const dimensions = this.dimensions.getValue();
        this.ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        const elements = [ ...this.elements.getValue() ]
            .filter(element => !element.getOptions().disabled)
            .sort((a, b) => (a.getOptions().zIndex ?? 0) - (b.getOptions().zIndex ?? 0));
        for (const element of elements)
            element.draw(this);
    }

    debouncedDraw = (): void => {
        if (this.drawRequested) return;
        if (this.disabled.getValue()) return;
        this.drawRequested = true;
        setTimeout(() => this.draw(), 0);
    };

    updateHover = (e: MouseEvent) => {
        const coords = this.mouseCoords(e);
        if (this.currentDrag) {
            this.currentDrag.element.dragTo(
                coords,
                this.currentDrag.start
            );
            return;
        }
        let bestScore = 0;
        let bestElement: InteractiveElement<unknown, GlobalOptions> | null = null;
        for (const el of this.elements.getValue()) {
            if (!(el instanceof InteractiveElement)) continue;
            if (el.getOptions().disabled) continue;
            const score = el.hoverScore(coords);
            if (score > bestScore) {
                bestScore = score;
                bestElement = el;
            }
        }
        if (!bestElement) {
            this.cancelHover();
            return;
        }
        if (this.hoveredElement == bestElement) return;
        bestElement.hover.setValue(true);
        this.hoveredElement = bestElement;
        this.debouncedDraw();
        this.style.cursor = bestElement.canBeDragged ? "grab" : "pointer";
    };

    startDrag = (e: MouseEvent) => {
        if (!this.hoveredElement) return;
        this.currentDrag = {
            element: this.hoveredElement,
            start: this.mouseCoords(e)
        };
        this.currentDrag.element.active.setValue(true);
        this.debouncedDraw();
    };

    releaseDrag = () => {
        if (!this.currentDrag) return;
        this.currentDrag.element.active.setValue(false);
        this.currentDrag = null;
        this.debouncedDraw();
    };

    cancelHover = () => {
        this.releaseDrag();
        if (!this.hoveredElement) return;
        this.hoveredElement.hover.setValue(false);
        this.hoveredElement = null;
        this.debouncedDraw();
        this.style.cursor = "auto";
    };
}

window.customElements.define("signal-canvas", SignalCanvas);
