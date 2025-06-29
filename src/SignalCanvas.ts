import { NFSignal as Signal } from "./Signal";
import type Element from "./elements/Element";
import InteractiveElement from "./elements/draggable/index";
import { Vector } from "./utils/Vector";
import { isOnScreen } from "./utils/scrolling";

export interface SignalCanvasDimensions {
    width: number;
    height: number;
}

export interface GlobalOptions {
    zIndex: number;
    disabled: boolean;
    // TODO: maybe add "opacity" here?
}

export default abstract class SignalCanvas extends HTMLElement {
    /** All the things on the canvas */
    protected elements = new Signal<Element[]>([]);

    private drawSignal = new Signal(() => this.drawFrame());

    /** Whether we need to refresh the view on the next frame */
    private drawRequested = false;

    /** The "CSS-pixels" dimensions of the canvas */
    public readonly dimensions: Signal<SignalCanvasDimensions>;

    /** The background colour */
    public readonly background: Signal<string>;

    /** If true, do not update anything on the canvas */
    public readonly disabled: Signal<boolean>;

    public hoveredElement: InteractiveElement | null = null;

    public currentDrag: {
        start: Vector;
        current: Vector;
        element: InteractiveElement;
        touchId: number | undefined;
    } | null = null;

    constructor() {
        super();

        this.dimensions = new Signal(() => ({
            width: this.attrOr("width", this.clientWidth),
            height: this.attrOr("height", this.clientHeight)
        }));

        this.background = new Signal(this.getAttribute("background") ?? "white");

        const isOnScreen = this.isOnScreen();
        this.disabled = new Signal(() => !isOnScreen.getValue());

        this.elements.subscribe(this.debouncedDraw);
        this.drawSignal.subscribe(this.debouncedDraw);
        setTimeout(() => this.draw());
    }

    updateSize() { this.dimensions.markDirty(); }
    private _updateSize = () => this.updateSize();
    connectedCallback() { window.addEventListener("resize", this._updateSize); }
    disconnectedCallback() { window.removeEventListener("resize", this._updateSize); }

    isOnScreen(root?: HTMLElement | null) { return isOnScreen(this, root); }
    mouseCoords(e: MouseEvent): Vector { return { x: e.offsetX, y: e.offsetY }; }
    touchCoords(e: Touch): Vector {
        const a = this.getBoundingClientRect();
        return { x: e.clientX - a.left, y: e.clientY - a.top };
    }

    protected attrOr(key: string, defaultValue: number): number {
        if (this.hasAttribute(key)) return parseFloat(this.getAttribute(key)!);
        return defaultValue;
    }

    add<T extends Element>(element: T): T {
        const current = this.elements.getValue();
        if (current.includes(element)) return element;
        this.elements.setValue([...current, element]);
        return element;
    }

    // this is called "delete" because HTML elements come with a function called "remove" that does something else
    delete<T extends Element>(element: T): T {
        const current = this.elements.getValue();
        this.elements.setValue(current.filter(e => e != element));
        return element;
    }

    protected abstract drawFrame(): void;
    draw(): void {
        this.drawRequested = false;
        this.drawSignal.getValue();
    }
    debouncedDraw = (): void => {
        if (this.drawRequested) return;
        if (this.disabled.getValue()) return;
        this.drawRequested = true;
        setTimeout(() => this.draw(), 0);
    };

    startDrag(el: InteractiveElement, e?: MouseEvent | null, touch?: Touch) {
        const coords = e ? this.mouseCoords(e) : touch ? this.touchCoords(touch) : el.dragPos();
        this.currentDrag = {
            element: el,
            start: coords,
            current: coords,
            touchId: touch?.identifier
        };
        el.params.active.setValue(true);
        this.style.cursor = "grabbing";
    };

    releaseDrag = () => {
        if (!this.currentDrag) return;
        this.currentDrag.element.params.active.setValue(false);
        this.currentDrag = null;
        this.style.cursor = "grab";
    };
}

