/* eslint-disable no-console */
import ms from "./dist/index.mjs";
import kr from "pretty-ms";

console.log(kr(ms("2s1ms", { compound: true }), { colonNotation: true }));