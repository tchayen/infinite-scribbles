import * as geometry from "../geometry";
jest.mock("../consts");
jest.mock("../mesh");

const line = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const getLine = (number: number) => new Array(18).fill(number);

describe("meshes", () => {
  beforeAll(() => {
    geometry.setup();
  });

  it("is properly set up", () => {
    // TODO
  });

  it("increments index", () => {
    expect(geometry.__TEST_ONLY__.index).toBe(0);
    geometry.append(getLine(1), [1, 1], [2, 2]);
    expect(geometry.__TEST_ONLY__.index).toBe(1);
  });

  it("moves to the next mesh once current is full", () => {
    geometry.append(getLine(2), [30, 30], [3, 3]);
    geometry.append(getLine(3), [30, 30], [4, 4]);
    geometry.append(getLine(4), [30, 30], [5, 5]);
    geometry.append(getLine(5), [30, 30], [6, 6]);
    geometry.append(getLine(6), [30, 30], [7, 7]);

    // TODO: write some `expect` statement.

    console.log(geometry.__TEST_ONLY__.meshes.map((m) => m.object.points));
    console.log(geometry.__TEST_ONLY__.meshes.map((m) => m.object.range));
  });

  describe("undo and redo", () => {
    it("moves to the next mesh when object to append won't fit", () => {
      // TODO
    });

    it("moves index to the previous index when undoing but leaving the next buffer", () => {
      // TODO:
      // - Check that index moves back.
      // - Make sure that range of the next buffer is set to 0.
      // - Make sure that the next buffer is preserved.
    });

    it("dereferences the next mesh if history starts to diverge", () => {
      // TODO:
      // - Check that length of buffers array decreases.
    });
  });

  describe("exported shape", () => {
    it("contains all lines", () => {
      // BUGS:
      // - First line is lost in export.
      // - Undo and redo don't work across buffers.
      //
      // TODO:
      // - clear()
      // - Add several lines.
      // - Check.
    });

    it("works for several buffers", () => {
      // TODO
    });
  });

  xit("", () => {
    // TODO
  });
});
