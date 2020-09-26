import * as geometry from "../geometry";
jest.mock("../consts");
jest.mock("../mesh");

// BUGS:
// - First line is lost in export.

const line = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const getLine = (number: number) => new Array(18).fill(number);

describe("meshes", () => {
  beforeAll(() => {
    geometry.setup();
  });

  it("is properly set up", () => {
    // TODO
  });

  it("increment index", () => {
    expect(geometry.__TEST_ONLY__.index).toBe(0);
    geometry.append(getLine(1), [1, 1], [2, 2]);
    expect(geometry.__TEST_ONLY__.index).toBe(1);
  });

  it("move to the next mesh once current is full", () => {
    geometry.append(getLine(2), [30, 30], [3, 3]);
    geometry.append(getLine(3), [30, 30], [4, 4]);
    geometry.append(getLine(4), [30, 30], [5, 5]);
    geometry.append(getLine(5), [30, 30], [6, 6]);
    geometry.append(getLine(6), [30, 30], [7, 7]);
    console.log(geometry.__TEST_ONLY__.meshes.map((m) => m.object.points));
    console.log(geometry.__TEST_ONLY__.meshes.map((m) => m.object.range));
  });

  it("move to the next mesh when object to append won't fit", () => {
    // TODO
  });

  it("move to the previous index when CMD+Z", () => {
    // TODO
  });

  it("dereference the next mesh if history starts to diverge", () => {
    // TODO
  });

  it("exported shape contains all lines", () => {
    // TODO
  });

  xit("", () => {
    // TODO
  });
});
