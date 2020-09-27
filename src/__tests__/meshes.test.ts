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
    it("undo across buffers", () => {
      geometry.append(getLine(1), [30, 30], [3, 3]);
      geometry.append(getLine(2), [30, 30], [4, 4]);
      geometry.append(getLine(3), [30, 30], [5, 5]);
      geometry.append(getLine(4), [30, 30], [6, 6]);
      geometry.append(getLine(5), [30, 30], [7, 7]);
      geometry.append(getLine(6), [30, 30], [8, 8]);
      geometry.flush();

      expect(geometry.__TEST_ONLY__.meshes[0].object.range).toBe(5);

      geometry.undo();

      expect(geometry.__TEST_ONLY__.meshes[0].object.range).toBe(0);
      expect(geometry.__TEST_ONLY__.meshes[1].object.range).toBe(0);
    });

    it("redo across buffers", () => {
      geometry.append(getLine(1), [30, 30], [3, 3]);
      geometry.append(getLine(2), [30, 30], [4, 4]);
      geometry.append(getLine(3), [30, 30], [5, 5]);
      geometry.append(getLine(4), [30, 30], [6, 6]);
      geometry.append(getLine(5), [30, 30], [7, 7]);
      geometry.append(getLine(6), [30, 30], [8, 8]);
      geometry.flush();

      geometry.undo();

      geometry.redo();

      expect(geometry.__TEST_ONLY__.meshes[0].object.range).toBe(5);
      expect(geometry.__TEST_ONLY__.meshes[1].object.range).toBe(1);
    });

    it("dereferences the next mesh if history starts to diverge", () => {
      geometry.append(getLine(1), [30, 30], [3, 3]);
      geometry.append(getLine(2), [30, 30], [4, 4]);
      geometry.append(getLine(3), [30, 30], [5, 5]);
      geometry.append(getLine(4), [30, 30], [6, 6]);
      geometry.append(getLine(5), [30, 30], [7, 7]);
      geometry.append(getLine(6), [30, 30], [8, 8]);
      geometry.flush();
      expect(geometry.__TEST_ONLY__.history).toStrictEqual([0, 6]);

      geometry.undo();
      expect(geometry.__TEST_ONLY__.history).toStrictEqual([0, 6]);

      geometry.append(getLine(1), [10, 10], [20, 20]);
      geometry.append(getLine(2), [20, 20], [30, 30]);

      expect(geometry.__TEST_ONLY__.history).toStrictEqual([0]);

      geometry.flush();

      expect(geometry.__TEST_ONLY__.history).toStrictEqual([0, 2]);
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
