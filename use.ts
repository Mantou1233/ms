/* eslint-disable no-console */
import ms from "./src";

console.log(ms(ms("1y3d1h2m3s", {compound: true}), {}));