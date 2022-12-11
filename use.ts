/* eslint-disable no-console */
import { argv } from "process";
import ms from "./src";
const s = 1000 as const;
const m = 60000 as const;
const h = 3600000 as const;
const d = 86400000 as const;
function parseMs(ms: number) {
    if (typeof ms !== "number") {
        throw new TypeError("Expected a number");
    }

    return {
        d: Math.trunc(ms / d),
        h: Math.trunc(ms / h) % 24,
        m: Math.trunc(ms / m) % 60,
        s: Math.trunc(ms / s) % 60,
        ms: Math.trunc(ms) % 1000
    };
}
console.log(parseMs(ms(argv[2], { compound: true })));
console.log(ms(argv[2], { compound: true }));