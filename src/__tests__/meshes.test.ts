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
    beforeEach(() => {
      geometry.append(getLine(1), [0, 0], [10, 10]);
      geometry.append(getLine(2), [10, 10], [10, 100]);
      geometry.append(getLine(3), [10, 100], [100, 100]);
      geometry.append(getLine(3), [100, 100], [100, 10]);
      geometry.append(getLine(4), [100, 10], [10, 10]);
      geometry.flush();

      geometry.append(getLine(5), [0, 0], [110, 0]);
      geometry.append(getLine(5), [110, 0], [100, 10]);
      geometry.flush();
    });

    it("contains all lines", () => {
      expect(geometry.__TEST_ONLY__.shapes).toStrictEqual([
        [
          [0, 0],
          [10, 10],
          [10, 100],
          [100, 100],
          [100, 10],
          [10, 10],
        ],
        [
          [0, 0],
          [110, 0],
          [100, 10],
        ],
      ]);
    });

    it("generates proper svg", () => {
      const result = `<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="55"\n  height="50"\n  fill="transparent"\n  stroke="black"\n  stroke-width="2">\n    <path d="M 0 0 L 5 5 L 5 50 L 50 50 L 50 5 L 5 5" />\n    <path d="M 0 0 L 55 0 L 50 5" />\n</svg>`;
      expect(geometry.getSvg()).toBe(result);
    });

    it("undoed shapes don't end up there", () => {
      geometry.append(getLine(1), [0, 0], [10, 10]);
      geometry.append(getLine(2), [10, 10], [10, 100]);
      geometry.append(getLine(3), [10, 100], [100, 100]);
      geometry.append(getLine(3), [100, 100], [100, 10]);
      geometry.append(getLine(4), [100, 10], [10, 10]);
      geometry.flush();

      geometry.append(getLine(5), [0, 0], [110, 0]);
      geometry.append(getLine(5), [110, 0], [100, 10]);
      geometry.flush();

      geometry.undo();

      expect(geometry.__TEST_ONLY__.shapes).toStrictEqual([
        [
          [0, 0],
          [10, 10],
          [10, 100],
          [100, 100],
          [100, 10],
          [10, 10],
        ],
      ]);
    });

    it("undoed but redoed shapes end up there", () => {
      // TODO
    });
  });
});
