/* eslint-disable @typescript-eslint/no-unused-vars */
// helpers
const s = 1000 as const;
const m = 60000 as const;
const h = 3600000 as const;
const d = 86400000 as const;
const w = 604800000 as const;
const y = 31557600000 as const;

interface Options {
    /**
     * allow multiple inputs, e.g. `2y3s`
     */
    compound: boolean;

    /**
     * disallow duplicate inputs when allow multiple inputs, e.g. `2y3y4y` will return NaN but not `4y3m2d`
     */
    unique: boolean;

    /**
     * displays as colons: `5h 1m 45s 24ms` → `5:01:45.24`
     */
    colonify: boolean;

    /**
     * only show the first unit: `1h 10m` → `1h`.
     */
    compact: boolean;

    /**
     * Use full-length units: `5h 1m 45s` → `5 hours 1 minute 45 seconds`.
     * @default false
     */
    verbose: boolean;

    /**
     * Number of units to show. Setting `compact` to `true` overrides this option.
     * @default Infinity
     */
    units: number;

    /**
     * number of decimal points of the second sector: `13.0s` → `13.004s` if set to 3.
     * @default 1
     */
    secondsDigits?: number;

    /**
     * number of decimal points of the second sector: `13ms` → `13.01ms` if set to 2.
     * @default 0
     */
    msDigits: number;

    /**
     * fill up zeros: `10:2:1` → `10:02:01`
     *
     * default to true when `colonify`.
     */
    fillZero: boolean;

    omit: showKeys[];
}
export type showKeys = "ms" | "s" | "m" | "h" | "d" | "y";
export const Converts = { s, m, h, d, w, y } as const;
type Converts = typeof Converts;
export const ConvertMap = {
    years: y,
    year: y,
    yrs: y,
    yr: y,
    y: y,
    weeks: w,
    week: w,
    w: w,
    days: d,
    day: d,
    d: d,
    hours: h,
    hour: h,
    hrs: h,
    hr: h,
    h: h,
    minutes: m,
    minute: m,
    mins: m,
    min: m,
    m: m,
    seconds: s,
    second: s,
    secs: s,
    sec: s,
    s: s,
    milliseconds: 1,
    millisecond: 1,
    msecs: 1,
    msec: 1,
    ms: 1
} as const;

const singleMatch = /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i;
const compoundMatch = /(?<value>-?(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?/gi;

// prettier-ignore
export function parse(str: string, {
    compound = false,
    unique = false
}: Partial<Options> = {}): number {
    if (!compound) {
        const match = singleMatch.exec(str);
        const groups = match?.groups as { value: string; type?: string } | undefined;
        if (!groups) return NaN;
        const n = parseFloat(groups.value);
        const type = (groups.type || "ms").toLowerCase() as keyof typeof ConvertMap;
        if (!compound) return ConvertMap[type] * n;
    } else {
        let num = 0;
        const used: (Converts[keyof Converts] | 1)[] = [];
        const check = str.replace(compoundMatch, (_origin, _value, _type, _index, _match, groups: { value: string; type?: string }) => {
            const n = parseFloat(groups.value);
            const type = (groups.type || "ms").toLowerCase() as keyof typeof ConvertMap;
            num += ConvertMap[type] * n;
            if (unique) {
                // this makes it return NaN
                if (used.includes(ConvertMap[type])) return "error";
                used.push(ConvertMap[type]);
            }
            return "";
        });

        if (check.trim() !== "") return NaN;
        return num;
    }
}

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

// prettier-ignore
function format(ms: number, { 
    compact = false, 
    verbose = false,
    secondsDigits = 1,
    msDigits = 0,
    colonify = false,
    units = Infinity,
    fillZero = false,
    omit = []
}: Partial<Options> = {}) {
    const parsed = parseMs(ms);

    if(colonify && (compact || verbose)) throw new Error("colonify cannot include compact or verbose or it will broke");
    
    if(colonify) fillZero = true;
    if(colonify || verbose) secondsDigits = 0;

    const pluralize = (word: string, count: number) => (count === 1 ? word : `${word}s`);

    const result: string[] = [];

    let emptyified = false;
    const add = (value: number, long: string, short: string, valstr?: string) => {
        if(omit.includes(short as showKeys)) return;
        valstr = (valstr || value || 0).toString();
        if ((!colonify && value === 0) || (colonify && short === "m")) return;
        let prefix, suffix;
        if (colonify) {
            if (value === 0 && !emptyified) return;
            else emptyified = true;
            prefix = result.length > 0 ? short === "ms" ? "." : ":" : "";
            suffix = "";
            const wholeDigits = valstr.includes(".") ? valstr.split(".")[0].length : valstr.length;
            const minLength = result.length > 0 ? 2 : 1;
            valstr = "0".repeat(Math.max(0, minLength - wholeDigits)) + valstr;
        } else {
            prefix = "";
            suffix = verbose ? " " + pluralize(long, value) : short;
        }

        result.push(`${prefix}${valstr}${suffix}`);
    };
    add(Math.trunc(parsed.d / 365), "year", "y");
    add(parsed.d % 365, "day", "d");
    add(parsed.h, "hour", "h");
    add(parsed.m, "minute", "m");

    add(parsed.s, "second", "s", parsed.s === 0 ? "0" : parsed.s.toFixed(secondsDigits));

    add(parsed.ms, "millisecond", "ms", parsed.ms === 0 ? "0" : parsed.ms.toFixed(msDigits));

    if (result.length === 0) {
        return "0" + (verbose ? " milliseconds" : "ms");
    }
    if (compact) {
        return result[0];
    }
    if (typeof units === "number") {
        const separator = colonify ? "" : " ";
        return result.slice(0, Math.max(units, 1)).join(separator);
    }

    return result.join("");
}

export default function ms(value: string, options?: Partial<Options>): number;
export default function ms(value: number, options?: Partial<Options>): string;
export default function ms(value: string | number, options?: Partial<Options>): number | string {
    try {
        if (typeof value === "string" && value.length > 0) {
            return parse(value, options);
        } else if (typeof value === "number" && isFinite(value)) {
            return format(value, options);
        }
        throw new Error("Value is not a string or number.");
    } catch (error) {
        const message = isError(error) ? `${error.message}. value=${JSON.stringify(value)}` : "An unknown error has occurred.";
        throw new Error(message);
    }
}

function isError(value: unknown): value is Error {
    return typeof value === "object" && value !== null && "message" in value;
}
