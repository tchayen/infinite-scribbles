import { lineIntersection, Point } from "../vectors";

describe("lineIntersection", () => {
  it("returns true for basic example", () => {
    const a: Point = [1, 1];
    const b: Point = [3, 3];
    const c: Point = [2, 1];
    const d: Point = [2, 3];

    expect(lineIntersection(a, b, c, d)).toBe(true);
  });

  it("returns false for segments that cross on extensions", () => {
    const a: Point = [1, 1];
    const b: Point = [3, 3];
    const c: Point = [2, 3];
    const d: Point = [2, 10];

    expect(lineIntersection(a, b, c, d)).toBe(false);
  });

  it("works for colinear segments", () => {
    const a: Point = [0, 0];
    const b: Point = [0, 3];
    const c: Point = [2, 0];
    const d: Point = [2, 3];

    expect(lineIntersection(a, b, c, d)).toBe(false);
  });
});
