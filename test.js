import { NFSignal as Signal } from "./Signal.js";

const a = new Signal(4);
const alsoA = new Signal(a);
const twiceA = new Signal(() => a.getValue() * 2);

console.log(a._subs);
console.log(twiceA._sources);

console.log(a.getValue());
console.log(alsoA.getValue());
console.log(twiceA.getValue());

a.setValue(5);

console.log(a.getValue());
console.log(alsoA.getValue());
console.log(twiceA.getValue());
