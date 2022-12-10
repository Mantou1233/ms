// helpers
const s = 1000 as const;
const m = 60000 as const;
const h = 3600000 as const;
const d = 86400000 as const;
const w = 604800000 as const;
const y = 31557600000 as const;

interface Options {
    /**
     * should allow multiple inputs, e.g. `2y3s`
     */
    compound: boolean;
    /**
     * should allow multiple inputs, e.g. `2y3y4y` will throw error but not `4y3m2d`
     */
    unique: boolean;
}
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

export function parse(
    str: string,
    { compound, unique }: Partial<Options> = {
        compound: false,
        unique: false
    }
): number {
    if(!compound){
        const match = singleMatch.exec(str);
        const groups = match?.groups as { value: string; type?: string } | undefined;
        if (!groups) return NaN;
        const n = parseFloat(groups.value);
        const type = (groups.type || "ms").toLowerCase() as keyof typeof ConvertMap;
        if (!compound) return ConvertMap[type] * n;
    }
    else {
        let num = 0;
        const used: (Converts[keyof Converts] | 1)[] = [];
        const check = str.replace(compoundMatch, (_origin, _value, _type, _index, _match, groups: { value: string; type?: string }) => {
            const n = parseFloat(groups.value);
            const type = (groups.type || "ms").toLowerCase() as keyof typeof ConvertMap;
            num += ConvertMap[type] * n;
            if (unique){
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

export default function ms(value: string, options?: Partial<Options>): string;
export default function ms(value: number, options?: Partial<Options>): number;
export default function ms(value: string | number, options?: Partial<Options>): number | string {
    try {
        if (typeof value === "string" && value.length > 0) {
            return parse(value, options);
        } else if (typeof value === "number" && isFinite(value)) {
            return "0s";
        }
        throw new Error("Value is not a string or number.");
    } catch (error) {
        const message = isError(error) ? `${error.message}. value=${JSON.stringify(value)}` : "An unknown error has occurred.";
        throw new Error(message);
    }
}

function isError(value: unknown): value is Error {
  return typeof value === 'object' && value !== null && 'message' in value;
}