import { NFSignal as Signal } from "../Signal";

export function isOnScreen(
    element: HTMLElement,
    root?: HTMLElement | null
) {
    const signal = new Signal(false);
    const observer = new IntersectionObserver(
        (entries) => {
            let entry = entries[0];
            for (let i = 1; i < entries.length; ++i)
                if (entries[i].time > entry.time)
                    entry = entries[i];
            signal.setValue(entry.isIntersecting);
        },
        { root }
    );
    observer.observe(element);
    return signal;
}
