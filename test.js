import { NFSignal as Signal } from "./Signal.js";

const a = new Signal(4, "a");

a.subscribe(value => console.log("A IS NOW", value));

const alsoA = new Signal(a, "aa");
const twiceA = new Signal(() => a.getValue() * 2, "2a");

console.log(a._subs);
console.log(twiceA._sources);

console.log(a.getValue());
console.log(alsoA.getValue());
console.log(twiceA.getValue());

a.setValue(5);

console.log(a.getValue());
console.log(alsoA.getValue());
console.log(twiceA.getValue());

const twiceAPlusOne = new Signal(() => twiceA.getValue() + 1, "2a+1");
console.log(twiceAPlusOne);
a.setValue(() => twiceAPlusOne.getValue() + 3);
