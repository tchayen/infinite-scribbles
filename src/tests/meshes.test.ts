import { append, undo, __TEST_ONLY__ } from "../meshes";

describe("meshes", () => {
  it("is properly set up", () => {
    // TODO
  });

  it("increment index", () => {
    console.log(__TEST_ONLY__);
    append([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [30, 30], [100, 100]);
    console.log(__TEST_ONLY__);
    // TODO
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

  it("", () => {
    // TODO
  });
});
