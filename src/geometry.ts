import {
  LineToCommand,
  MoveToCommand,
  parseSVG as parsePath,
} from "svg-path-parser";
import { DEV, LINES_IN_BUFFER, LINE_WIDTH, ZOOM } from "./consts";
import { getLine, Point } from "./vectors";
import mesh, { Mesh } from "./mesh";
import { renderer } from "./three";

let index = 0; // At which index the next line can be added.
let history: number[] = [0];
let historyIndex = 0;
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
    mesh.update(meshes[current], index % LINES_IN_BUFFER);
  }
};

export const redo = () => {
  if (historyIndex !== history.length - 1) {
    historyIndex += 1;
    const current = Math.floor(index / LINES_IN_BUFFER);
    index = history[historyIndex];
    const next = Math.floor(index / LINES_IN_BUFFER);
    for (let i = current; i < next; i++) {
      mesh.update(meshes[i], LINES_IN_BUFFER);
    }
    mesh.update(meshes[next], index % LINES_IN_BUFFER);
  }
};

export const flush = () => {
  if (accumulatingShape.length === 0) {
    return;
  }

  history.push(index);
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
  // User started drawing something new so we prevent redoing previous shapes.
  if (historyIndex < history.length) {
    history = [...history.slice(0, historyIndex + 1)];
    shapes = [...shapes.slice(0, historyIndex)];
  }

  // This is the first line in the shape so `a` should be preserved.
  if (accumulatingShape.length === 0) {
    accumulatingShape.push(a);
  }

  // If user draws a new thing, reset all diverged history by dropping buffers.
  const current = Math.floor(index / LINES_IN_BUFFER);
  if (current < meshes.length) {
    meshes.splice(current + 1, meshes.length - current);
  }

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
  history = [0];
  historyIndex = 0;
  meshes = [];
  shapes = [];
  accumulatingShape = [];
};

export const importSvg = async (file: File) => {
  const text = await file.text();

  console.log({ text });

  const paths = [...text.matchAll(/(?<=d=")[ML\d ]+(?=")/g)].map(
    (matches) => matches[0]
  );
  console.log({ paths });
  const instructions = paths.map((path) => parsePath(path));
  console.log({ instructions });

  let previous: Point | null = null;

  const shapes: Point[][] = [];

  for (const set of instructions) {
    for (const c of set) {
      const command = c as MoveToCommand | LineToCommand;

      if ("x" in command) {
        if (command.code === "M") {
          previous = [command.x, command.y];
          shapes.push([]);
        } else if (command.code === "L") {
          if (previous === null) {
            throw new Error("Start point is missing");
          }

          const a = previous;
          const b: Point = [command.x, command.y];
          shapes[shapes.length - 1].push(a, b);
        }
      }
    }
  }
  console.log({ shapes });

  for (const shape of shapes) {
    for (let i = 1; i < shapes.length; i++) {
      const a = shape[i - 1];
      const b = shape[i];

      console.log(getLine(a, b, LINE_WIDTH), a, b);
      append(getLine(a, b, LINE_WIDTH), a, b);
    }
    flush();
  }
};

export const getSvg = () => {
  // TODO: Add padding to exported image so lines that are touching borders are not cut.

  shapes = [...shapes.slice(0, historyIndex)];

  let mostLeft = Infinity;
  let mostRight = -Infinity;
  let mostTop = Infinity;
  let mostBottom = -Infinity;

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
    .join("\n    ");

  const width = (mostRight - mostLeft) / ZOOM;
  const height = (mostBottom - mostTop) / ZOOM;

  return `<svg
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

  renderer.domElement.ondrop = (event) => {
    event.preventDefault();

    if (event.dataTransfer === null) {
      return;
    }

    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const file = event.dataTransfer.files[i];
        importSvg(file);
      }
    } else {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        importSvg(file);
      }
    }
  };

  renderer.domElement.ondragover = (event) => {
    event.preventDefault();
  };
};

export const __TEST_ONLY__ = {
  get meshes() {
    return meshes;
  },
  get history() {
    return history;
  },
  get shapes() {
    return shapes;
  },
  get accumulatingShape() {
    return accumulatingShape;
  },
  get index() {
    return index;
  },
  get historyIndex() {
    return historyIndex;
  },
};
