import * as geometry from "../geometry";
jest.mock("../consts");
jest.mock("../mesh");

describe("meshes", () => {
  beforeAll(() => {
    geometry.setup();
  });

  it("is properly set up", () => {
    // TODO
  });

  it("increment index", () => {
    expect(geometry.__TEST_ONLY__.index).toBe(0);
    geometry.append([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [30, 30], [100, 100]);
    expect(geometry.__TEST_ONLY__.index).toBe(1);
  });

  it("move to the next mesh once current is full", () => {
    // TODO
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
