import { DEV, LINES_IN_BUFFER, ZOOM } from "./consts";
import { Point } from "./vectors";
import mesh, { Mesh } from "./mesh";

let index = 0; // At which index the next line can be added.
let history: number[] = [];
let historyIndex = -1;
let meshes: Mesh[] = [];
let shapes: Point[][] = [];
let accumulatingShape: Point[] = [];

export const undo = () => {
  if (historyIndex >= 0) {
    historyIndex -= 1;
    const previous = Math.floor(index / LINES_IN_BUFFER);
    index = history[historyIndex] || 0;
    const current = Math.floor(index / LINES_IN_BUFFER);
    for (let i = previous; i > current; i--) {
      mesh.update(meshes[i], 0);
    }
    mesh.update(meshes[current], index);
  }
};

export const redo = () => {
  if (historyIndex !== history.length - 1) {
    historyIndex += 1;
    const current = Math.floor(index / LINES_IN_BUFFER);
    index = history[historyIndex];
    const next = Math.floor(index / LINES_IN_BUFFER);
    for (let i = current; i < next; i++) {
      mesh.update(meshes[i], LINES_IN_BUFFER - 1);
    }
    mesh.update(meshes[next], index);
  }
};

export const mouseUp = () => {
  if (accumulatingShape.length === 0) {
    return;
  }

  history = [...history.slice(0, historyIndex + 1), index];
  historyIndex += 1;

  if (!DEV && !window.onbeforeunload) {
    window.onbeforeunload = (event: BeforeUnloadEvent) => {
      if (shapes.length > 0) {
        // Prevent unload only if there is some user-created content.
        event.returnValue =
          "This value apparently can be anything that casts to true";
      }
    };
  }

  shapes = [...shapes.slice(0, historyIndex + 1), accumulatingShape];
  accumulatingShape = [];
};

export const append = (numbers: number[], a: Point, b: Point) => {
  // If user draws a new thing, reset all diverged history by dropping buffers.
  const current = Math.floor(index / LINES_IN_BUFFER);
  if (current < meshes.length) {
    meshes.splice(current + 1, meshes.length - current);
  }

  // TODO: `accumulatingShape` is missing the first point.
  // TODO: If distance to previous point is huge, sample several points from a bezier curve.

  accumulatingShape.push(b);

  mesh.appendValues(meshes[current], index, numbers);

  if (index % LINES_IN_BUFFER === LINES_IN_BUFFER - 1) {
    meshes.push({ object: mesh.create() });
  }

  mesh.update(meshes[current], (index % LINES_IN_BUFFER) + 1);
  index += 1;
};

export const clear = () => {
  index = 0;
  history = [];
  historyIndex = 0;
  meshes = [];
  shapes = [];
  accumulatingShape = [];
};

export const getSvg = () => {
  // TODO: Add padding to exported image so lines that are touching borders are not cut.

  let mostLeft = Infinity;
  let mostRight = -Infinity;
  let mostTop = Infinity;
  let mostBottom = -Infinity;

  shapes = [...shapes.slice(0, historyIndex + 1)];

  for (const shape of shapes) {
    for (const point of shape) {
      if (point[0] < mostLeft) {
        mostLeft = point[0];
      }
      if (point[0] > mostRight) {
        mostRight = point[0];
      }
      if (point[1] < mostTop) {
        mostTop = point[1];
      }
      if (point[1] > mostBottom) {
        mostBottom = point[1];
      }
    }
  }

  const paths = shapes
    .map((shape) => {
      const start = `M ${(shape[0][0] - mostLeft) / ZOOM} ${
        (shape[0][1] - mostTop) / ZOOM
      }`;
      const rest = shape
        .slice(1, shape.length)
        .map(
          (point) =>
            `L ${(point[0] - mostLeft) / ZOOM} ${(point[1] - mostTop) / ZOOM}`
        )
        .join(" ");

      const path = `${start} ${rest}`;
      return `<path d="${path}" />`;
    })
    .join(" ");

  const width = (mostRight - mostLeft) / ZOOM;
  const height = (mostBottom - mostTop) / ZOOM;

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  fill="transparent"
  stroke="black"
  stroke-width="2">
    ${paths}
</svg>`;
};

export const setup = () => {
  meshes.push({ object: mesh.create() });
};

export const __TEST_ONLY__ = {
  meshes,
  history,
  shapes,
  accumulatingShape,
  get index() {
    return index;
  },
  get historyIndex() {
    return historyIndex;
  },
};
