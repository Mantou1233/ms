import ms, { Converts } from "../src";

describe("ms(string)", () => {
    it("should not throw an error", () => {
        expect(() => {
            ms("1m");
        }).not.toThrowError();
    });

    it("should preserve ms", () => {
        expect(ms("100")).toBe(100);
    });

    it("should convert from m to ms", () => {
        expect(ms("1m")).toBe(60000);
    });

    it("should convert from h to ms", () => {
        expect(ms("1h")).toBe(3600000);
    });

    it("should convert d to ms", () => {
        expect(ms("2d")).toBe(172800000);
    });

    it("should convert w to ms", () => {
        expect(ms("3w")).toBe(1814400000);
    });

    it("should convert s to ms", () => {
        expect(ms("1s")).toBe(1000);
    });

    it("should convert ms to ms", () => {
        expect(ms("100ms")).toBe(100);
    });

    it("should convert y to ms", () => {
        expect(ms("1y")).toBe(31557600000);
    });

    it("should work with decimals", () => {
        expect(ms("1.5h")).toBe(5400000);
    });

    it("should work with multiple spaces", () => {
        expect(ms("1   s")).toBe(1000);
    });

    it("should return NaN if invalid", () => {
        expect(isNaN(ms("☃"))).toBe(true);
        expect(isNaN(ms("10-.5"))).toBe(true);
        expect(isNaN(ms("ms"))).toBe(true);
    });

    it("should be case-insensitive", () => {
        expect(ms("1.5H")).toBe(5400000);
    });

    it("should work with numbers starting with .", () => {
        expect(ms(".5ms")).toBe(0.5);
    });

    it("should work with negative integers", () => {
        expect(ms("-100ms")).toBe(-100);
    });

    it("should work with negative decimals", () => {
        expect(ms("-1.5h")).toBe(-5400000);
        expect(ms("-10.5h")).toBe(-37800000);
    });

    it('should work with negative decimals starting with "."', () => {
        expect(ms("-.5h")).toBe(-1800000);
    });
});

describe("ms(string with multiple ms)", () => {
    it("should not throw an error", () => {
        expect(() => {
            ms("1m3s");
        }).not.toThrowError();
    });

    it("should handle ints", () => {
        expect(
            ms("2m1s", {
                compound: true
            })
        ).toBe(Converts.m * 2 + Converts.s);
    });

    it("should handle floats", () => {
        expect(
            ms("54.2m14.2s", {
                compound: true
            })
        ).toBe(Converts.m * 54.2 + Converts.s * 14.2);
    });

    it("should handle all", () => {
        expect(
            ms("1s 5m 8h 9d 3w 4y", {
                compound: true
            })
        ).toBe(
            Converts.y * 4 +
            Converts.w * 3 +
            Converts.d * 9 +
            Converts.h * 8 +
            Converts.m * 5 +
            Converts.s * 1
        );
    });

    it("should throw error on duplicate when unique", () => {
        expect(
            isNaN(ms("1s 2s", {
                compound: true,
                unique: true
            }))
        ).toBe(true);
    });
});

describe("ms(number)", () => {
    it("should not throw an error", () => {
        expect(() => {
            ms(114514);
        }).not.toThrowError();
    });

    it("should handle ms", () => {
        expect(
            ms(ms("15ms"))
        ).toBe("15ms");
    });

    it("should handle seconds", () => {
        expect(
            ms(ms("53s"))
        ).toBe("53.0s");
    });

    it("should handle all", () => {
        expect(
            ms(
                ms("1s 5m 8h", {
                    compound: true
                })
            )
        ).toBe("8h 5m 1.0s");
    });
});