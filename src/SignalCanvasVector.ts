import SignalCanvas from "./SignalCanvas";
import { setSvgAttr, setSvgStyles, SvgNS } from "./elements/Element.js";
import InteractiveElement from "./elements/draggable/index";

export default class SignalCanvasVector extends SignalCanvas {
    svg = document.createElementNS(SvgNS, "svg") as SVGElement;
    bg = document.createElementNS(SvgNS, "rect") as SVGElement;

    constructor() {
        super();    
        this.appendChild(this.svg);
        this.svg.appendChild(this.bg);
        setSvgAttr(this.bg, "x", "0");
        setSvgAttr(this.bg, "t", "0");

        this.dimensions.subscribe(() => {
            const dim = this.dimensions.getValue();
            setSvgAttr(this.svg, "viewBox", `0 0 ${dim.width} ${dim.height}`);
            setSvgAttr(this.svg, "width", `${dim.width}`);
            setSvgAttr(this.svg, "height", `${dim.height}`);
            setSvgAttr(this.bg, "width", `${dim.width}`);
            setSvgAttr(this.bg, "height", `${dim.height}`);
        }, { runNow: true });

        this.background.subscribe(
            () => setSvgStyles(this.bg, ({ fill: this.background.getValue() })),
            { runNow: true }
        );

        this.addEventListener("mouseover", e => {
            const target = this.getTarget(e.target as Element);
            if (!target) return;
            this.hoveredElement = target;
            target.hover.setValue(true);
            this.debouncedDraw();
        });

        this.addEventListener("mouseout", e => {
            const target = this.getTarget(e.target as Element);
            if (!target) return;
            if (this.hoveredElement == target) this.hoveredElement = null;
            target.hover.setValue(false);
            this.debouncedDraw();
        });

        this.addEventListener("mouseleave", this.releaseDrag);
        this.addEventListener("mouseup", this.releaseDrag);

        // TODO: add touch-gesture handlers for mobile
        this.addEventListener("mousedown", e => {
            const target = this.getTarget(e.target as Element);
            if (!target) return;
            if (target.canBeDragged) this.startDrag(target, e);
        });

        this.addEventListener("touchstart", (e) => {
            if (this.currentDrag) return;
            for (const touch of e.changedTouches) {
                const target = this.getTarget(touch.target as Element);
                if (!target) continue;
                if (target.canBeDragged) {
                    this.startDrag(target, null, touch);
                    e.preventDefault();
                    return;
                }
            }
        });

        function endTouch(e: TouchEvent) {
            if (!this.currentDrag) return;
            for (const touch of e.changedTouches)
                if (touch.identifier == this.currentDrag!.touchId) {
                    this.releaseDrag();
                    e.preventDefault();
                    return;
                }
        }
        this.addEventListener("touchend", endTouch);
        this.addEventListener("touchcancel", endTouch);

        this.addEventListener("touchmove", e => {
            if (!this.currentDrag) return;
            for (const touch of e.changedTouches)
                if (touch.identifier == this.currentDrag!.touchId) {
                    this.currentDrag!.element.dragTo(this.touchCoords(touch), this.currentDrag!.start);
                    e.preventDefault();
                    return;
                }
        });

        this.addEventListener("mousemove", e => {
            if (!this.currentDrag) {
                this.style.cursor = "unset";
                return;
            }
            this.currentDrag.current = this.mouseCoords(e);
            this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
        });

        this.addEventListener("keydown", e => {
            if (this.currentDrag) {
                switch (e.key) {
                    case " ":
                        this.releaseDrag();
                        break;
                    case "ArrowUp":
                        this.currentDrag.current = { x: this.currentDrag.current.x, y: this.currentDrag.current.y - 10 };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                        break;
                    case "ArrowDown":
                        this.currentDrag.current = { x: this.currentDrag.current.x, y: this.currentDrag.current.y + 10 };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                        break;
                    case "ArrowLeft":
                        this.currentDrag.current = { x: this.currentDrag.current.x - 10, y: this.currentDrag.current.y };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                        break;
                    case "ArrowRight":
                        this.currentDrag.current = { x: this.currentDrag.current.x + 10, y: this.currentDrag.current.y };
                        this.currentDrag.element.dragTo(this.currentDrag.current, this.currentDrag.start);
                        break;
                    default: return;
                }
                e.preventDefault();
                this.debouncedDraw();
                return;
            }
            const target = this.getTarget(e.target as Element);
            if (!target) return;
            if (e.key == " " && target.canBeDragged) {
                this.startDrag(target);
                e.preventDefault();
            }
        });
    }

    protected drawFrame(): void {
        const elements = [ ...this.elements.getValue() ]
            .filter(element => !element.getOptions().disabled)
            .sort((a, b) => (a.getOptions().zIndex ?? 0) - (b.getOptions().zIndex ?? 0));
        for (const el of elements)
            el.drawSvg(this, this.svg);
    }

    getTarget(el: Element): InteractiveElement | null {
        while (el.parentNode != this.svg) {
            if (el == this) return null;
            el = el.parentNode as Element;
        }
        for (const c of this.elements.getValue()) {
            if (!(c instanceof InteractiveElement)) continue;
            if (c.svgNode == el) return c;
        }
        return null;
    }
}

window.customElements.define("signal-svg", SignalCanvasVector);
