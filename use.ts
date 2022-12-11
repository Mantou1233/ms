/* eslint-disable no-console */
import ms from "./src";
import kr from "pretty-ms";

console.log(kr(ms("2s"), { colonNotation: true }));