import { Getter, NFSignal as Signal, SignalSubscriber } from "../Signal.js";
import { GlobalOptions } from "../SignalCanvas.js";
import type SignalCanvasRaster from "../SignalCanvasRaster.js";
import type SignalCanvasVector from "../SignalCanvasVector.js";
import SignalGroup, { OptionalSourceMap, SignalMap, SourceMap } from "../SignalGroup.js";

export type Source<T> = T | Getter<T>;
export const SvgNS = "http://www.w3.org/2000/svg";

export default abstract class Element<T extends GlobalOptions = any> {
    public readonly signals: SignalGroup<T>;
    public readonly params: SignalMap<T>;

    constructor(params: OptionalSourceMap<T, keyof GlobalOptions>) {
        this.signals = new SignalGroup<T>({
            zIndex: 0,
            disabled: false,
            ...params
        } as SourceMap<T>);
        this.params = this.signals.signals;
    }

    abstract draw(canvas: SignalCanvasRaster): void;

    svgNode: SVGElement;
    abstract tagName: string;
    private createTag(tag: string, parent: SVGElement) {
        this.svgNode = document.createElementNS(SvgNS, tag) as SVGElement;
        if (parent) parent.appendChild(this.svgNode);
        const zIndex = this.params.zIndex.getValue();
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
}

export function setSvgAttr(el: SVGElement, key: string, value: string) {
    el.setAttribute(key, value);
}

export function setSvgStyles(el: SVGElement, styles: Record<string, string>) {
    el.setAttribute("style", Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join("; "));
}