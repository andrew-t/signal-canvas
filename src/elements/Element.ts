import { Getter, NFSignal as Signal, SignalSubscriber } from "../Signal.js";
import { GlobalOptions } from "../SignalCanvas.js";
import type SignalCanvasRaster from "../SignalCanvasRaster.js";
import type SignalCanvasVector from "../SignalCanvasVector.js";

export type Source<T> = T | Getter<T>;
export type ElementMappable<T> = Signal<T> | Element<T> | Source<T>;
export const SvgNS = "http://www.w3.org/2000/svg";

export default abstract class Element<T = any, O extends GlobalOptions = GlobalOptions> {
    private params: Signal<T>;
    private options: Signal<O>;

    constructor(params: ElementMappable<T>, options: ElementMappable<O>) {
        this.params = Element.paramsSignalFrom(params);
        this.options = Element.paramsSignalFrom(options);
    }

    getParams(): T {
        return this.params.getValue();
    }

    getOptions(): O {
        return this.options.getValue();
    }

    setParams(value: Source<T>): typeof this {
        this.params.setValue(value);
        return this;
    }

    setOptions(value: Source<O>): typeof this {
        this.options.setValue(value);
        return this;
    }

    abstract draw(canvas: SignalCanvasRaster): void;

    svgNode: SVGElement;
    abstract tagName: string;
    private createTag(tag: string, parent: SVGElement) {
        this.svgNode = document.createElementNS(SvgNS, tag) as SVGElement;
        if (parent) parent.appendChild(this.svgNode);
        const { zIndex } = this.getOptions();
        setSvgStyles(this.svgNode, {
            "z-index": zIndex?.toString() ?? "0"
        });
    }
    drawSvg(svg: SignalCanvasVector, parent: SVGElement) {
        if (!this.svgNode) this.createTag(this.tagName, parent);
        this.updateSvg(svg);
    }
    setSvgTag(tag: string) {
        if (this.svgNode.tagName != tag) {
            const parent = this.svgNode.parentNode as SVGElement;
            parent.removeChild(this.svgNode);
            this.createTag(tag, parent);
        }
    }
    abstract updateSvg(svg: SignalCanvasVector): void;

    static value<T>(object: ElementMappable<T>) {
        if (object instanceof Element) return object.getParams();
        return Signal.value(object);
    }

    static paramsSignalFrom<T>(object: ElementMappable<T>): Signal<T> {
        if (object instanceof Element) return object.params;
        return Signal.from(object);
    }

    subscribeParams(callback: SignalSubscriber<T>): void {
        this.params.subscribe(callback);
    }

    unsubscribeParams(callback: SignalSubscriber<T>): void {
        this.params.unsubscribe(callback);
    }

    subscribeOptions(callback: SignalSubscriber<O>): void {
        this.options.subscribe(callback);
    }

    unsubscribeOptions(callback: SignalSubscriber<O>): void {
        this.options.unsubscribe(callback);
    }

    subscribe(callback: () => void): void {
        this.params.subscribe(callback);
        this.options.subscribe(callback);
    }

    unsubscribe(callback: () => void): void {
        this.params.unsubscribe(callback);
        this.options.unsubscribe(callback);
    }
}

export function setSvgAttr(el: SVGElement, key: string, value: string) {
    el.setAttribute(key, value);
}

export function setSvgStyles(el: SVGElement, styles: Record<string, string>) {
    el.setAttribute("style", Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join("; "));
}