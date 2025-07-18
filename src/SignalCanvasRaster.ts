import { NFSignal as Signal } from "./Signal.js";
import SignalCanvas, { SignalCanvasDimensions } from "./SignalCanvas";
import InteractiveElement from "./elements/draggable/index";

export default class SignalCanvasRaster extends SignalCanvas {
    
    public readonly pixelDensity: Signal<number>;
    public readonly scaledDimensions: Signal<SignalCanvasDimensions>;

    public canvas = document.createElement("canvas") as HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    // We need to fake hover and focus if we're just doing pixels on a canvas
    public focusElement: InteractiveElement | null = null;

    constructor() {
        super();
        this.appendChild(this.canvas);

        // Account for pixel density
        this.pixelDensity = new Signal(() => this.attrOr("pixel-density", devicePixelRatio));
        this.scaledDimensions = new Signal(() => {
            const pixelDensity = this.pixelDensity.getValue();
            const dimensions = this.dimensions.getValue();
            return {
                width: dimensions.width * pixelDensity,
                height: dimensions.height * pixelDensity
            };
        });

        // Redraw if the canvas resizes
        this.scaledDimensions.subscribe(() => {
            const { width, height } = this.scaledDimensions.getValue();
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext('2d')!;
            const pixelDensity = this.pixelDensity.getValue();
            this.ctx.scale(pixelDensity, pixelDensity);
            this.debouncedDraw();
        }, { runNow: true });

        this.canvas.addEventListener("mouseenter", this.updateHover);
        this.canvas.addEventListener("mousemove", this.updateHover);
        this.canvas.addEventListener("mousedown", e => {
            if (this.hoveredElement) this.startDrag(this.hoveredElement, e);
        });
        this.canvas.addEventListener("mouseup", this.releaseDrag);
        this.canvas.addEventListener("mouseleave", this.cancelHover);
        
        this.elements.subscribe(() => {
            const elements = this.elements.getValue().filter(el => el instanceof InteractiveElement);
            if (elements.length == 0) {
                this.tabIndex = -1;
                return;
            }
            this.tabIndex = 0;
            this.focusElement = elements[0];
            this.debouncedDraw();
        });

        this.addEventListener("keydown", (e: KeyboardEvent) => {
            const elements = this.elements.getValue().filter(el => el instanceof InteractiveElement);
            switch (e.key) {
                case "ArrowUp":
                    if (this.currentDrag) {
                        this.currentDrag.current = {
                            x: this.currentDrag.current.x,
                            y: this.currentDrag.current.y - 10
                        };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                    }
                    break;
                case "ArrowDown":
                    if (this.currentDrag) {
                        this.currentDrag.current = {
                            x: this.currentDrag.current.x,
                            y: this.currentDrag.current.y + 10
                        };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                    }
                    break;
                case "ArrowLeft":
                    if (this.currentDrag) {
                        this.currentDrag.current = {
                            x: this.currentDrag.current.x - 10,
                            y: this.currentDrag.current.y
                        };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                    } else {
                        const i = elements.indexOf(this.focusElement!);
                        this.focusElement?.params.hover.setValue(false);
                        this.focusElement = elements[(i + elements.length - 1) % elements.length];
                        this.focusElement?.params.hover.setValue(true);
                    }
                    break;
                case "ArrowRight":
                    if (this.currentDrag) {
                        this.currentDrag.current = {
                            x: this.currentDrag.current.x + 10,
                            y: this.currentDrag.current.y
                        };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                    } else {
                        const i = elements.indexOf(this.focusElement!);
                        this.focusElement?.params.hover.setValue(false);
                        this.focusElement = elements[(i + 1) % elements.length];
                        this.focusElement?.params.hover.setValue(true);
                    }
                    break;
                case " ":
                    if (this.currentDrag) this.releaseDrag();
                    else if (this.focusElement?.canBeDragged) this.startDrag(this.focusElement);
                    break;
                default: console.log(e.key); return;
            }
            e.preventDefault();
        });
        
        this.addEventListener("focus", () => {
            this.focusElement?.params.hover.setValue(true);
        });
        this.addEventListener("blur", () => {
            this.focusElement?.params.hover.setValue(false);
        });
    }

    updateSize() {
        super.updateSize();
        this.pixelDensity.markDirty();
    }

    drawFrame(): void {
        this.ctx.fillStyle = this.background.getValue();
        const dimensions = this.scaledDimensions.getValue();
        this.ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        const elements = [ ...this.elements.getValue() ]
            .filter(element => !element.params.disabled.getValue())
            .sort((a, b) => a.params.zIndex.getValue() - b.params.zIndex.getValue());
        for (const element of elements)
            element.draw(this);
    }

    updateHover = (e: MouseEvent) => {
        const coords = this.mouseCoords(e);
        if (this.currentDrag) {
            this.currentDrag.element.dragTo(
                coords,
                this.currentDrag.start
            );
            this.currentDrag.current = coords;
            return;
        }
        let bestScore = 0;
        let bestElement: InteractiveElement | null = null;
        for (const el of this.elements.getValue()) {
            if (!(el instanceof InteractiveElement)) continue;
            if (el.params.disabled.getValue()) continue;
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
        bestElement.params.hover.setValue(true);
        this.hoveredElement = bestElement;
        this.style.cursor = bestElement.canBeDragged ? "grab" : "pointer";
    };

    cancelHover = () => {
        this.releaseDrag();
        if (!this.hoveredElement) return;
        this.hoveredElement.params.hover.setValue(false);
        this.hoveredElement = null;
        this.style.cursor = "auto";
    };
}

window.customElements.define("signal-canvas", SignalCanvasRaster);
