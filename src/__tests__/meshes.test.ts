import * as geometry from "../geometry";
jest.mock("../consts");
jest.mock("../mesh");

const line = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const getLine = (number: number) => new Array(18).fill(number);

it("clear works", () => {
  const {
    index,
    history,
    historyIndex,
    meshes,
    shapes,
    accumulatingShape,
  } = geometry.__TEST_ONLY__;

  geometry.clear();

  const after = geometry.__TEST_ONLY__;

  expect(index).toBe(after.index);
  expect(history).toStrictEqual(after.history);
  expect(historyIndex).toBe(after.historyIndex);
  expect(meshes).toStrictEqual(after.meshes);
  expect(shapes).toStrictEqual(after.shapes);
  expect(accumulatingShape).toStrictEqual(after.accumulatingShape);
});

describe("meshes", () => {
  beforeEach(() => {
    geometry.clear();
    geometry.setup();
  });

  it("is properly set up", () => {
    // TODO
  });

  it("increments index", () => {
    expect(geometry.__TEST_ONLY__.index).toBe(0);
    geometry.append(getLine(1), [1, 1], [2, 2]);
    geometry.flush();
    expect(geometry.__TEST_ONLY__.index).toBe(1);
  });

  it("moves to the next mesh once current is full", () => {
    geometry.append(getLine(1), [30, 30], [3, 3]);
    geometry.append(getLine(2), [30, 30], [4, 4]);
    geometry.append(getLine(3), [30, 30], [5, 5]);
    geometry.append(getLine(4), [30, 30], [6, 6]);
    geometry.append(getLine(5), [30, 30], [7, 7]);
    geometry.append(getLine(6), [30, 30], [8, 8]);
    geometry.flush();

    expect(geometry.__TEST_ONLY__.meshes[0].object.points[24]).toBe(2);
    expect(geometry.__TEST_ONLY__.meshes[1].object.points[5]).toBe(6);
  });

  describe("undo and redo", () => {
    it("moves index to the previous value when undoing but leaving the next buffer", () => {
      geometry.append(getLine(1), [30, 30], [3, 3]);
      geometry.append(getLine(2), [30, 30], [4, 4]);
      geometry.append(getLine(3), [30, 30], [5, 5]);
      geometry.append(getLine(4), [30, 30], [6, 6]);
      geometry.append(getLine(5), [30, 30], [7, 7]);
      geometry.append(getLine(6), [30, 30], [8, 8]);
      geometry.flush();

      console.log(
        geometry.__TEST_ONLY__.history,
        geometry.__TEST_ONLY__.historyIndex,
        geometry.__TEST_ONLY__.index,
        geometry.__TEST_ONLY__.meshes
      );
      // expect(geometry.__TEST_ONLY__.meshes[0].object.range).toBe(5);
      geometry.undo();
      console.log(
        geometry.__TEST_ONLY__.history,
        geometry.__TEST_ONLY__.historyIndex
      );
      // expect(geometry.__TEST_ONLY__.meshes[0].object.range).toBe(0);
      geometry.redo();
      console.log(
        geometry.__TEST_ONLY__.history,
        geometry.__TEST_ONLY__.historyIndex
      );
    });

    it("", () => {});

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
